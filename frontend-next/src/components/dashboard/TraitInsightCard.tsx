import Image from "next/image";

type TraitInsightCardProps = {
  trait: {
    name: string;
    score: number;
    colorVar: string;
    shortDescription: string;
    yourDescription: string;
  };
};

const levelLabel = (score: number) => {
  if (score >= 75) return "High";
  if (score >= 60) return "Moderate-High";
  if (score >= 45) return "Average";
  if (score >= 25) return "Moderate-Low";
  return "Low";
};

const traitImages: Record<string, string> = {
  Openness: "/traits/openness.jpeg",
  Conscientiousness: "/traits/conscientiousness.jpeg",
  Extraversion: "/traits/extraversion.jpeg",
  Agreeableness: "/traits/agreeableness.jpeg",
  Neuroticism: "/traits/neuroticism.jpeg",
};

export function TraitInsightCard({ trait }: TraitInsightCardProps) {
  const level = levelLabel(trait.score);
  const imageSrc = traitImages[trait.name];

  return (
    <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[20px] overflow-hidden flex flex-col md:flex-row group hover:border-[color:var(--color-accent)]/40 transition-all">
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full flex-none" style={{ background: trait.colorVar }} />
            <h3 className="font-display text-[22px]">{trait.name}</h3>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-[7px] flex-none" style={{ color: trait.colorVar, background: `color-mix(in srgb, ${trait.colorVar} 14%, transparent)` }}>{level}</span>
        </div>

        <div className="mb-4">
          <div className="text-faint text-[10.5px] uppercase tracking-wider mb-1.5">What it means</div>
          <p className="text-muted text-[13.5px] leading-relaxed">{trait.shortDescription}</p>
        </div>

        <div>
          <div className="text-faint text-[10.5px] uppercase tracking-wider mb-1.5">What it looks like for you</div>
          <p className="text-text text-[14px] leading-relaxed">{trait.yourDescription}</p>
        </div>
      </div>

      <div className="md:w-[200px] md:flex-none relative bg-surface-2 md:border-l border-t md:border-t-0 border-[color:var(--color-border-subtle)] aspect-[16/10] md:aspect-auto md:min-h-[240px]">
        <Image src={imageSrc} alt={trait.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 200px" />
      </div>
    </div>
  );
}
