import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

interface TranslatedContent {
  [key: string]: {
    [lang: string]: string;
  };
}

const translationCache: TranslatedContent = {};

// Global de-dup + fila simples para evitar rate limit (429)
const inFlight: Record<string, Promise<string>> = {};
let queue = Promise.resolve<void>(undefined);
let lastCallTs = 0;
const MIN_DELAY_MS = 800; // Aumentado para 800ms para evitar rate limit

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function withQueue<T>(fn: () => Promise<T>): Promise<T> {
  const next = queue.then(async () => {
    const now = Date.now();
    const wait = Math.max(0, MIN_DELAY_MS - (now - lastCallTs));
    if (wait) await sleep(wait);
    lastCallTs = Date.now();
    return await fn();
  });
  // Mantém a fila encadeada
  queue = next.then(() => undefined).catch(() => undefined);
  return next;
}

async function invokeTranslateWithRetry(text: string, targetLanguage: string, attempt = 0): Promise<string> {
  return withQueue(async () => {
    const { data, error } = await supabase.functions.invoke('translate', {
      body: { text, targetLanguage }
    });

    const status = (error as any)?.status as number | undefined;
    const message = (error?.message || data?.error || '').toString();

    if (status === 402) {
      throw new Error('Limite de créditos de IA atingido.');
    }

    // Trata 429 do gateway (ou encapsulado em 500 com mensagem)
    if (status === 429 || message.includes('429') || message.includes('Rate limit')) {
      if (attempt < 5) {
        const backoff = 2000 * Math.pow(2, attempt); // Exponential backoff: 2s, 4s, 8s, 16s, 32s
        console.log(`Rate limit hit, retrying in ${backoff}ms (attempt ${attempt + 1}/5)`);
        await sleep(backoff);
        return invokeTranslateWithRetry(text, targetLanguage, attempt + 1);
      }
      // Sem sucesso após retries: devolve original
      console.warn('Max retries reached, returning original text');
      return text;
    }

    if (error) {
      console.error('Translation error:', error);
      return text;
    }

    return (data as any)?.translatedText ?? text;
  });
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
      const inflightKey = `${i18n.language}::${cacheKey}`;
      if (!inFlight[inflightKey]) {
        inFlight[inflightKey] = (async () => {
          const translated = await invokeTranslateWithRetry(text, i18n.language);
          if (!translationCache[cacheKey]) translationCache[cacheKey] = {};
          translationCache[cacheKey][i18n.language] = translated;
          return translated;
        })();
      }

      try {
        const translated = await inFlight[inflightKey];
        setTranslatedText(translated);
      } catch (e) {
        console.error('Translation error:', e);
        setTranslatedText(text);
      } finally {
        delete inFlight[inflightKey];
        setIsTranslating(false);
      }
    };

    translate();
  }, [text, i18n.language, fieldKey]);

  return { translatedText, isTranslating };
};