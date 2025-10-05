import { useState } from "react";
import { FlipBook } from "@/components/FlipBook";
import { Button } from "@/components/ui/button";
import { BookOpen, Loader2, Star, Snowflake, Crown, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EvolutionEntry } from "@/types/evolution";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";
import { VisualFilter } from "@/components/VisualFilter";
import { affinityIcons, classIcons, categorizeType } from "@/config/filterIcons";

const Index = () => {
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [selectedAffinities, setSelectedAffinities] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const { t } = useTranslation();

  // Fetch entries from Supabase
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["evolution_entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evolution_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return data.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle || "",
        stages: item.stages as any as EvolutionEntry["stages"],
      }));
    },
  });

  // Handlers para os filtros
  const toggleTier = (tier: string) => {
    setSelectedTiers(prev => 
      prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]
    );
  };

  const toggleAffinity = (affinity: string) => {
    setSelectedAffinities(prev => 
      prev.includes(affinity) ? prev.filter(a => a !== affinity) : [...prev, affinity]
    );
  };

  const toggleClass = (className: string) => {
    setSelectedClasses(prev => 
      prev.includes(className) ? prev.filter(c => c !== className) : [...prev, className]
    );
  };

  const clearAllFilters = () => {
    setSelectedTiers([]);
    setSelectedAffinities([]);
    setSelectedClasses([]);
  };

  // Filtrar entradas
  const filteredEntries = entries.filter(entry => {
    // Tier match
    const tierMatch = selectedTiers.length === 0 || 
      entry.stages.some(stage => {
        const tierNum = stage.tier.match(/\d+/)?.[0];
        return tierNum && selectedTiers.includes(tierNum);
      });
    
    // Affinity match
    const affinityMatch = selectedAffinities.length === 0 || 
      entry.stages.some(stage => 
        stage.types?.some(type => 
          categorizeType(type) === 'affinity' && selectedAffinities.includes(type)
        )
      );
    
    // Class match
    const classMatch = selectedClasses.length === 0 || 
      entry.stages.some(stage => 
        stage.types?.some(type => 
          categorizeType(type) === 'class' && selectedClasses.includes(type)
        )
      );
    
    return tierMatch && affinityMatch && classMatch;
  });

  const hasActiveFilters = selectedTiers.length > 0 || selectedAffinities.length > 0 || selectedClasses.length > 0;

  const tierItems = [
    { name: '0', iconUrl: '', emoji: '' },
    { name: '1', iconUrl: '', emoji: '' },
    { name: '2', iconUrl: '', emoji: '' },
    { name: '3', iconUrl: '', emoji: '' },
    { name: '4', iconUrl: '', emoji: '' },
    { name: '5', iconUrl: '', emoji: '' },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--encyclopedia-bg))] p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-[hsl(var(--encyclopedia-title))]" />
              <h1 className="encyclopedia-title text-4xl text-[hsl(var(--encyclopedia-title))]">
                {t('title')}
              </h1>
            </div>
            <LanguageSelector />
          </div>
          <p className="text-[hsl(var(--encyclopedia-subtitle))]">
            {t('subtitle')}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : entries.length > 0 ? (
          <div>
            {/* Clear All Filters Button */}
            {hasActiveFilters && (
              <div className="flex justify-center mb-6">
                <Button 
                  onClick={clearAllFilters}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-6 py-2 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* Visual Filters */}
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 mb-6 space-y-6 border border-border/50">
              <VisualFilter
                title="Tier"
                icon={<Star className="w-5 h-5" />}
                items={tierItems}
                selectedItems={selectedTiers}
                onToggle={toggleTier}
                onClear={() => setSelectedTiers([])}
                colorClass="bg-amber-600"
              />

              <VisualFilter
                title="Affinity"
                icon={<Snowflake className="w-5 h-5" />}
                items={affinityIcons}
                selectedItems={selectedAffinities}
                onToggle={toggleAffinity}
                onClear={() => setSelectedAffinities([])}
                colorClass="bg-blue-600"
              />

              <VisualFilter
                title="Class"
                icon={<Crown className="w-5 h-5" />}
                items={classIcons}
                selectedItems={selectedClasses}
                onToggle={toggleClass}
                onClear={() => setSelectedClasses([])}
                colorClass="bg-pink-600"
              />
              
              <div className="text-center text-sm text-muted-foreground pt-2 border-t border-border/50">
                {filteredEntries.length} {filteredEntries.length === 1 ? t('entry') : t('entries')} {t('found', { defaultValue: 'found' })}
              </div>
            </div>
            
            {filteredEntries.length > 0 ? (
              <div className="py-8">
                <FlipBook 
                  key={`flipbook-${filteredEntries.length}-${selectedTiers.join(',')}-${selectedAffinities.join(',')}-${selectedClasses.join(',')}`} 
                  entries={filteredEntries} 
                />
                <div className="text-center mt-6 text-sm text-muted-foreground">
                  {t('dragToNavigate')}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-card rounded-lg border">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">{t('noEntriesFound')}</h3>
                <p className="text-muted-foreground">
                  {t('noEntriesWithFilters')}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-lg border">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">{t('noCatalogEntries')}</h3>
            <p className="text-muted-foreground">
              {t('catalogEmpty')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
