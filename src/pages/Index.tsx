import { useState, useEffect } from "react";
import { EvolutionEntry } from "@/types/evolution";
import { EvolutionViewer } from "@/components/EvolutionViewer";
import { EvolutionForm } from "@/components/EvolutionForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, PlusCircle, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("view");
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
      const { data: existing } = await supabase
        .from("evolution_entries")
        .select("id")
        .eq("id", entry.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("evolution_entries")
          .update({
            title: entry.title,
            subtitle: entry.subtitle,
            stages: entry.stages as any,
          })
          .eq("id", entry.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("evolution_entries")
          .insert({
            title: entry.title,
            subtitle: entry.subtitle,
            stages: entry.stages as any,
          });

        if (error) throw error;
      }

      return entry;
    },
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: ["evolution_entries"] });
      setSelectedEntryId(entry.id);
      setActiveTab("view");
    },
    onError: (error) => {
      console.error("Error saving entry:", error);
      toast.error("Erro ao salvar entrada");
    },
  });

  // Auto-select first entry when entries load
  useEffect(() => {
    if (entries.length > 0 && !selectedEntryId) {
      setSelectedEntryId(entries[0].id);
    }
  }, [entries, selectedEntryId]);

  const selectedEntry = entries.find((e) => e.id === selectedEntryId);

  const handleSaveEntry = (entry: EvolutionEntry) => {
    saveEntryMutation.mutate(entry);
  };

  const createNewEntry = () => {
    setSelectedEntryId(null);
    setActiveTab("edit");
  };

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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

          {entries.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {entries.map((entry) => (
                <Button
                  key={entry.id}
                  variant={selectedEntryId === entry.id ? "default" : "outline"}
                  onClick={() => setSelectedEntryId(entry.id)}
                  className="text-sm"
                >
                  {entry.title.substring(0, 30)}...
                </Button>
              ))}
            </div>
          )}

          <TabsContent value="view" className="mt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : selectedEntry ? (
              <EvolutionViewer entry={selectedEntry} />
            ) : entries.length === 0 ? (
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
            ) : (
              <div className="text-center py-20 bg-card rounded-lg border">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Nenhuma entrada selecionada</h3>
                <p className="text-muted-foreground mb-4">
                  Selecione uma entrada acima ou crie uma nova
                </p>
                <Button onClick={createNewEntry}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Criar Nova Entrada
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="edit" className="mt-0">
            <EvolutionForm
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
