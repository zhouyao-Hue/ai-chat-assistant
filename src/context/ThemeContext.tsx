import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Theme, ThemeContextValue } from "@/types";

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * 类型守卫：判断值是否为合法 Theme。
 * @param value - 任意值（如 localStorage 读出）
 * @returns 是否为 light | dark
 */
function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

/**
 * 提供 light/dark 主题与切换，同步 data-theme 与 localStorage。
 * @param props.children - 子树
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");
    return isTheme(saved) ? saved : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((prev) => (prev === "light" ? "dark" : "light")),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * 读取当前主题与 toggleTheme；须在 ThemeProvider 内使用。
 * @returns ThemeContext 值
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme 必须在 ThemeProvider 内使用");
  }
  return ctx;
}
