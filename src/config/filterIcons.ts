// Configuração de ícones para os filtros
// Você pode inserir URLs de ícones customizados aqui

export interface FilterIcon {
  name: string;
  iconUrl?: string;
  emoji?: string;
}

export const affinityIcons: FilterIcon[] = [
  { name: 'Earth', iconUrl: '' },
  { name: 'Water', iconUrl: '' },
  { name: 'Air', iconUrl: '' },
  { name: 'Fire', iconUrl: '' },
  { name: 'Nature', iconUrl: '' },
  { name: 'Ice', iconUrl: '' },
  { name: 'Poison', iconUrl: '' },
  { name: 'Psychic', iconUrl: '' },
  { name: 'Rock', iconUrl: '' },
  { name: 'Steel', iconUrl: '' },
  { name: 'Shadow', iconUrl: '' },
  { name: 'Light', iconUrl: '' },
];

export const classIcons: FilterIcon[] = [
  { name: 'Fighter', iconUrl: '' },
  { name: 'Empath', iconUrl: '' },
  { name: 'Rogue', iconUrl: '' },
  { name: 'Psion', iconUrl: '' },
  { name: 'Invoker', iconUrl: '' },
  { name: 'Bulwark', iconUrl: '' },
  { name: 'Slayer', iconUrl: '' },
];

// Função helper para identificar se um tipo é affinity ou class
export function categorizeType(type: string): 'affinity' | 'class' | 'unknown' {
  const affinityNames = affinityIcons.map(a => a.name.toLowerCase());
  const classNames = classIcons.map(c => c.name.toLowerCase());
  
  const typeLower = type.toLowerCase();
  
  if (affinityNames.includes(typeLower)) return 'affinity';
  if (classNames.includes(typeLower)) return 'class';
  return 'unknown';
}
