import { useRef, forwardRef } from "react";
import HTMLFlipBook from "react-pageflip";
import { EvolutionEntry } from "@/types/evolution";
import { useTranslateContent } from "@/hooks/useTranslateContent";
import { useTranslation } from "react-i18next";
import { translateTierLabel, translateStageLabel } from "@/lib/translateControlled";

interface FlipBookProps {
  entries: EvolutionEntry[];
}

interface TranslatedStageProps {
  stage: any;
  entryId: string;
}
const TranslatedStage = ({ stage, entryId }: TranslatedStageProps) => {
  const { t } = useTranslation();
  const { translatedText: description } = useTranslateContent(stage.description, `${entryId}-${stage.id}-desc`);
  const tierLabel = translateTierLabel(stage.tier, t);
  const stageLabel = translateStageLabel(stage.stage, t);

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
                alt={stage.name}
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-110 cursor-pointer"
              />
            </a>
          ) : (
            <img
              src={stage.imageUrl}
              alt={stage.name}
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
          {stage.name}
        </h3>

        <div className="text-center border border-[hsl(var(--encyclopedia-border))] px-2 py-1 mb-3 encyclopedia-body text-xs text-[hsl(var(--encyclopedia-text))] bg-[hsl(var(--encyclopedia-badge-bg))] rounded">
          {tierLabel} | {stageLabel} | {stage.types.join(" | ")}
        </div>

        <div 
          className="encyclopedia-body text-xs text-left text-[hsl(var(--encyclopedia-text))] leading-relaxed"
          dangerouslySetInnerHTML={{ 
            __html: description
          }}
        />
      </div>
    </div>
  );
};

const Page = forwardRef<HTMLDivElement, { entry: EvolutionEntry }>(({ entry }, ref) => {
  const { translatedText: subtitle } = useTranslateContent(entry.subtitle, `${entry.id}-subtitle`);

  return (
    <div ref={ref} className="page bg-[hsl(var(--encyclopedia-card))] p-6 shadow-2xl">
      <div className="page-surface">
        <div className="page-face front">
          <div className="w-full h-full flex flex-col">
            <h1 className="encyclopedia-title text-xl text-center mb-1 text-[hsl(var(--encyclopedia-title))] uppercase tracking-wide">
              {entry.title}
            </h1>
            <h2 className="encyclopedia-title text-sm text-center mb-4 text-[hsl(var(--encyclopedia-subtitle))] italic">
              {subtitle || entry.subtitle}
            </h2>

            <div className="flex-1 flex items-start justify-center gap-4 px-2">
              {entry.stages.map((stage, index) => (
                <div key={stage.id} className="flex items-center gap-3">
                  <TranslatedStage stage={stage} entryId={entry.id} />
                  {index < entry.stages.length - 1 && (
                    <div className="text-[hsl(var(--encyclopedia-text))] text-2xl font-bold">→</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="page-face back" />
      </div>
    </div>
  );
});

Page.displayName = "Page";

export const FlipBook = ({ entries }: FlipBookProps) => {
  const bookRef = useRef<any>(null);

  if (entries.length === 0) {
    return null;
  }

  // Páginas com IDs estáveis (apenas frente); o verso será branco via CSS 3D
  const pages = entries.map((entry) => ({ entry, id: entry.id }));

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
        >
          {pages.map((page) => (
            <Page 
              key={page.id}
              entry={page.entry}
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
        /* Frente/verso: verso em branco */
        .page-surface { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; }
        .page-face { position: absolute; inset: 0; backface-visibility: hidden; }
        .page-face.back { transform: rotateY(180deg); background: hsl(var(--card)); }
      `}</style>
    </div>
  );
};
