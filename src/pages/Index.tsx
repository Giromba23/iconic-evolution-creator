import { useState, useEffect } from "react";
import { EvolutionEntry } from "@/types/evolution";
import { EvolutionViewer } from "@/components/EvolutionViewer";
import { EvolutionForm } from "@/components/EvolutionForm";
import { FlipBook } from "@/components/FlipBook";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, PlusCircle, Loader2, Filter } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("view");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const queryClient = useQueryClient();

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

  // Save entry mutation
  const saveEntryMutation = useMutation({
    mutationFn: async (entry: EvolutionEntry) => {
      // Se selectedEntryId existe, é update; senão é insert
      if (selectedEntryId) {
        const { error } = await supabase
          .from("evolution_entries")
          .update({
            title: entry.title,
            subtitle: entry.subtitle,
            stages: entry.stages as any,
          })
          .eq("id", entry.id);

        if (error) throw error;
        return { entry, isNew: false };
      } else {
        const { data, error } = await supabase
          .from("evolution_entries")
          .insert({
            title: entry.title,
            subtitle: entry.subtitle,
            stages: entry.stages as any,
          })
          .select()
          .single();

        if (error) throw error;
        return { entry: data, isNew: true };
      }
    },
    onSuccess: ({ entry, isNew }) => {
      queryClient.invalidateQueries({ queryKey: ["evolution_entries"] });
      setSelectedEntryId(entry.id);
      setActiveTab("view");
      
      // Mostrar toast apenas depois de mudar a aba (evita conflito com FlipBook)
      setTimeout(() => {
        if (isNew) {
          toast.success("Nova entrada criada!");
        } else {
          toast.success("Entrada atualizada!");
        }
      }, 100);
    },
    onError: (error) => {
      console.error("Error saving entry:", error);
      toast.error("Erro ao salvar entrada");
    },
  });

  // Auto-select first entry only when viewing
  useEffect(() => {
    if (activeTab === "view" && entries.length > 0 && !selectedEntryId) {
      setSelectedEntryId(entries[0].id);
    }
  }, [entries, selectedEntryId, activeTab]);

  const selectedEntry = entries.find((e) => e.id === selectedEntryId);
  const currentIndex = entries.findIndex((e) => e.id === selectedEntryId);

  const handleSaveEntry = (entry: EvolutionEntry) => {
    // Se não tem selectedEntryId, é uma nova entrada - remove o ID para forçar INSERT
    const entryToSave = selectedEntryId ? entry : { ...entry, id: crypto.randomUUID() };
    saveEntryMutation.mutate(entryToSave);
  };

  const createNewEntry = () => {
    setSelectedEntryId(null);
    setActiveTab("edit");
  };

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
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <BookOpen className="w-8 h-8 text-[hsl(var(--encyclopedia-title))]" />
            <h1 className="encyclopedia-title text-4xl text-[hsl(var(--encyclopedia-title))]">
              Enciclopédia de Evoluções
            </h1>
          </div>
          <p className="text-[hsl(var(--encyclopedia-subtitle))]">
            Gerencie e visualize suas evoluções de criaturas
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); if (val === "edit") setSelectedEntryId(null); }} className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="view">Visualizar</TabsTrigger>
              <TabsTrigger value="edit">Editar</TabsTrigger>
            </TabsList>

            <Button onClick={createNewEntry} variant="default">
              <PlusCircle className="w-4 h-4 mr-2" />
              Nova Entrada
            </Button>
          </div>

          <TabsContent value="view" className="mt-0">
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
                      <SelectValue placeholder="Filtrar por Tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Tiers</SelectItem>
                      <SelectItem value="tier 0">Tier 0</SelectItem>
                      <SelectItem value="tier 1">Tier 1</SelectItem>
                      <SelectItem value="tier 2">Tier 2</SelectItem>
                      <SelectItem value="tier 3">Tier 3</SelectItem>
                      <SelectItem value="tier 4">Tier 4</SelectItem>
                      <SelectItem value="tier 5">Tier 5</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filtrar por Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Tipos</SelectItem>
                      {allTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <span className="text-sm text-muted-foreground">
                    {filteredEntries.length} {filteredEntries.length === 1 ? 'entrada' : 'entradas'}
                  </span>
                </div>
                
                {filteredEntries.length > 0 ? (
                  <div className="py-8">
                    <FlipBook key={`flipbook-${filteredEntries.length}-${selectedTier}-${selectedType}`} entries={filteredEntries} />
                    <div className="text-center mt-6 text-sm text-muted-foreground">
                      Arraste as páginas para navegar
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-card rounded-lg border">
                    <Filter className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Nenhuma entrada encontrada</h3>
                    <p className="text-muted-foreground">
                      Não há entradas com os filtros selecionados
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 bg-card rounded-lg border">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Nenhuma entrada criada</h3>
                <p className="text-muted-foreground mb-4">
                  Crie sua primeira entrada de evolução
                </p>
                <Button onClick={createNewEntry}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Criar Nova Entrada
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="edit" className="mt-0">
            {entries.length > 0 && (
              <div className="mb-6 flex items-center gap-3">
                <label className="text-sm font-medium">Editar entrada:</label>
                <Select 
                  value={selectedEntryId || "new"} 
                  onValueChange={(value) => setSelectedEntryId(value === "new" ? null : value)}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Selecione uma entrada" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">✨ Nova Entrada</SelectItem>
                    {entries.map((entry) => (
                      <SelectItem key={entry.id} value={entry.id}>
                        {entry.title || "Sem título"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <EvolutionForm
              key={selectedEntryId || "new"}
              onSave={handleSaveEntry}
              initialData={selectedEntryId ? selectedEntry : undefined}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
