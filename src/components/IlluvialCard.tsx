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

  return (
    <div 
      className="group relative bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Favorite button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm",
          isFavorite && "text-red-500"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
      >
        <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
      </Button>

      {/* Image - Show last stage (final evolution) */}
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {lastStage?.imageUrl ? (
          <img
            src={lastStage.imageUrl}
            alt={entry.title}
            loading="lazy"
            className="w-full h-full object-cover object-[center_35%] group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="encyclopedia-title text-lg font-semibold text-foreground mb-1 truncate">
          {entry.title}
        </h3>
        
        {entry.subtitle && (
          <p className="text-sm text-muted-foreground mb-2 truncate italic">
            {entry.subtitle}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
            {tierLabel}
          </span>
          
          <span className="text-xs text-muted-foreground">
            {entry.stages.length} {entry.stages.length === 1 ? t('grid.stage', 'estágio') : t('grid.stages', 'estágios')}
          </span>
        </div>

        {/* Types */}
        <div className="flex flex-wrap gap-1 mt-2">
          {firstStage?.types?.slice(0, 3).map((type, index) => (
            <span 
              key={index} 
              className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
            >
              {type}
            </span>
          ))}
          {firstStage?.types && firstStage.types.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{firstStage.types.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
