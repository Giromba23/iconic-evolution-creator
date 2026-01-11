import { EvolutionEntry } from "@/types/evolution";
import { IlluvialCard } from "./IlluvialCard";
import { useFavorites } from "@/hooks/useFavorites";
import { useTranslation } from "react-i18next";
import { BookOpen, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface GridViewProps {
  entries: EvolutionEntry[];
  onSelectEntry?: (entry: EvolutionEntry, index: number) => void;
}

export function GridView({ entries, onSelectEntry }: GridViewProps) {
  const { t } = useTranslation();
  const { isFavorite, toggleFavorite, favoritesCount } = useFavorites();
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const displayedEntries = showOnlyFavorites 
    ? entries.filter(entry => isFavorite(entry.id))
    : entries;

  return (
    <div className="space-y-6">
      {/* Favorites filter */}
      {favoritesCount > 0 && (
        <div className="flex justify-center">
          <Button
            variant={showOnlyFavorites ? "default" : "outline"}
            size="sm"
            className="rounded-full gap-2"
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          >
            <Heart className={`w-4 h-4 ${showOnlyFavorites ? 'fill-current' : ''}`} />
            {showOnlyFavorites 
              ? t('grid.showAll', 'Mostrar todos') 
              : t('grid.showFavorites', 'Favoritos ({{count}})', { count: favoritesCount })
            }
          </Button>
        </div>
      )}

      {displayedEntries.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-lg border">
          <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">
            {t('grid.noFavorites', 'Nenhum favorito ainda')}
          </h2>
          <p className="text-muted-foreground">
            {t('grid.addFavorites', 'Clique no coração para adicionar favoritos')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {displayedEntries.map((entry, index) => (
            <IlluvialCard
              key={entry.id}
              entry={entry}
              isFavorite={isFavorite(entry.id)}
              onToggleFavorite={() => toggleFavorite(entry.id)}
              onClick={() => onSelectEntry?.(entry, index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
