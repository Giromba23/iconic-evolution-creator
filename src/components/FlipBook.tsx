// FlipBook component with page flip animation
import { useRef, forwardRef, useState, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import { EvolutionEntry } from "@/types/evolution";
import { useTranslateContent } from "@/hooks/useTranslateContent";
import { useTranslation } from "react-i18next";
import { translateTierLabel, translateStageLabel, translateTypeLabel } from "@/lib/translateControlled";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FlipBookProps {
  entries: EvolutionEntry[];
  coverImage?: string;
}

interface TranslatedStageProps {
  stage: any;
  entryId: string;
  isVisible: boolean;
}
const TranslatedStage = ({ stage, entryId, isVisible }: TranslatedStageProps) => {
  const { t } = useTranslation();
  // Traduz apenas se visível
  const { translatedText: description } = useTranslateContent(isVisible ? stage.description : '', `${entryId}-${stage.id}-desc`);
  const tierLabel = translateTierLabel(stage.tier, t);
  const stageLabel = translateStageLabel(stage.stage, t);

  return (
    <div className="flex flex-col h-full border border-[hsl(var(--encyclopedia-border))] rounded-lg overflow-hidden bg-[hsl(var(--card))]">
      <div className="w-full aspect-[16/9] overflow-hidden bg-[hsl(var(--muted))]">
        {stage.imageUrl ? (
          stage.link ? (
            <a 
              href={stage.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full h-full group"
            >
              <img
                src={stage.imageUrl}
                alt={stage.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-110 cursor-pointer"
              />
            </a>
          ) : (
            <img
              src={stage.imageUrl}
              alt={stage.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <div className="w-full h-full bg-[hsl(var(--muted))] flex items-center justify-center">
            <div className="text-muted-foreground text-xs">No image</div>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="encyclopedia-title text-xl mb-2 text-center text-[hsl(var(--encyclopedia-title))]">
          {stage.name}
        </h3>

        <div className="text-center border border-[hsl(var(--encyclopedia-border))] px-2 py-1 mb-3 encyclopedia-body text-xs text-[hsl(var(--encyclopedia-text))] bg-[hsl(var(--encyclopedia-badge-bg))] rounded">
          {tierLabel} | {stageLabel} | {stage.types.join(" | ")}
        </div>

        <div 
          className="encyclopedia-body text-xs text-left text-[hsl(var(--encyclopedia-text))] leading-relaxed clamp-3 flex-1"
          dangerouslySetInnerHTML={{ 
            __html: isVisible && description ? description : stage.description.replace(/<[^>]*>/g, '')
          }}
        />
      </div>
    </div>
  );
};

const Page = forwardRef<HTMLDivElement, { entry: EvolutionEntry; isVisible: boolean }>((
  { entry, isVisible }, ref
) => {
  const { translatedText: subtitle } = useTranslateContent(
    isVisible ? entry.subtitle : '',
    `${entry.id}-subtitle`
  );
  return (
    <div ref={ref} className="page bg-[hsl(var(--encyclopedia-card))] p-6 shadow-2xl">
      <div className="w-full h-full flex flex-col">
        <h1 className="encyclopedia-title text-xl text-center mb-1 text-[hsl(var(--encyclopedia-title))] uppercase tracking-wide">
          {entry.title}
        </h1>
        <h2 className="encyclopedia-title text-sm text-center mb-4 text-[hsl(var(--encyclopedia-subtitle))] italic">
          {subtitle || entry.subtitle}
        </h2>

        <div className="flex-1 flex items-stretch justify-center gap-4 px-2">
          {entry.stages.map((stage, index) => (
            <div key={stage.id} className="flex items-stretch gap-3 flex-1">
              <div className="flex-1">
                <TranslatedStage stage={stage} entryId={entry.id} isVisible={isVisible} />
              </div>
              {index < entry.stages.length - 1 && (
                <div className="text-[hsl(var(--encyclopedia-text))] text-2xl font-bold flex items-center">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

Page.displayName = "Page";

const CoverPage = forwardRef<HTMLDivElement, { imageUrl: string }>(
  ({ imageUrl }, ref) => {
    return (
      <div ref={ref} className="page bg-[hsl(var(--encyclopedia-card))] shadow-2xl overflow-hidden">
        <img 
          src={imageUrl} 
          alt="Book Cover"
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }
);

CoverPage.displayName = "CoverPage";

export const FlipBook = ({ entries, coverImage }: FlipBookProps) => {
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const hasSeenHint = localStorage.getItem('flipbook-hint-seen');
    if (!hasSeenHint) {
      setShowHint(true);
      const timer = setTimeout(() => {
        setShowHint(false);
        localStorage.setItem('flipbook-hint-seen', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const goToPreviousPage = () => {
    if (bookRef.current && currentPage > 0) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const goToNextPage = () => {
    const totalPages = coverImage ? entries.length : entries.length - 1;
    if (bookRef.current && currentPage < totalPages) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  if (entries.length === 0) {
    return null;
  }

  // Calculate which entry page is visible (accounting for cover)
  const visibleEntryIndex = coverImage ? currentPage - 1 : currentPage;

  return (
    <div className="flex justify-center items-center w-full py-8 relative">
      {/* Hint inicial */}
      {showHint && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          <p className="text-sm font-medium">
            {t('flipbook.hint', 'Arraste para virar a página ou use as setas de navegação')}
          </p>
        </div>
      )}

      {/* Botão de navegação esquerda */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-40 h-12 w-12 rounded-full shadow-lg bg-background/90 backdrop-blur hover:bg-background"
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{t('flipbook.previous', 'Página anterior')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div style={{ width: "1400px", maxWidth: "100%" }}>
        {/* @ts-ignore */}
        <HTMLFlipBook
          ref={bookRef}
          width={1400}
          height={800}
          size="fixed"
          minWidth={1400}
          maxWidth={1400}
          minHeight={800}
          maxHeight={800}
          showCover={!!coverImage}
          flippingTime={800}
          usePortrait={true}
          startPage={0}
          drawShadow={true}
          className="flipbook single-page mx-auto"
          style={{}}
          maxShadowOpacity={0.5}
          mobileScrollSupport={true}
          startZIndex={0}
          autoSize={false}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={30}
          showPageCorners={true}
          disableFlipByClick={false}
          onFlip={(e: any) => setCurrentPage(e.data)}
        >
          {(() => {
            const pages: JSX.Element[] = [];
            if (coverImage) {
              pages.push(<CoverPage key="cover" imageUrl={coverImage} />);
            }
            entries.forEach((entry, index) => {
              pages.push(
                <Page
                  key={entry.id}
                  entry={entry}
                  isVisible={index === visibleEntryIndex}
                />
              );
            });
            return pages;
          })()}
        </HTMLFlipBook>

        {/* Indicador de página */}
        {!(currentPage === 0 && coverImage) && (
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              {t('flipbook.pageIndicator', 'Página {{current}} de {{total}}', { 
                current: coverImage ? currentPage : currentPage + 1, 
                total: entries.length 
              })}
            </p>
          </div>
        )}
      </div>

      {/* Botão de navegação direita */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-40 h-12 w-12 rounded-full shadow-lg bg-background/90 backdrop-blur hover:bg-background"
              onClick={goToNextPage}
              disabled={currentPage === (coverImage ? entries.length : entries.length - 1)}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{t('flipbook.next', 'Próxima página')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <style>{`
        .flipbook.single-page {
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        }
        .page {
          background-size: cover;
          background-position: center;
        }
        /* Clamp long descriptions to align card heights */
        .flipbook .clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        /* Hide back of pages completely - no mirroring */
        .flipbook .stf__page,
        .flipbook .stf__content,
        .flipbook .stf__item {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        /* Hide the back face of pages */
        .flipbook .stf__page.--back {
          opacity: 0 !important;
          visibility: hidden !important;
        }
        .flipbook .stf__page.--back .page,
        .flipbook .stf__page.--back .stf__content {
          opacity: 0 !important;
          visibility: hidden !important;
        }
        /* During flip, hide content for clean transition */
        .flipbook .stf__item.--flipping .stf__page.--back,
        .flipbook .stf__item.--flipping .stf__page.--back * {
          opacity: 0 !important;
          visibility: hidden !important;
        }
      `}</style>
    </div>
  );
};
