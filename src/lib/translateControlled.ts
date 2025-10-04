import { TFunction } from 'i18next';

export function translateTierLabel(input: string, t: TFunction): string {
  if (!input) return '';
  const m = input.match(/tier\s*(\d+)/i);
  if (m) {
    const n = m[1];
    const key = `tier${n}` as const;
    const translated = t(key, { defaultValue: `${t('tier')} ${n}` });
    return translated as string;
  }
  return input;
}

export function translateStageLabel(input: string, t: TFunction): string {
  if (!input) return '';
  const m = input.match(/stage\s*(\d+)/i);
  if (m) {
    const n = m[1];
    return `${t('stage')} ${n}`;
  }
  return input;
}

export function translateTypeLabel(input: string, t: TFunction): string {
  if (!input) return '';
  const key = input.toLowerCase().trim();
  const known = [
    'earth','water','air','nature','fighter','empath','fire','ice','poison','psychic','rock','steel','shadow','light'
  ];
  if (known.includes(key)) {
    const out = t(`type.${key}`, { defaultValue: input });
    return (typeof out === 'string' ? out : input) as string;
  }
  return input;
}
