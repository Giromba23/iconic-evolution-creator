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

        <div className="flex-1 flex items-start justify-center gap-8 px-4">
          {entry.stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center gap-6">
              <div className="flex flex-col w-[430px] border border-[hsl(var(--encyclopedia-border))] rounded-lg overflow-hidden bg-[hsl(var(--card))]">
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

                <div className="p-5">
                  <h3 className="encyclopedia-title text-2xl mb-3 text-center text-[hsl(var(--encyclopedia-title))]">
                    {stage.name}
                  </h3>

                  <div className="text-center border border-[hsl(var(--encyclopedia-border))] px-3 py-2 mb-4 encyclopedia-body text-xs text-[hsl(var(--encyclopedia-text))] bg-[hsl(var(--encyclopedia-badge-bg))] rounded">
                    {stage.tier} | {stage.stage} | {stage.types.join(" | ")}
                  </div>

                  <div className="encyclopedia-body text-sm text-left text-[hsl(var(--encyclopedia-text))] leading-relaxed">
                    {stage.description.replace(/<[^>]*>/g, '')}
                  </div>
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
        width={1920}
        height={1200}
        size="stretch"
        minWidth={1600}
        maxWidth={1920}
        minHeight={1000}
        maxHeight={1400}
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
