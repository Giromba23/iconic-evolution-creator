import { EvolutionEntry } from "@/types/evolution";
import { ArrowRight } from "lucide-react";
import { useTranslateContent } from "@/hooks/useTranslateContent";
import { useTranslation } from "react-i18next";

interface EvolutionViewerProps {
  entry: EvolutionEntry;
}

const TranslatedStage = ({ stage, entryId }: { stage: any; entryId: string }) => {
  const { t } = useTranslation();
  const { translatedText: name } = useTranslateContent(stage.name, `${entryId}-${stage.id}-name`);
  const { translatedText: description } = useTranslateContent(stage.description, `${entryId}-${stage.id}-desc`);
  const { translatedText: tier } = useTranslateContent(stage.tier, `${entryId}-${stage.id}-tier`);
  const { translatedText: stageText } = useTranslateContent(stage.stage, `${entryId}-${stage.id}-stage`);

  return (
    <div className="flex-1 min-w-[280px] max-w-[350px] text-center p-4 bg-[hsl(var(--encyclopedia-card))] border border-[hsl(var(--encyclopedia-border))] rounded-md shadow-sm">
      <div className="w-full h-[200px] mb-4 border border-[hsl(var(--encyclopedia-border))] bg-[hsl(var(--encyclopedia-card))] rounded flex items-center justify-center overflow-hidden">
        {stage.imageUrl ? (
          <img
            src={stage.imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-muted-foreground">No image</div>
        )}
      </div>

      <h3 className="encyclopedia-title text-2xl mb-3 text-[hsl(var(--encyclopedia-title))]">
        {name}
      </h3>

      <div className="inline-block border border-[hsl(var(--encyclopedia-border))] px-3 py-1 mb-4 encyclopedia-body text-xs text-[hsl(var(--encyclopedia-text))] bg-[hsl(var(--encyclopedia-badge-bg))]">
        {tier} | {stageText} | {stage.types.join(" | ")}
      </div>

      <div
        className="encyclopedia-body text-sm text-left text-[hsl(var(--encyclopedia-text))] leading-relaxed whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );
};

export const EvolutionViewer = ({ entry }: EvolutionViewerProps) => {
  const { translatedText: title } = useTranslateContent(entry.title, `${entry.id}-title`);
  const { translatedText: subtitle } = useTranslateContent(entry.subtitle, `${entry.id}-subtitle`);

  return (
    <div className="w-full max-w-[1400px] mx-auto p-8 bg-[hsl(var(--encyclopedia-card))] rounded-lg shadow-lg border border-[hsl(var(--encyclopedia-border))]">
      <h1 className="encyclopedia-title text-3xl md:text-4xl text-center mb-2 text-[hsl(var(--encyclopedia-title))] uppercase tracking-wide">
        {title}
      </h1>
      <h2 className="encyclopedia-title text-lg text-center mb-10 text-[hsl(var(--encyclopedia-subtitle))] italic">
        {subtitle}
      </h2>

      <div className="flex items-start justify-center gap-5 flex-wrap md:flex-nowrap overflow-x-auto">
        {entry.stages.map((stage, index) => (
          <>
            <TranslatedStage key={stage.id} stage={stage} entryId={entry.id} />
            {index < entry.stages.length - 1 && (
              <div className="flex items-center justify-center self-center flex-shrink-0 mx-2">
                <ArrowRight className="w-10 h-10 text-[hsl(var(--encyclopedia-text))]" />
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
};