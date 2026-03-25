import { COLORS } from "./theme";

export type ValueTier = "poor" | "below_optimal" | "decent" | "high_value" | "unknown";

export type ValuePresentation = {
  score: number | null;
  scoreText: string;
  tier: ValueTier;
  label: string;
  tone: string;
  accentColor: string;
  trackColor: string;
};

const MIN_SCORE = 0;
const MAX_SCORE = 150;

function clampScore(score: number) {
  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, Math.round(score)));
}

export function getValuePresentation(score: number | null | undefined): ValuePresentation {
  if (score == null || Number.isNaN(score)) {
    return {
      score: null,
      scoreText: "—",
      tier: "unknown",
      label: "No score yet",
      tone: "Waiting for more usage data.",
      accentColor: "#94A3B8",
      trackColor: "rgba(148,163,184,0.2)",
    };
  }

  const normalized = clampScore(score);

  if (normalized >= 101) {
    return {
      score: normalized,
      scoreText: String(normalized),
      tier: "high_value",
      label: "High Value",
      tone: "Performing above your target range.",
      accentColor: COLORS.electricGreen,
      trackColor: `${COLORS.electricGreen}22`,
    };
  }

  if (normalized >= 100) {
    return {
      score: normalized,
      scoreText: String(normalized),
      tier: "decent",
      label: "Decent",
      tone: "Landing in your expected value range.",
      accentColor: COLORS.electricCyan,
      trackColor: `${COLORS.electricCyan}22`,
    };
  }

  if (normalized >= 80) {
    return {
      score: normalized,
      scoreText: String(normalized),
      tier: "below_optimal",
      label: "Below Optimal",
      tone: "Close, but not fully earning its cost.",
      accentColor: COLORS.electricYellow,
      trackColor: `${COLORS.electricYellow}22`,
    };
  }

  return {
    score: normalized,
    scoreText: String(normalized),
    tier: "poor",
    label: "Poor Value",
    tone: "Underperforming for what you pay.",
    accentColor: COLORS.electricRed,
    trackColor: `${COLORS.electricRed}22`,
  };
}

export function getValueMeterWidth(score: number | null | undefined) {
  if (score == null || Number.isNaN(score)) return 0;
  return (clampScore(score) / MAX_SCORE) * 100;
}
