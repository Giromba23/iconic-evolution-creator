import { useRef, forwardRef } from "react";
import HTMLFlipBook from "react-pageflip";
import { EvolutionEntry } from "@/types/evolution";

interface FlipBookProps {
  entries: EvolutionEntry[];
}

const Page = forwardRef<HTMLDivElement, { entry: EvolutionEntry }>(({ entry }, ref) => {
  return (
    <div ref={ref} className="page bg-[hsl(var(--encyclopedia-card))] p-8 shadow-2xl">
      <div className="w-full h-full flex flex-col">
        <h1 className="encyclopedia-title text-2xl text-center mb-1 text-[hsl(var(--encyclopedia-title))] uppercase tracking-wide">
          {entry.title}
        </h1>
        <h2 className="encyclopedia-title text-sm text-center mb-6 text-[hsl(var(--encyclopedia-subtitle))] italic">
          {entry.subtitle}
        </h2>

        <div className="flex-1 flex items-start justify-center gap-6 px-4">
          {entry.stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center gap-4">
              <div className="flex flex-col w-[400px] border border-[hsl(var(--encyclopedia-border))] rounded-lg p-6 bg-white/5">
                <div className="w-full h-[400px] mb-4 bg-gradient-to-b from-purple-600/40 to-purple-900/60 rounded-lg flex items-center justify-center overflow-hidden">
                  {stage.imageUrl ? (
                    <img
                      src={stage.imageUrl}
                      alt={stage.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-muted-foreground text-xs">No image</div>
                  )}
                </div>

                <h3 className="encyclopedia-title text-xl mb-3 text-center text-[hsl(var(--encyclopedia-title))]">
                  {stage.name}
                </h3>

                <div className="text-center border border-[hsl(var(--encyclopedia-border))] px-3 py-2 mb-3 encyclopedia-body text-xs text-[hsl(var(--encyclopedia-text))] bg-[hsl(var(--encyclopedia-badge-bg))] rounded">
                  {stage.tier} | {stage.stage} | {stage.types.join(" | ")}
                </div>

                <div className="encyclopedia-body text-xs text-left text-[hsl(var(--encyclopedia-text))] leading-relaxed flex-1">
                  {stage.description.replace(/<[^>]*>/g, '')}
                </div>
              </div>
              {index < entry.stages.length - 1 && (
                <div className="text-[hsl(var(--encyclopedia-text))] text-3xl font-bold">→</div>
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

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-center items-center w-full py-8" style={{ perspective: "2000px" }}>
      {/* @ts-ignore */}
      <HTMLFlipBook
        ref={bookRef}
        width={1600}
        height={1000}
        size="stretch"
        minWidth={1200}
        maxWidth={2000}
        minHeight={800}
        maxHeight={1200}
        showCover={true}
        flippingTime={800}
        usePortrait={false}
        startPage={0}
        drawShadow={true}
        className="flipbook"
        style={{ margin: "0 auto" }}
        maxShadowOpacity={0.5}
        mobileScrollSupport={true}
        startZIndex={0}
        autoSize={false}
        clickEventForward={true}
        useMouseEvents={true}
        swipeDistance={30}
        showPageCorners={true}
        disableFlipByClick={false}
      >
        {entries.map((entry) => (
          <Page key={entry.id} entry={entry} />
        ))}
      </HTMLFlipBook>
      <style>{`
        .flipbook {
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
