export const COLORS = {
  bgPrimary: "#0B1220",
  bgCard: "#101A2E",
  bgCardHover: "#14203A",
  electricGreen: "#3CFF9E",
  electricRed: "#FF4D4D",
  electricBlue: "#3B82FF",
  electricCyan: "#22F0FF",
  electricTeal: "#00FFD1",
  electricPurple: "#B47CFF",
  electricYellow: "#FFE066",
};

export const GLOWS = {
  soft: (color: string) => `0 0 12px ${color}40`,
  medium: (color: string) => `0 0 24px ${color}59`,
  strong: (color: string) => `0 0 40px ${color}8c`,
  inner: "inset 0 0 1px rgba(255,255,255,0.15)",
  ambient: (opacity = 0.6) => `0 20px 60px rgba(0,0,0,${opacity})`,
};
