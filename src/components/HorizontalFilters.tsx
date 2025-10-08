import { Button } from "@/components/ui/button";
import { X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { categorizeType } from "@/config/filterIcons";

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

export function HorizontalFilters({
  categories,
  items,
  selectedItems,
  onToggleItem,
  onClearCategory,
  onClearAll,
  totalResults
}: HorizontalFiltersProps) {
  const { t } = useTranslation();
  const hasActiveFilters = Object.values(selectedItems).some(arr => arr.length > 0);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    primary: true,
    composite_affinity: true,
    composite_class: true,
  });

  // Separate tier category
  const tierCategory = categories.find(c => c.name === 'tier');
  
  // Get the 3 main filter groups (excluding tier)
  const primaryCategory = categories.find(c => c.name === 'primary');
  const compositeAffinityCategory = categories.find(c => c.name === 'composite_affinity');
  const compositeClassCategory = categories.find(c => c.name === 'composite_class');

  const toggleGroup = (groupKey: string) => {
    setOpenGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const renderTierFilter = () => {
    if (!tierCategory) return null;
    
    const categoryItems = items[tierCategory.name] || [];
    const selected = selectedItems[tierCategory.name] || [];
    const isAllSelected = selected.length === 0;

    return (
      <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            variant={isAllSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onClearCategory(tierCategory.name)}
            className="rounded-lg transition-all"
            style={{
              backgroundColor: isAllSelected ? tierCategory.icon_color : undefined,
              borderColor: isAllSelected ? tierCategory.icon_color : undefined
            }}
          >
            {t('filters.all')}
          </Button>
          
          {categoryItems.map(item => {
            const isSelected = selected.includes(item.name);
            
            return (
              <Button
                key={item.id}
                variant="outline"
                size="sm"
                onClick={() => onToggleItem(tierCategory.name, item.name)}
                className="rounded-lg transition-all px-3 h-10"
                style={{
                  backgroundColor: isSelected ? tierCategory.icon_color : undefined,
                  borderColor: isSelected ? tierCategory.icon_color : undefined,
                  color: isSelected ? 'white' : undefined
                }}
                title={item.display_name}
              >
                <span className="text-xs font-medium">{item.display_name}</span>
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderFilterGroup = (
    category: FilterCategory | undefined,
    groupKey: string,
    title: string
  ) => {
    if (!category) return null;
    
    const categoryItems = items[category.name] || [];
    const selected = selectedItems[category.name] || [];
    const isAllSelected = selected.length === 0;
    const isOpen = openGroups[groupKey] ?? false;

    // Check if this is the PRIMARY category that needs to be split
    const isPrimary = category.name === 'primary';
    
    // Separate items by affinity and class if PRIMARY
    const affinityItems = isPrimary ? categoryItems.filter(item => categorizeType(item.name) === 'affinity') : [];
    const classItems = isPrimary ? categoryItems.filter(item => categorizeType(item.name) === 'class') : [];

    const renderItemGrid = (itemsToRender: FilterItem[], subtitle?: string) => (
      <div>
        {subtitle && (
          <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2">
            {subtitle}
          </h3>
        )}
        <div className="grid grid-cols-2 gap-2">
          {itemsToRender.map(item => {
            const isSelected = selected.includes(item.name);
            
            return (
              <Button
                key={item.id}
                variant="outline"
                size="sm"
                onClick={() => onToggleItem(category.name, item.name)}
                className="rounded-lg transition-all px-3 h-14 justify-start"
                style={{
                  backgroundColor: isSelected ? category.icon_color : '#110f24',
                  borderColor: isSelected ? category.icon_color : undefined,
                  color: 'white'
                }}
                title={item.display_name}
              >
                {item.icon_url ? (
                  <div className="flex items-center gap-2">
                    <img 
                      src={item.icon_url} 
                      alt={item.display_name}
                      className="w-10 h-10 object-contain"
                    />
                    <span className="text-xs font-medium">{item.display_name}</span>
                  </div>
                ) : (
                  <span className="text-xs font-medium">{item.display_name}</span>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    );

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
                {title}
              </h2>
              <ChevronDown 
                className={`w-5 h-5 text-muted-foreground transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="p-6 pt-2">
              <div className="flex gap-2 mb-3">
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
                  {t('filters.all')}
                </Button>
              </div>
              
              {isPrimary ? (
                <div className="space-y-4">
                  {renderItemGrid(affinityItems, 'PRIMARY AFFINITY')}
                  {renderItemGrid(classItems, 'PRIMARY CLASS')}
                </div>
              ) : (
                renderItemGrid(categoryItems)
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
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
            {t('filters.clearAll')}
          </Button>
        </div>
      )}

      {/* Tier Filter - Isolated */}
      {renderTierFilter()}

      {/* Filter Groups in Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {renderFilterGroup(primaryCategory, 'primary', 'PRIMARY SYNERGIES')}
        {renderFilterGroup(compositeAffinityCategory, 'composite_affinity', 'COMPOSITE AFFINITY')}
        {renderFilterGroup(compositeClassCategory, 'composite_class', 'COMPOSITE CLASS')}
      </div>

      {/* Results Counter */}
      <div className="text-center text-sm text-muted-foreground">
        {totalResults} {totalResults === 1 ? t('filters.resultFound') : t('filters.resultsFound')}
      </div>
    </div>
  );
}
