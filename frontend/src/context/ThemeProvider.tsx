"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

type Theme = "light" | "dark";

export interface ChartColors {
  accent: string;
  unlock: string;
  warn: string;
  danger: string;
  ok: string;
  muted: string;
  border: string;
  text: string;
  surface: string;
  surface2: string;
}

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  chartColors: ChartColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LIGHT_CHART_COLORS: ChartColors = {
  accent: "#1d4ed8",
  unlock: "#0d9488",
  warn: "#d97706",
  danger: "#dc2626",
  ok: "#16a34a",
  muted: "#64748b",
  border: "#e2e8f0",
  text: "#0f172a",
  surface: "#ffffff",
  surface2: "#f8f9fa",
};

const DARK_CHART_COLORS: ChartColors = {
  accent: "#3b82f6",
  unlock: "#14b8a6",
  warn: "#f59e0b",
  danger: "#ef4444",
  ok: "#22c55e",
  muted: "#9ca3af",
  border: "#374151",
  text: "#f9fafb",
  surface: "#111827",
  surface2: "#1f2937",
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("govdash_theme");
      if (saved === "light" || saved === "dark") {
        setThemeState(saved);
        if (saved === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        // Default to system preference
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initial = prefersDark ? "dark" : "light";
        setThemeState(initial);
        if (initial === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    } catch {}
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("govdash_theme", newTheme);
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {}
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isDark = theme === "dark";
  const chartColors = useMemo(() => isDark ? DARK_CHART_COLORS : LIGHT_CHART_COLORS, [isDark]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme, chartColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
