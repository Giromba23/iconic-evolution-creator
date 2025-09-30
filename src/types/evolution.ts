export interface EvolutionStage {
  id: string;
  name: string;
  imageUrl: string;
  tier: string;
  stage: string;
  types: string[];
  description: string;
}

export interface EvolutionEntry {
  id: string;
  title: string;
  subtitle: string;
  stages: EvolutionStage[];
}
