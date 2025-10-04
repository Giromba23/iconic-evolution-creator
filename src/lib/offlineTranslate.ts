import { translate } from '@vitalets/google-translate-api';

// Cache de traduções para evitar chamadas repetidas
const translationCache: Record<string, Record<string, string>> = {};

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text) return '';
  
  // Normaliza a chave do cache
  const cacheKey = `${text.substring(0, 100)}`; // Usa apenas os primeiros 100 chars como chave
  
  // Verifica cache
  if (translationCache[cacheKey]?.[targetLang]) {
    return translationCache[cacheKey][targetLang];
  }

  try {
    const result = await translate(text, { to: targetLang });
    const translatedText = result.text;
    
    // Salva no cache
    if (!translationCache[cacheKey]) {
      translationCache[cacheKey] = {};
    }
    translationCache[cacheKey][targetLang] = translatedText;
    
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Retorna texto original em caso de erro
  }
}

// Limpa o cache se ficar muito grande
export function clearTranslationCache() {
  const keys = Object.keys(translationCache);
  if (keys.length > 1000) {
    Object.keys(translationCache).forEach(key => delete translationCache[key]);
  }
}
