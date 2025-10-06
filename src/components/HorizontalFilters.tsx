import { Button } from "@/components/ui/button";
import { X, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface FilterCategory {
  id: string;
  name: string;
  display_name: string;
  icon_color: string;
  group_category?: string;
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

interface FilterGroup {
  title: string;
  categories: FilterCategory[];
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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    primary: true,
    composite_affinity: false,
    composite_class: false,
  });

  // Group categories by their group_category
  const filterGroups: FilterGroup[] = [
    {
      title: "PRIMARY",
      categories: categories.filter(c => c.group_category === 'primary' || !c.group_category),
    },
    {
      title: "COMPOSITE AFFINITY",
      categories: categories.filter(c => c.group_category === 'composite_affinity'),
    },
    {
      title: "COMPOSITE CLASS",
      categories: categories.filter(c => c.group_category === 'composite_class'),
    },
  ].filter(group => group.categories.length > 0);

  const toggleGroup = (groupKey: string) => {
    setOpenGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const renderCategory = (category: FilterCategory) => {
    const categoryItems = items[category.name] || [];
    const selected = selectedItems[category.name] || [];
    const isAllSelected = selected.length === 0;
    const isAffinityCategory = category.name === 'affinity';
    const isClassCategory = category.name === 'class';
    const isTierCategory = category.name === 'tier';

    return (
      <div key={category.id} className="flex flex-wrap gap-2 items-center">
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
    );
  };

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

      {/* Filter Groups */}
      <div className="space-y-3">
        {filterGroups.map((group) => {
          const groupKey = group.title.toLowerCase().replace(/\s+/g, '_');
          const isOpen = openGroups[groupKey] ?? false;
          
          return (
            <Collapsible
              key={groupKey}
              open={isOpen}
              onOpenChange={() => toggleGroup(groupKey)}
            >
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                      {group.title}
                    </h2>
                    <ChevronDown 
                      className={`w-5 h-5 text-muted-foreground transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="p-6 pt-2 space-y-4">
                    {group.categories.map(renderCategory)}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>

      {/* Results Counter */}
      <div className="text-center text-sm text-muted-foreground">
        {totalResults} {totalResults === 1 ? 'resultado encontrado' : 'resultados encontrados'}
      </div>
    </div>
  );
}
