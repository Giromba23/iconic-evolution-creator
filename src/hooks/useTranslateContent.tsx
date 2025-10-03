import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

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
      // Se o idioma é português ou o texto está vazio, não traduz
      if (i18n.language === 'pt' || !text) {
        setTranslatedText(text);
        return;
      }

      // Verifica cache
      const cacheKey = `${fieldKey}-${text}`;
      if (translationCache[cacheKey]?.[i18n.language]) {
        setTranslatedText(translationCache[cacheKey][i18n.language]);
        return;
      }

      setIsTranslating(true);
      try {
        const { data, error } = await supabase.functions.invoke('translate', {
          body: { 
            text, 
            targetLanguage: i18n.language 
          }
        });

        if (error) throw error;

        if (data?.translatedText) {
          // Salva no cache
          if (!translationCache[cacheKey]) {
            translationCache[cacheKey] = {};
          }
          translationCache[cacheKey][i18n.language] = data.translatedText;
          setTranslatedText(data.translatedText);
        }
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