import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateText } from '@/lib/offlineTranslate';

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
        const translated = await translateText(text, i18n.language);
        
        // Salva no cache
        if (!translationCache[cacheKey]) {
          translationCache[cacheKey] = {};
        }
        translationCache[cacheKey][i18n.language] = translated;
        setTranslatedText(translated);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText(text); // Fallback para texto original
      } finally {
        setIsTranslating(false);
      }
    };

    translate();
  }, [text, i18n.language, fieldKey]);

  return { translatedText, isTranslating };
};
