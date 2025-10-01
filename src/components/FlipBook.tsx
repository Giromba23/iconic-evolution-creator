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
        <h1 className="encyclopedia-title text-3xl text-center mb-2 text-[hsl(var(--encyclopedia-title))] uppercase tracking-wide">
          {entry.title}
        </h1>
        <h2 className="encyclopedia-title text-base text-center mb-6 text-[hsl(var(--encyclopedia-subtitle))] italic">
          {entry.subtitle}
        </h2>

        <div className="flex-1 flex items-center justify-center gap-4 overflow-hidden">
          {entry.stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center gap-2">
              <div className="flex-1 max-w-[200px] text-center">
                <div className="w-full h-[180px] mb-3 border border-[hsl(var(--encyclopedia-border))] bg-[hsl(var(--encyclopedia-card))] rounded flex items-center justify-center overflow-hidden">
                  {stage.imageUrl ? (
                    <img
                      src={stage.imageUrl}
                      alt={stage.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground text-xs">No image</div>
                  )}
                </div>

                <h3 className="encyclopedia-title text-lg mb-2 text-[hsl(var(--encyclopedia-title))]">
                  {stage.name}
                </h3>

                <div className="inline-block border border-[hsl(var(--encyclopedia-border))] px-2 py-1 mb-2 encyclopedia-body text-[10px] text-[hsl(var(--encyclopedia-text))] bg-[hsl(var(--encyclopedia-badge-bg))]">
                  {stage.tier} | {stage.stage}
                </div>

                <div className="encyclopedia-body text-[10px] text-left text-[hsl(var(--encyclopedia-text))] leading-relaxed line-clamp-4">
                  {stage.description.replace(/<[^>]*>/g, '')}
                </div>
              </div>
              {index < entry.stages.length - 1 && (
                <div className="text-[hsl(var(--encyclopedia-text))]">→</div>
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
    <div className="flex justify-center items-center w-full" style={{ perspective: "2000px" }}>
      {/* @ts-ignore */}
      <HTMLFlipBook
        ref={bookRef}
        width={600}
        height={700}
        size="stretch"
        minWidth={300}
        maxWidth={800}
        minHeight={400}
        maxHeight={900}
        showCover={true}
        flippingTime={800}
        usePortrait={true}
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
