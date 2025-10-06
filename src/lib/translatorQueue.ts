import { supabase } from '@/integrations/supabase/client';

// Cache com expiração (30 minutos)
const cache: Record<string, { text: string; timestamp: number }> = {};
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

// Pendências por idioma
type Pending = { text: string; resolve: (s: string) => void; reject: (e: any) => void };
const pendingByLang: Record<string, Pending[]> = {};
const scheduled: Record<string, number | undefined> = {};

const SEP = '\n<<<SEP>>>'; // separador estável

function cacheKey(text: string, lang: string) {
  return `${lang}::${text}`;
}

// Limpar cache expirado periodicamente
setInterval(() => {
  const now = Date.now();
  Object.keys(cache).forEach(key => {
    if (now - cache[key].timestamp > CACHE_DURATION) {
      delete cache[key];
    }
  });
}, 1000 * 60 * 5); // Limpar a cada 5 minutos


async function flush(lang: string) {
  const pendings = pendingByLang[lang];
  if (!pendings || pendings.length === 0) return;
  pendingByLang[lang] = [];
  scheduled[lang] = undefined;

  // Dedup por texto
  const texts: string[] = [];
  const positions: number[] = []; // mapeia cada pending para o índice em texts
  const mapIndex: Record<string, number> = {};

  for (const p of pendings) {
    const key = cacheKey(p.text, lang);
    const cached = cache[key];
    
    // Verificar cache com timestamp
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      p.resolve(cached.text);
      continue;
    }
    
    if (mapIndex[p.text] === undefined) {
      mapIndex[p.text] = texts.length;
      texts.push(p.text);
    }
    positions.push(mapIndex[p.text]);
  }

  if (texts.length === 0) return; // tudo veio do cache

  try {
    const { data, error } = await supabase.functions.invoke('translate', {
      body: { texts, targetLanguage: lang },
    });

    if (error) throw error;

    const translatedTexts: string[] = Array.isArray(data?.translatedTexts)
      ? data.translatedTexts
      : typeof data?.translatedText === 'string'
      ? [data.translatedText]
      : [];

    // Armazena em cache com timestamp
    const now = Date.now();
    texts.forEach((t, i) => {
      const out = translatedTexts[i] ?? t;
      cache[cacheKey(t, lang)] = { text: out, timestamp: now };
    });

    // Resolve cada pending na ordem
    let idx = 0;
    for (const p of pendings) {
      const key = cacheKey(p.text, lang);
      const cached = cache[key];
      if (cached) {
        p.resolve(cached.text);
      } else {
        const mapped = translatedTexts[positions[idx] ?? 0] ?? p.text;
        p.resolve(mapped);
      }
      idx++;
    }
  } catch (e) {
    // Em erro, devolve original
    for (const p of pendings) p.resolve(p.text);
  }
}

export function translateBatch(text: string, lang: string): Promise<string> {
  if (!text) return Promise.resolve('');
  
  // Trim para evitar cache miss por espaços
  const trimmedText = text.trim();
  const key = cacheKey(trimmedText, lang);
  
  // Verificar cache com timestamp
  const cached = cache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return Promise.resolve(cached.text);
  }

  return new Promise((resolve, reject) => {
    pendingByLang[lang] = pendingByLang[lang] || [];
    pendingByLang[lang].push({ text: trimmedText, resolve, reject });

    // Batching mais rápido: 80ms para lotes pequenos, 150ms para grandes
    if (!scheduled[lang]) {
      const delay = pendingByLang[lang].length > 5 ? 150 : 80;
      scheduled[lang] = window.setTimeout(() => flush(lang), delay);
    }
  });
}
