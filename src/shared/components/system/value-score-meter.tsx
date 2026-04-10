import { COLORS } from "@/shared/theme";
import { cn } from "@/shared/components/ui/utils";

type ValueScoreMeterProps = {
  score: number;
  className?: string;
};

function clampValueScore(score: number) {
  return Math.max(0, Math.min(150, score));
}

function ValueScoreMeter({ score, className }: ValueScoreMeterProps) {
  const normalizedScore = clampValueScore(score);
  const overflowWidth =
    normalizedScore > 100 ? Math.min(100, ((normalizedScore - 100) / 50) * 100) * 0.333333 : 0;
  const baseWidth = Math.min(66.6667, (Math.min(normalizedScore, 100) / 100) * 66.6667);
  const baseColor =
    normalizedScore >= 80
      ? COLORS.electricGreen
      : normalizedScore >= 60
        ? "#fb923c"
        : COLORS.electricRed;

  return (
    <div className={cn("relative pt-3", className)}>
      <div className="relative h-2 overflow-hidden rounded-full bg-[var(--app-color-surface-overlay)]">
        <div
          className="absolute left-0 top-0 h-full"
          style={{
            width: "33.3333%",
            backgroundColor: "rgba(255,255,255,0.04)",
          }}
        />
        <div
          className="absolute right-0 top-0 h-full"
          style={{
            width: "66.6667%",
            backgroundColor: "rgba(255,255,255,0.04)",
          }}
        />
        {normalizedScore > 100 ? (
          <div
            className="absolute top-0 h-full rounded-l-full transition-all"
            style={{
              left: `${33.3333 - overflowWidth}%`,
              width: `${overflowWidth}%`,
              backgroundColor: COLORS.electricBlue,
              boxShadow: `0 0 16px ${COLORS.electricBlue}66`,
            }}
          />
        ) : null}
        <div
          className="absolute right-0 top-0 h-full rounded-r-full transition-all"
          style={{
            width: `${baseWidth}%`,
            backgroundColor: baseColor,
          }}
        />
      </div>
      <div
        className="absolute top-0 h-5 w-px bg-[var(--app-color-text-faint)]"
        style={{ left: "33.3333%" }}
      />
      <div
        className="absolute top-5 -translate-x-1/2 text-[9px] font-black uppercase tracking-[0.16em] text-[var(--app-color-text-faint)]"
        style={{ left: "33.3333%" }}
      >
        100
      </div>
    </div>
  );
}

export { ValueScoreMeter };
