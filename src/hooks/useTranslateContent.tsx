import { useEffect, useState } from 'react';
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

  useEffect(() => {
    let cancelled = false;
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
        const out = await translateBatch(text, i18n.language);
        if (cancelled) return;
        if (!translationCache[cacheKey]) translationCache[cacheKey] = {};
        translationCache[cacheKey][i18n.language] = out;
        setTranslatedText(out);
      } catch (e) {
        console.error('Translation error:', e);
        if (!cancelled) setTranslatedText(text);
      } finally {
        if (!cancelled) setIsTranslating(false);
      }
    };

    translate();
    return () => { cancelled = true; };
  }, [text, i18n.language, fieldKey]);

  return { translatedText, isTranslating };
};
