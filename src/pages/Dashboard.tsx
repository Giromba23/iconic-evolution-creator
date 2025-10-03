import { useState, useEffect } from "react";
import { EvolutionEntry } from "@/types/evolution";
import { EvolutionForm } from "@/components/EvolutionForm";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, PlusCircle, ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const queryClient = useQueryClient();

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

  return (
    <div className="min-h-screen bg-[hsl(var(--encyclopedia-bg))] p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-[hsl(var(--encyclopedia-title))]" />
              <h1 className="encyclopedia-title text-4xl text-[hsl(var(--encyclopedia-title))]">
                Dashboard - Gerenciar Evoluções
              </h1>
            </div>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ver Catálogo
              </Button>
            </Link>
          </div>
          <p className="text-[hsl(var(--encyclopedia-subtitle))]">
            Crie e edite suas entradas de evolução
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
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
      </div>
    </div>
  );
};

export default Dashboard;
