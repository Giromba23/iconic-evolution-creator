import { useState } from "react";
import { EvolutionEntry, EvolutionStage } from "@/types/evolution";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface EvolutionFormProps {
  onSave: (entry: EvolutionEntry) => void;
  initialData?: EvolutionEntry;
}

export const EvolutionForm = ({ onSave, initialData }: EvolutionFormProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [stages, setStages] = useState<EvolutionStage[]>(
    initialData?.stages || [
      {
        id: crypto.randomUUID(),
        name: "",
        imageUrl: "",
        tier: "",
        stage: "",
        types: [],
        description: "",
      },
    ]
  );

  const addStage = () => {
    setStages([
      ...stages,
      {
        id: crypto.randomUUID(),
        name: "",
        imageUrl: "",
        tier: "",
        stage: "",
        types: [],
        description: "",
      },
    ]);
  };

  const removeStage = (id: string) => {
    if (stages.length > 1) {
      setStages(stages.filter((s) => s.id !== id));
    } else {
      toast.error("Você precisa ter pelo menos um estágio");
    }
  };

  const updateStage = (id: string, field: keyof EvolutionStage, value: any) => {
    setStages(
      stages.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Por favor, adicione um título");
      return;
    }

    const entry: EvolutionEntry = {
      id: initialData?.id || crypto.randomUUID(),
      title,
      subtitle,
      stages,
    };

    onSave(entry);
    toast.success("Entrada salva com sucesso!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título Principal</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ILLUVIAL EVOLUTION: RYPTER, RYPTERUS, AND RYPLANCE"
              className="encyclopedia-title text-lg"
            />
          </div>

          <div>
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="A Comprehensive Study of Species"
              className="encyclopedia-title italic"
            />
          </div>
        </div>
      </Card>

      {stages.map((stage, index) => (
        <Card key={stage.id} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Estágio {index + 1}</h3>
            {stages.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeStage(stage.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remover
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor={`name-${stage.id}`}>Nome</Label>
              <Input
                id={`name-${stage.id}`}
                value={stage.name}
                onChange={(e) => updateStage(stage.id, "name", e.target.value)}
                placeholder="Rypter"
              />
            </div>

            <div>
              <Label htmlFor={`image-${stage.id}`}>URL da Imagem</Label>
              <div className="flex gap-2">
                <Input
                  id={`image-${stage.id}`}
                  value={stage.imageUrl}
                  onChange={(e) => updateStage(stage.id, "imageUrl", e.target.value)}
                  placeholder="https://i.imgur.com/..."
                />
                <Button type="button" variant="outline" size="icon">
                  <ImageIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`tier-${stage.id}`}>Tier</Label>
                <Input
                  id={`tier-${stage.id}`}
                  value={stage.tier}
                  onChange={(e) => updateStage(stage.id, "tier", e.target.value)}
                  placeholder="Tier 3"
                />
              </div>

              <div>
                <Label htmlFor={`stage-${stage.id}`}>Stage</Label>
                <Input
                  id={`stage-${stage.id}`}
                  value={stage.stage}
                  onChange={(e) => updateStage(stage.id, "stage", e.target.value)}
                  placeholder="Stage 1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`types-${stage.id}`}>Tipos (separados por vírgula)</Label>
              <Input
                id={`types-${stage.id}`}
                value={stage.types.join(", ")}
                onChange={(e) =>
                  updateStage(
                    stage.id,
                    "types",
                    e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                  )
                }
                placeholder="Water, Fighter, Toxic"
              />
            </div>

            <div>
              <Label htmlFor={`description-${stage.id}`}>Descrição</Label>
              <Textarea
                id={`description-${stage.id}`}
                value={stage.description}
                onChange={(e) => updateStage(stage.id, "description", e.target.value)}
                placeholder="Descrição da criatura e suas habilidades..."
                rows={6}
                className="encyclopedia-body"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Você pode usar HTML para formatação e ícones inline:<br/>
                Exemplo: &lt;img src="url-do-icone" class="inline w-4 h-4" /&gt; para adicionar ícones no texto
              </p>
            </div>
          </div>
        </Card>
      ))}

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={addStage} className="flex-1">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Estágio
        </Button>
        <Button type="submit" className="flex-1">
          Salvar Entrada
        </Button>
      </div>
    </form>
  );
};
