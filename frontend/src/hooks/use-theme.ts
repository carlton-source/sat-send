import { create } from "zustand";

type Theme = "dark" | "light";

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

const stored = (typeof window !== "undefined" ? localStorage.getItem("satsend-theme") : null) as Theme | null;
const initial: Theme = stored ?? "dark";
applyTheme(initial);

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: initial,
  toggleTheme: () =>
    set((state) => {
      const next: Theme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("satsend-theme", next);
      applyTheme(next);
      return { theme: next };
    }),
}));
