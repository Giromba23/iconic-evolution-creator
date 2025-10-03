import { useState } from "react";
import { FlipBook } from "@/components/FlipBook";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Loader2, Filter, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { EvolutionEntry } from "@/types/evolution";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

const Index = () => {
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
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

  // Extrair todos os tipos únicos
  const allTypes = Array.from(
    new Set(
      entries.flatMap(entry => 
        entry.stages.flatMap(stage => stage.types || [])
      )
    )
  ).sort();

  // Filtrar entradas por tier e tipo
  const filteredEntries = entries.filter(entry => {
    const tierMatch = selectedTier === "all" || 
      entry.stages.some(stage => stage.tier.toLowerCase().includes(selectedTier.toLowerCase()));
    
    const typeMatch = selectedType === "all" || 
      entry.stages.some(stage => stage.types?.includes(selectedType));
    
    return tierMatch && typeMatch;
  });

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
            <div className="flex items-center gap-3">
              <LanguageSelector />
              <Link to="/dashboard">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  {t('dashboard')}
                </Button>
              </Link>
            </div>
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
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('filterByTier')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allTiers')}</SelectItem>
                  <SelectItem value="tier 0">{t('tier0')}</SelectItem>
                  <SelectItem value="tier 1">{t('tier1')}</SelectItem>
                  <SelectItem value="tier 2">{t('tier2')}</SelectItem>
                  <SelectItem value="tier 3">{t('tier3')}</SelectItem>
                  <SelectItem value="tier 4">{t('tier4')}</SelectItem>
                  <SelectItem value="tier 5">{t('tier5')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t('filterByType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allTypes')}</SelectItem>
                  {allTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <span className="text-sm text-muted-foreground">
                {filteredEntries.length} {filteredEntries.length === 1 ? t('entry') : t('entries')}
              </span>
            </div>
            
            {filteredEntries.length > 0 ? (
              <div className="py-8">
                <FlipBook key={`flipbook-${filteredEntries.length}-${selectedTier}-${selectedType}`} entries={filteredEntries} />
                <div className="text-center mt-6 text-sm text-muted-foreground">
                  {t('dragToNavigate')}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-card rounded-lg border">
                <Filter className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
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
            <p className="text-muted-foreground mb-4">
              {t('catalogEmpty')}
            </p>
            <Link to="/dashboard">
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                {t('goToDashboard')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
