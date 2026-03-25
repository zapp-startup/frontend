import { Moon, Sun } from "lucide-react";
import { useAppThemeMode } from "@/shared/theme-provider";

export function ThemeModeToggle() {
  const { mode, toggleMode } = useAppThemeMode();
  const isDark = mode === "dark";

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="app-panel flex h-12 items-center gap-2 rounded-2xl px-4 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--app-text-secondary)] transition-all hover:text-[var(--app-text-primary)]"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
