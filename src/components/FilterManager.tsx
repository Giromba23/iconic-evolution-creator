import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Trash2, Save, Plus, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface FilterCategory {
  id: string;
  name: string;
  display_name: string;
  icon_color: string;
  sort_order: number;
}

interface FilterItem {
  id: string;
  category_id: string;
  name: string;
  display_name: string;
  icon_url: string | null;
  sort_order: number;
}

export function FilterManager() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemDisplayName, setNewItemDisplayName] = useState("");
  const [uploadingIcon, setUploadingIcon] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDisplayName, setEditDisplayName] = useState("");
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["filter_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("filter_categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as FilterCategory[];
    },
  });

  // Fetch items
  const { data: items = [] } = useQuery({
    queryKey: ["filter_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("filter_items")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as FilterItem[];
    },
  });

  // Upload icon mutation
  const uploadIcon = async (file: File, itemId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${itemId}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('filter-icons')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('filter-icons')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FilterItem> }) => {
      const { error } = await supabase
        .from("filter_items")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filter_items"] });
      toast.success("Item atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const maxSortOrder = items
        .filter(i => i.category_id === categoryId)
        .reduce((max, i) => Math.max(max, i.sort_order), 0);

      const { error } = await supabase
        .from("filter_items")
        .insert({
          category_id: categoryId,
          name: newItemName,
          display_name: newItemDisplayName,
          sort_order: maxSortOrder + 1,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filter_items"] });
      toast.success("Item adicionado!");
      setNewItemName("");
      setNewItemDisplayName("");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("filter_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filter_items"] });
      toast.success("Item removido!");
    },
  });

  const handleIconUpload = async (file: File, itemId: string) => {
    try {
      setUploadingIcon(itemId);
      const iconUrl = await uploadIcon(file, itemId);
      await updateItemMutation.mutateAsync({ id: itemId, updates: { icon_url: iconUrl } });
    } catch (error: any) {
      toast.error(`Erro no upload: ${error.message}`);
    } finally {
      setUploadingIcon(null);
    }
  };

  const startEdit = (item: FilterItem) => {
    setEditingItem(item.id);
    setEditName(item.name);
    setEditDisplayName(item.display_name);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditName("");
    setEditDisplayName("");
  };

  const saveEdit = async (itemId: string) => {
    if (!editName.trim() || !editDisplayName.trim()) {
      toast.error("Nome e nome de exibição são obrigatórios");
      return;
    }

    try {
      await updateItemMutation.mutateAsync({ 
        id: itemId, 
        updates: { 
          name: editName.trim(), 
          display_name: editDisplayName.trim() 
        } 
      });
      cancelEdit();
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const currentCategoryItems = selectedCategory
    ? items.filter(i => i.category_id === selectedCategory)
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={categories[0]?.id || ""} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-3">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.display_name}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              {/* Add new item */}
              <div className="flex gap-2 p-4 bg-muted rounded-lg">
                <Input
                  placeholder="Nome interno (ex: fire)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
                <Input
                  placeholder="Nome exibido (ex: Fire)"
                  value={newItemDisplayName}
                  onChange={(e) => setNewItemDisplayName(e.target.value)}
                />
                <Button
                  onClick={() => addItemMutation.mutate(category.id)}
                  disabled={!newItemName || !newItemDisplayName}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              {/* Items list */}
              <div className="grid gap-3">
                {items
                  .filter(item => item.category_id === category.id)
                  .map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    {/* Icon preview */}
                    <div className="w-12 h-12 border rounded flex items-center justify-center bg-background shrink-0">
                      {uploadingIcon === item.id ? (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : item.icon_url ? (
                        <img src={item.icon_url} alt={item.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-xs text-muted-foreground">Sem ícone</span>
                      )}
                    </div>

                    {/* Item info - editable */}
                    {editingItem === item.id ? (
                      <div className="flex-1 grid gap-2">
                        <Input
                          placeholder="Nome interno (ex: fire)"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8"
                        />
                        <Input
                          placeholder="Nome exibido (ex: Fire)"
                          value={editDisplayName}
                          onChange={(e) => setEditDisplayName(e.target.value)}
                          className="h-8"
                        />
                      </div>
                    ) : (
                      <div className="flex-1">
                        <div className="font-medium">{item.display_name}</div>
                        <div className="text-sm text-muted-foreground">{item.name}</div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      {editingItem === item.id ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => saveEdit(item.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelEdit}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(item)}
                            disabled={uploadingIcon === item.id}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>

                          <Label htmlFor={`upload-${item.id}`} className="cursor-pointer">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              disabled={uploadingIcon === item.id}
                              asChild
                            >
                              <span>
                                <Upload className="w-4 h-4" />
                              </span>
                            </Button>
                            <input
                              id={`upload-${item.id}`}
                              type="file"
                              accept=".svg,.png,.jpg,.jpeg,.webp"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleIconUpload(file, item.id);
                              }}
                              disabled={uploadingIcon === item.id}
                            />
                          </Label>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteItemMutation.mutate(item.id)}
                            disabled={uploadingIcon === item.id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
