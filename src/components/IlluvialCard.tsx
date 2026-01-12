import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EvolutionEntry } from "@/types/evolution";
import { useTranslation } from "react-i18next";
import { translateTierLabel, translateStageLabel } from "@/lib/translateControlled";
import { cn } from "@/lib/utils";

interface IlluvialCardProps {
  entry: EvolutionEntry;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick?: () => void;
}

export function IlluvialCard({ entry, isFavorite, onToggleFavorite, onClick }: IlluvialCardProps) {
  const { t } = useTranslation();
  
  // Use first stage for display in grid
  const firstStage = entry.stages[0];
  const lastStage = entry.stages[entry.stages.length - 1];
  
  const tierLabel = translateTierLabel(firstStage?.tier || '', t);

  // Map types to colors
  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      'Fire': 'bg-red-500/20 text-red-600 dark:text-red-400',
      'Water': 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
      'Earth': 'bg-amber-600/20 text-amber-700 dark:text-amber-400',
      'Air': 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400',
      'Nature': 'bg-green-500/20 text-green-600 dark:text-green-400',
      'Frost': 'bg-sky-400/20 text-sky-600 dark:text-sky-400',
      'Overgrowth': 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      'Inferno': 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
      'Shock': 'bg-yellow-400/20 text-yellow-600 dark:text-yellow-400',
      'Mud': 'bg-stone-500/20 text-stone-600 dark:text-stone-400',
      'Dust': 'bg-amber-400/20 text-amber-600 dark:text-amber-400',
      'Steam': 'bg-slate-400/20 text-slate-600 dark:text-slate-400',
      'Magma': 'bg-red-600/20 text-red-700 dark:text-red-400',
      'Granite': 'bg-gray-500/20 text-gray-600 dark:text-gray-400',
      'Toxic': 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
      'Verdant': 'bg-lime-500/20 text-lime-600 dark:text-lime-400',
      'Tempest': 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
    };
    return typeColors[type] || 'bg-primary/10 text-primary';
  };

  return (
    <div 
      className="group relative bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Favorite button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors",
          isFavorite && "text-red-500"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
      >
        <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
      </Button>

      {/* Image with gradient overlay */}
      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
        {lastStage?.imageUrl ? (
          <>
            <img
              src={lastStage.imageUrl}
              alt={entry.title}
              loading="lazy"
              className="w-full h-full object-cover object-[center_35%] group-hover:scale-110 transition-transform duration-500"
            />
            {/* Dark gradient overlay for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="encyclopedia-title text-lg font-semibold text-foreground mb-1 line-clamp-2 leading-tight min-h-[2.5rem]">
          {entry.title}
        </h3>
        
        {entry.subtitle && (
          <p className="text-sm text-muted-foreground mb-2 truncate italic">
            {entry.subtitle}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground font-medium">
            {tierLabel}
          </span>
          
          <span className="text-xs text-muted-foreground">
            {entry.stages.length} {entry.stages.length === 1 ? t('grid.stage', 'estágio') : t('grid.stages', 'estágios')}
          </span>
        </div>

        {/* Types with element colors */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {firstStage?.types?.slice(0, 3).map((type, index) => (
            <span 
              key={index} 
              className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                getTypeColor(type)
              )}
            >
              {type}
            </span>
          ))}
          {firstStage?.types && firstStage.types.length > 3 && (
            <span className="text-xs text-muted-foreground px-1">
              +{firstStage.types.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
