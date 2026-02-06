import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./ui/utils";
import { COLORS, GLOWS } from "../theme";

type ElectricCardProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  semanticColor?: string;
  glowIntensity?: "soft" | "medium" | "strong";
  elevation?: 0 | 1 | 2;
};

export const ElectricCard = ({
  children,
  className,
  style,
  delay = 0,
  semanticColor = COLORS.electricCyan,
  glowIntensity = "soft",
  elevation = 1,
}: ElectricCardProps) => {
  const elevationStyles = {
    0: { shadow: GLOWS.ambient(0.2), y: 0, scale: 1 },
    1: { shadow: GLOWS.ambient(0.6), y: 0, scale: 1 },
    2: { shadow: GLOWS.ambient(0.8), y: -8, scale: 1.01 },
  }[elevation];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: elevationStyles.y }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "relative group bg-[#101A2E] rounded-[2.5rem] border border-white/[0.03] p-8 transition-all duration-500",
        className
      )}
      style={{
        boxShadow: `${elevationStyles.shadow}, ${GLOWS.inner}, ${GLOWS[glowIntensity](semanticColor)}`,
        ...style,
      }}
      whileHover={{
        y: elevationStyles.y - 4,
        boxShadow: `${GLOWS.ambient(0.8)}, ${GLOWS.inner}, ${GLOWS.medium(semanticColor)}`,
        borderColor: `${semanticColor}20`,
        rotateX: elevation === 2 ? 1 : 0,
        rotateY: elevation === 2 ? 1 : 0,
      }}
    >
      {children}
    </motion.div>
  );
};

export const ReflectionPulse = ({
  active,
  color = COLORS.electricGreen,
}: {
  active: boolean;
  color?: string;
}) => (
  <AnimatePresence>
    {active && (
      <motion.div
        initial={{ scale: 0.8, opacity: 0.8 }}
        animate={{ scale: 2.5, opacity: 0 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 pointer-events-none rounded-[2.5rem] border-4 z-10"
        style={{ borderColor: color, boxShadow: `0 0 60px ${color}80` }}
      />
    )}
  </AnimatePresence>
);
