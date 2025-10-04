import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

interface TranslatedContent {
  [key: string]: {
    [lang: string]: string;
  };
}

const translationCache: TranslatedContent = {};

// Fila global para controlar rate limit
class TranslationQueue {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;
  private lastCallTime = 0;
  private readonly minDelay = 1000; // 1 segundo entre chamadas

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastCall = now - this.lastCallTime;
      
      if (timeSinceLastCall < this.minDelay) {
        await new Promise(resolve => setTimeout(resolve, this.minDelay - timeSinceLastCall));
      }
      
      const task = this.queue.shift();
      if (task) {
        this.lastCallTime = Date.now();
        await task();
      }
    }
    
    this.processing = false;
  }
}

const translationQueue = new TranslationQueue();

async function translateWithRetry(text: string, targetLang: string, attempt = 0): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('translate', {
      body: { text, targetLanguage: targetLang }
    });

    if (error) {
      const status = (error as any)?.status;
      if (status === 429 && attempt < 3) {
        // Rate limit: aguarda e tenta novamente
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
        return translateWithRetry(text, targetLang, attempt + 1);
      }
      throw error;
    }

    return data?.translatedText || text;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Retorna original em caso de erro
  }
}

export const useTranslateContent = (text: string, fieldKey: string) => {
  const { i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const translate = async () => {
      if (!text) {
        setTranslatedText(text);
        return;
      }

      const cacheKey = `${fieldKey}-${text}`;
      if (translationCache[cacheKey]?.[i18n.language]) {
        setTranslatedText(translationCache[cacheKey][i18n.language]);
        return;
      }

      setIsTranslating(true);
      try {
        const translated = await translationQueue.add(() => 
          translateWithRetry(text, i18n.language)
        );
        
        if (!translationCache[cacheKey]) {
          translationCache[cacheKey] = {};
        }
        translationCache[cacheKey][i18n.language] = translated;
        setTranslatedText(translated);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText(text);
      } finally {
        setIsTranslating(false);
      }
    };

    translate();
  }, [text, i18n.language, fieldKey]);

  return { translatedText, isTranslating };
};
