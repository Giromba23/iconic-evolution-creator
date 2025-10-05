import { Button } from "@/components/ui/button";
import { FilterIcon } from "@/config/filterIcons";
import { X } from "lucide-react";

interface VisualFilterProps {
  title: string;
  icon: React.ReactNode;
  items: FilterIcon[];
  selectedItems: string[];
  onToggle: (item: string) => void;
  onClear: () => void;
  colorClass?: string;
}

export function VisualFilter({
  title,
  icon,
  items,
  selectedItems,
  onToggle,
  onClear,
  colorClass = "bg-primary"
}: VisualFilterProps) {
  const isAllSelected = selectedItems.length === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center text-white`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant={isAllSelected ? "default" : "outline"}
          size="sm"
          onClick={onClear}
          className={`rounded-lg ${isAllSelected ? colorClass : 'bg-card'} hover:opacity-80 transition-all`}
        >
          All
        </Button>
        
        {items.map((item) => {
          const isSelected = selectedItems.includes(item.name);
          
          return (
            <Button
              key={item.name}
              variant="outline"
              size="sm"
              onClick={() => onToggle(item.name)}
              className={`rounded-lg transition-all ${
                isSelected 
                  ? `${colorClass} border-transparent text-white hover:opacity-80` 
                  : 'bg-card hover:bg-accent'
              }`}
              title={item.name}
            >
              {item.iconUrl ? (
                <img 
                  src={item.iconUrl} 
                  alt={item.name}
                  className="w-5 h-5 object-contain"
                />
              ) : item.emoji ? (
                <span className="text-lg">{item.emoji}</span>
              ) : (
                <span className="text-xs px-1">{item.name.slice(0, 2)}</span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
