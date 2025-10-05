import { useRef, forwardRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { EvolutionEntry } from "@/types/evolution";
import { useTranslateContent } from "@/hooks/useTranslateContent";
import { useTranslation } from "react-i18next";
import { translateTierLabel, translateStageLabel, translateTypeLabel } from "@/lib/translateControlled";

interface FlipBookProps {
  entries: EvolutionEntry[];
}

interface TranslatedStageProps {
  stage: any;
  entryId: string;
  isVisible: boolean;
}
const TranslatedStage = ({ stage, entryId, isVisible }: TranslatedStageProps) => {
  const { t } = useTranslation();
  // Traduz apenas se visível
  const { translatedText: name } = useTranslateContent(isVisible ? stage.name : '', `${entryId}-${stage.id}-name`);
  const { translatedText: description } = useTranslateContent(isVisible ? stage.description : '', `${entryId}-${stage.id}-desc`);
  const tierLabel = translateTierLabel(stage.tier, t);
  const stageLabel = translateStageLabel(stage.stage, t);
  const typeLabels = (stage.types || []).map((type: string) => translateTypeLabel(type, t));

  return (
    <div className="flex flex-col w-full border border-[hsl(var(--encyclopedia-border))] rounded-lg overflow-hidden bg-[hsl(var(--card))]">
      <div className="w-full aspect-[16/9] overflow-hidden">
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
                alt={isVisible ? name : stage.name}
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-110 cursor-pointer"
              />
            </a>
          ) : (
            <img
              src={stage.imageUrl}
              alt={isVisible ? name : stage.name}
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <div className="w-full h-full bg-[hsl(var(--muted))] flex items-center justify-center">
            <div className="text-muted-foreground text-xs">No image</div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="encyclopedia-title text-xl mb-2 text-center text-[hsl(var(--encyclopedia-title))]">
          {isVisible && name ? name : stage.name}
        </h3>

        <div className="text-center border border-[hsl(var(--encyclopedia-border))] px-2 py-1 mb-3 encyclopedia-body text-xs text-[hsl(var(--encyclopedia-text))] bg-[hsl(var(--encyclopedia-badge-bg))] rounded">
          {tierLabel} | {stageLabel} | {typeLabels.join(" | ")}
        </div>

        <div 
          className="encyclopedia-body text-xs text-left text-[hsl(var(--encyclopedia-text))] leading-relaxed"
          dangerouslySetInnerHTML={{ 
            __html: isVisible && description ? description : stage.description.replace(/<[^>]*>/g, '')
          }}
        />
      </div>
    </div>
  );
};

const Page = forwardRef<HTMLDivElement, { entry: EvolutionEntry; isVisible: boolean }>(({ entry, isVisible }, ref) => {
  const { translatedText: title } = useTranslateContent(isVisible ? entry.title : '', `${entry.id}-title`);
  const { translatedText: subtitle } = useTranslateContent(isVisible ? entry.subtitle : '', `${entry.id}-subtitle`);
  return (
    <div ref={ref} className="page bg-[hsl(var(--encyclopedia-card))] p-6 shadow-2xl">
      <div className="w-full h-full flex flex-col">
        <h1 className="encyclopedia-title text-xl text-center mb-1 text-[hsl(var(--encyclopedia-title))] uppercase tracking-wide">
          {title || entry.title}
        </h1>
        <h2 className="encyclopedia-title text-sm text-center mb-4 text-[hsl(var(--encyclopedia-subtitle))] italic">
          {subtitle || entry.subtitle}
        </h2>

        <div className="flex-1 flex items-start justify-center gap-4 px-2">
          {entry.stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center gap-3">
              <TranslatedStage stage={stage} entryId={entry.id} isVisible={isVisible} />
              {index < entry.stages.length - 1 && (
                <div className="text-[hsl(var(--encyclopedia-text))] text-2xl font-bold">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

Page.displayName = "Page";

export const FlipBook = ({ entries }: FlipBookProps) => {
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-center items-center w-full py-8">
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
          showCover={false}
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
          {entries.map((entry, index) => (
            <Page 
              key={entry.id} 
              entry={entry} 
              isVisible={index === currentPage}
            />
          ))}
        </HTMLFlipBook>
      </div>
      <style>{`
        .flipbook.single-page {
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        }
        .page {
          background-size: cover;
          background-position: center;
        }
      `}</style>
    </div>
  );
};
