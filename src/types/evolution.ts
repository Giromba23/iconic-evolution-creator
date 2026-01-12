export interface EvolutionStage {
  id: string;
  name: string;
  imageUrl: string;
  link?: string;
  tier: string;
  stage: string;
  types: string[];
  description: string;
  video_url?: string;
}

export interface EvolutionEntry {
  id: string;
  title: string;
  subtitle: string;
  stages: EvolutionStage[];
}
