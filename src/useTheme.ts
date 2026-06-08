import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

function getStored(): Theme {
  if (typeof localStorage === "undefined") return "system";
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "light" || v === "dark" || v === "system" ? v : "system";
}

/**
 * 三态主题：light / dark / system。
 * - 把解析后的主题以 `.dark` class 写到 <html>，驱动 Tailwind 的 dark: 变体
 * - 同步设置 color-scheme，让原生控件（滚动条、表单）也跟着变
 * - system 模式下监听 prefers-color-scheme，系统切换时实时跟随
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getStored);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const resolved =
        theme === "system" ? (mql.matches ? "dark" : "light") : theme;
      const root = document.documentElement;
      root.classList.toggle("dark", resolved === "dark");
      root.style.colorScheme = resolved;
    };

    apply();
    // 仅在跟随系统时，系统主题变化才需要重新解析
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return { theme, setTheme };
}
