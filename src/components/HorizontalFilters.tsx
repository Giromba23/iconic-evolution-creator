import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterCategory {
  id: string;
  name: string;
  display_name: string;
  icon_color: string;
}

interface FilterItem {
  id: string;
  name: string;
  display_name: string;
  icon_url: string | null;
}

interface HorizontalFiltersProps {
  categories: FilterCategory[];
  items: Record<string, FilterItem[]>;
  selectedItems: Record<string, string[]>;
  onToggleItem: (categoryName: string, itemName: string) => void;
  onClearCategory: (categoryName: string) => void;
  onClearAll: () => void;
  totalResults: number;
}

export function HorizontalFilters({
  categories,
  items,
  selectedItems,
  onToggleItem,
  onClearCategory,
  onClearAll,
  totalResults
}: HorizontalFiltersProps) {
  const hasActiveFilters = Object.values(selectedItems).some(arr => arr.length > 0);

  return (
    <div className="space-y-4">
      {/* Clear All Button */}
      {hasActiveFilters && (
        <div className="flex justify-center">
          <Button 
            onClick={onClearAll}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-6 py-2 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 space-y-6">
        {categories.map(category => {
          const categoryItems = items[category.name] || [];
          const selected = selectedItems[category.name] || [];
          const isAllSelected = selected.length === 0;

          return (
            <div key={category.id} className="space-y-3">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: category.icon_color }}
                >
                  {category.display_name.charAt(0)}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{category.display_name}</h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={isAllSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => onClearCategory(category.name)}
                  className="rounded-lg transition-all"
                  style={{
                    backgroundColor: isAllSelected ? category.icon_color : undefined,
                    borderColor: isAllSelected ? category.icon_color : undefined
                  }}
                >
                  All
                </Button>
                
                {categoryItems.map(item => {
                  const isSelected = selected.includes(item.name);
                  const isAffinityCategory = category.name === 'affinity';
                  const isClassCategory = category.name === 'class';
                  const shouldEnlarge = isAffinityCategory || isClassCategory;
                  
                  return (
                    <Button
                      key={item.id}
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleItem(category.name, item.name)}
                      className={`rounded-lg transition-all px-3 ${
                        shouldEnlarge ? 'h-14' : 'h-10'
                      }`}
                      style={{
                        backgroundColor: isSelected 
                          ? category.icon_color 
                          : isClassCategory 
                            ? '#110f24' 
                            : undefined,
                        borderColor: isSelected ? category.icon_color : undefined,
                        color: isSelected ? 'white' : undefined
                      }}
                      title={item.display_name}
                    >
                      {item.icon_url ? (
                        <img 
                          src={item.icon_url} 
                          alt={item.display_name}
                          className={`object-contain ${
                            shouldEnlarge ? 'w-10 h-10' : 'w-5 h-5'
                          }`}
                        />
                      ) : (
                        <span className="text-xs font-medium">{item.display_name}</span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="text-center text-sm text-muted-foreground pt-2 border-t border-border/50">
          {totalResults} {totalResults === 1 ? 'resultado encontrado' : 'resultados encontrados'}
        </div>
      </div>
    </div>
  );
}
