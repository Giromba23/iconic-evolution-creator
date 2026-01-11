import { BookOpen, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ViewMode = 'flipbook' | 'grid';

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
  const { t } = useTranslation();

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 bg-card/50 backdrop-blur-sm rounded-xl p-1 border border-border/50">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={mode === 'flipbook' ? 'default' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-lg"
              onClick={() => onChange('flipbook')}
            >
              <BookOpen className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('view.flipbook', 'Modo Livro')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={mode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-lg"
              onClick={() => onChange('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('view.grid', 'Modo Grade')}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
