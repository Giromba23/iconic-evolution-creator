import { useState } from "react";
import { EvolutionEntry } from "@/types/evolution";
import { EvolutionForm } from "@/components/EvolutionForm";
import { FilterManager } from "@/components/FilterManager";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, PlusCircle, ArrowLeft, BookOpen, Filter } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user, isAdmin, loading: authLoading } = useAuth();

  // Fetch entries from Supabase
  const { data: entries = [] } = useQuery({
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

  const selectedEntry = entries.find((e) => e.id === selectedEntryId);

  const handleSaveEntry = (entry: EvolutionEntry) => {
    const entryToSave = selectedEntryId ? entry : { ...entry, id: crypto.randomUUID() };
    saveEntryMutation.mutate(entryToSave);
  };

  const createNewEntry = () => {
    setSelectedEntryId(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--encyclopedia-bg))] p-4 md:p-8 grid place-items-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[hsl(var(--encyclopedia-bg))] p-4 md:p-8">
        <div className="max-w-md mx-auto text-center bg-card border rounded-2xl p-8">
          <h2 className="text-2xl font-semibold mb-2">Acesso restrito</h2>
          <p className="text-muted-foreground mb-6">Faça login como administrador para gerenciar filtros e entradas.</p>
          <Link to="/auth">
            <Button className="px-6">Ir para Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--encyclopedia-bg))] p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-[hsl(var(--encyclopedia-title))]" />
              <h1 className="encyclopedia-title text-4xl text-[hsl(var(--encyclopedia-title))]">
                Dashboard
              </h1>
            </div>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ver Catálogo
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="entries" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="entries" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Entradas
            </TabsTrigger>
            <TabsTrigger value="filters" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entries" className="space-y-6">
            <p className="text-[hsl(var(--encyclopedia-subtitle))]">
              Crie e edite suas entradas de evolução
            </p>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {entries.length > 0 && (
                <div className="flex items-center gap-3">
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

              <Button onClick={createNewEntry} variant="default">
                <PlusCircle className="w-4 h-4 mr-2" />
                Nova Entrada
              </Button>
            </div>

            <EvolutionForm
              key={selectedEntryId || "new"}
              onSave={handleSaveEntry}
              initialData={selectedEntryId ? selectedEntry : undefined}
            />
          </TabsContent>

          <TabsContent value="filters">
            <p className="text-[hsl(var(--encyclopedia-subtitle))] mb-6">
              Gerencie os filtros (Tier, Affinity, Class) e faça upload dos ícones SVG
            </p>
            <FilterManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Dashboard;
