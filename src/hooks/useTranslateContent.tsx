import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { translateBatch } from '@/lib/translatorQueue';

interface TranslatedContent {
  [key: string]: {
    [lang: string]: string;
  };
}

const translationCache: TranslatedContent = {};

export const useTranslateContent = (text: string, fieldKey: string) => {
  const { i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text);
  const [isTranslating, setIsTranslating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel previous translation if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const translate = async () => {
      const trimmedText = text?.trim();
      if (!trimmedText) {
        setTranslatedText(text);
        return;
      }

      const cacheKey = `${fieldKey}-${trimmedText}`;
      
      // Check cache first
      if (translationCache[cacheKey]?.[i18n.language]) {
        setTranslatedText(translationCache[cacheKey][i18n.language]);
        return;
      }

      // Don't translate if language is Portuguese (source language)
      if (i18n.language === 'pt') {
        setTranslatedText(trimmedText);
        return;
      }

      setIsTranslating(true);
      try {
        const translated = await translateBatch(trimmedText, i18n.language);
        
        if (controller.signal.aborted) return;
        
        // Cache the result
        if (!translationCache[cacheKey]) translationCache[cacheKey] = {};
        translationCache[cacheKey][i18n.language] = translated;
        
        setTranslatedText(translated);
      } catch (e) {
        console.error('Translation error:', e);
        if (!controller.signal.aborted) {
          setTranslatedText(trimmedText);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsTranslating(false);
        }
      }
    };

    translate();
    
    return () => {
      controller.abort();
    };
  }, [text, i18n.language, fieldKey]);

  return { translatedText, isTranslating };
};
