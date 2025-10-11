import { useState, useMemo } from "react";
import { FlipBook } from "@/components/FlipBook";
import { HorizontalFilters } from "@/components/HorizontalFilters";
import { BookOpen, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EvolutionEntry } from "@/types/evolution";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";
import coverImage from "@/assets/illuvipedia-cover.png";

const Index = () => {
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const { t } = useTranslation();

  // Fetch entries
  const { data: entries = [], isLoading: entriesLoading } = useQuery({
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

  // Fetch filter categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["filter_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("filter_categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  // Fetch filter items
  const { data: filterItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["filter_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("filter_items")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const isLoading = entriesLoading || categoriesLoading || itemsLoading;

  // Organize items by category
  const itemsByCategory = useMemo(() => {
    const result: Record<string, any[]> = {};
    categories.forEach(cat => {
      result[cat.name] = filterItems.filter(item => item.category_id === cat.id);
    });
    return result;
  }, [categories, filterItems]);

  // Filter handlers
  const toggleItem = (categoryName: string, itemName: string) => {
    setSelectedFilters(prev => {
      const current = prev[categoryName] || [];
      const newSelection = current.includes(itemName)
        ? current.filter(i => i !== itemName)
        : [...current, itemName];
      return { ...prev, [categoryName]: newSelection };
    });
  };

  const clearCategory = (categoryName: string) => {
    setSelectedFilters(prev => ({ ...prev, [categoryName]: [] }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
  };

  // Filter entries
  const filteredEntries = useMemo(() => {
    const filtered = entries.filter(entry => {
      return categories.every(category => {
        const selected = selectedFilters[category.name] || [];
        if (selected.length === 0) return true;

        // Check if ANY stage in this entry matches ANY selected filter
        return entry.stages.some(stage => {
          if (category.name === 'tier') {
            const tierNum = stage.tier.match(/\d+/)?.[0];
            return tierNum && selected.includes(tierNum);
          } else {
            // Check if any of the stage's types match any selected filter
            return stage.types?.some(type => 
              selected.some(selectedType => 
                type.toLowerCase() === selectedType.toLowerCase()
              )
            );
          }
        });
      });
    });

    // Sort by tier (extract tier number from first stage)
    return filtered.sort((a, b) => {
      const getTier = (entry: EvolutionEntry) => {
        const tierMatch = entry.stages[0]?.tier?.match(/\d+/);
        return tierMatch ? parseInt(tierMatch[0]) : 999;
      };
      return getTier(a) - getTier(b);
    });
  }, [entries, categories, selectedFilters]);

  const hasActiveFilters = Object.values(selectedFilters).some(arr => arr.length > 0);

  return (
    <div className="min-h-screen bg-[hsl(var(--encyclopedia-bg))] p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-[hsl(var(--encyclopedia-title))]" aria-hidden="true" />
              <h1 className="encyclopedia-title text-4xl text-[hsl(var(--encyclopedia-title))]">
                {t('title')}
              </h1>
            </div>
            <LanguageSelector />
          </div>
          <p className="text-[hsl(var(--encyclopedia-subtitle))]">
            {t('subtitle')}
          </p>
        </header>

        <main>
          {isLoading ? (
            <div className="flex items-center justify-center py-20" role="status" aria-label="Loading">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : entries.length > 0 ? (
            <div>
              <nav aria-label="Illuvials filters">
                <HorizontalFilters
                  categories={categories}
                  items={itemsByCategory}
                  selectedItems={selectedFilters}
                  onToggleItem={toggleItem}
                  onClearCategory={clearCategory}
                  onClearAll={clearAllFilters}
                  totalResults={filteredEntries.length}
                />
              </nav>
              
              {filteredEntries.length > 0 ? (
                <section className="py-8" aria-label="Illuvials encyclopedia">
                  <FlipBook 
                    key={`flipbook-${filteredEntries.length}-${JSON.stringify(selectedFilters)}`} 
                    entries={filteredEntries}
                    coverImage={hasActiveFilters ? undefined : coverImage}
                  />
                  <p className="text-center mt-6 text-sm text-muted-foreground">
                    {t('dragToNavigate')}
                  </p>
                </section>
              ) : (
                <section className="text-center py-20 bg-card rounded-lg border">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
                  <h2 className="text-xl font-semibold mb-2">{t('noEntriesFound')}</h2>
                  <p className="text-muted-foreground">
                    {t('noEntriesWithFilters')}
                  </p>
                </section>
              )}
            </div>
          ) : (
            <section className="text-center py-20 bg-card rounded-lg border">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
              <h2 className="text-xl font-semibold mb-2">{t('noCatalogEntries')}</h2>
              <p className="text-muted-foreground">
                {t('catalogEmpty')}
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
