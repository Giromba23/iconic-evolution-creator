import { EvolutionEntry } from "@/types/evolution";
import { ArrowRight } from "lucide-react";

interface EvolutionViewerProps {
  entry: EvolutionEntry;
}

export const EvolutionViewer = ({ entry }: EvolutionViewerProps) => {
  return (
    <div className="w-full max-w-[1400px] mx-auto p-8 bg-[hsl(var(--encyclopedia-card))] rounded-lg shadow-lg border border-[hsl(var(--encyclopedia-border))]">
      <h1 className="encyclopedia-title text-3xl md:text-4xl text-center mb-2 text-[hsl(var(--encyclopedia-title))] uppercase tracking-wide">
        {entry.title}
      </h1>
      <h2 className="encyclopedia-title text-lg text-center mb-10 text-[hsl(var(--encyclopedia-subtitle))] italic">
        {entry.subtitle}
      </h2>

      <div className="flex items-center justify-center gap-8 flex-wrap md:flex-nowrap">
        {entry.stages.map((stage, index) => (
          <>
            <div
              key={stage.id}
              className="w-[320px] bg-gradient-to-b from-cyan-950/40 to-purple-950 rounded-2xl overflow-hidden border-2 border-cyan-500/30 shadow-2xl"
            >
              {/* Image Section with Gradient Background */}
              <div className="relative w-full h-[380px] bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-end justify-center overflow-hidden">
                {stage.imageUrl ? (
                  <img
                    src={stage.imageUrl}
                    alt={stage.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-cyan-100/60 text-sm">No image</div>
                )}
              </div>

              {/* Info Section */}
              <div className="p-5 bg-gradient-to-b from-slate-900 to-purple-950/90">
                {/* Title and Level */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="encyclopedia-title text-2xl text-white leading-tight flex-1">
                    {stage.name}
                  </h3>
                  <span className="text-white/80 text-sm font-semibold ml-2">
                    LVL {stage.stage}
                  </span>
                </div>

                {/* Subtitle */}
                <p className="text-cyan-400/70 text-sm mb-4 encyclopedia-body">
                  {stage.tier}
                </p>

                {/* Types/Badges */}
                <div className="flex flex-wrap gap-2">
                  {stage.types.map((type, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 text-white/90 text-sm encyclopedia-body"
                    >
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
                        <span className="text-xs">✦</span>
                      </div>
                      {type}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {index < entry.stages.length - 1 && (
              <div className="flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-10 h-10 text-cyan-400/60" />
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
};
