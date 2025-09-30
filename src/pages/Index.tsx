import { useState } from "react";
import { EvolutionEntry } from "@/types/evolution";
import { EvolutionViewer } from "@/components/EvolutionViewer";
import { EvolutionForm } from "@/components/EvolutionForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, PlusCircle } from "lucide-react";

const Index = () => {
  const [entries, setEntries] = useState<EvolutionEntry[]>([
    {
      id: "1",
      title: "ILLUVIAL EVOLUTION: RYPTER, RYPTERUS, AND RYPLANCE",
      subtitle: "A Comprehensive Study of Species",
      stages: [
        {
          id: "1",
          name: "Rypter",
          imageUrl: "https://i.imgur.com/D4CTLCq.png",
          tier: "Tier 3",
          stage: "Stage 1",
          types: ["Water", "Fighter"],
          description:
            "Water: When activated your team gains: 1.2/2.4/3.7/5 Energy Regen. Water units gain double\nFighter: When activated your team gains: 9/13/21/25 Attack Speed. Fighter units gain double",
        },
        {
          id: "2",
          name: "Rypterus",
          imageUrl: "https://i.imgur.com/wWWNQsV.png",
          tier: "Tier 3",
          stage: "Stage 2",
          types: ["Water", "Fighter", "Toxic"],
          description:
            "Your team gains\nToxic attacks permanently Poison the target. On Vanquish, Toxic units Heal (100/150/250) for an amount and make enemies explode, dealing a percentage (8/12/16%) of their Max health as Pure Damage in 25-hexes.\n\nPoison: Deals 2% of target's Max Health as Pure Damage per second",
        },
        {
          id: "3",
          name: "Ryplance",
          imageUrl: "https://i.imgur.com/gHu3cLo.png",
          tier: "Tier 3",
          stage: "Stage 3",
          types: ["Water", "Fighter", "Berserker"],
          description:
            "Your team Gains Berserker\nEvery 3 attacks, Berserkers deal additional damage (105/180/240%) and heal a percentage of the damage dealt (10/20/25%).",
        },
      ],
    },
  ]);

  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(entries[0]?.id || null);
  const [activeTab, setActiveTab] = useState("view");

  const selectedEntry = entries.find((e) => e.id === selectedEntryId);

  const handleSaveEntry = (entry: EvolutionEntry) => {
    const existingIndex = entries.findIndex((e) => e.id === entry.id);
    if (existingIndex >= 0) {
      const newEntries = [...entries];
      newEntries[existingIndex] = entry;
      setEntries(newEntries);
    } else {
      setEntries([...entries, entry]);
      setSelectedEntryId(entry.id);
    }
    setActiveTab("view");
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
            {selectedEntry ? (
              <EvolutionViewer entry={selectedEntry} />
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
