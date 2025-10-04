import { supabase } from '@/integrations/supabase/client';

// Cache simples em memória
const cache: Record<string, string> = {};

// Pendências por idioma
type Pending = { text: string; resolve: (s: string) => void; reject: (e: any) => void };
const pendingByLang: Record<string, Pending[]> = {};
const scheduled: Record<string, number | undefined> = {};

const SEP = '\n<<<SEP>>>'; // separador estável

function cacheKey(text: string, lang: string) {
  return `${lang}::${text}`;
}

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
    if (cache[key]) {
      p.resolve(cache[key]);
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

    // Armazena em cache por texto deduplicado
    texts.forEach((t, i) => {
      const out = translatedTexts[i] ?? t;
      cache[cacheKey(t, lang)] = out;
    });

    // Resolve cada pending na ordem
    let idx = 0;
    for (const p of pendings) {
      const key = cacheKey(p.text, lang);
      if (cache[key]) {
        p.resolve(cache[key]);
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
  const key = cacheKey(text, lang);
  if (cache[key]) return Promise.resolve(cache[key]);

  return new Promise((resolve, reject) => {
    pendingByLang[lang] = pendingByLang[lang] || [];
    pendingByLang[lang].push({ text, resolve, reject });

    // Micro-batch a cada 120ms por idioma
    if (!scheduled[lang]) {
      scheduled[lang] = window.setTimeout(() => flush(lang), 120);
    }
  });
}
