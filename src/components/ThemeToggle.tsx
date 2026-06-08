import { Sun, Moon, Monitor, type LucideIcon } from "lucide-react";
import type { Theme } from "../useTheme";

type ThemeToggleProps = {
  theme: Theme;
  onChange: (theme: Theme) => void;
};

const OPTIONS: { value: Theme; label: string; Icon: LucideIcon }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

/**
 * 分段式三态切换控件。激活项高亮，其余可点击切换。
 */
export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-neutral-100 p-1 dark:border-neutral-800 dark:bg-neutral-900"
    >
      {OPTIONS.map((opt) => {
        const active = theme === opt.value;
        const { Icon } = opt;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            title={opt.label}
            className={
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors " +
              (active
                ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100"
                : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200")
            }
          >
            <Icon
              aria-hidden
              className={
                "transition-all duration-300 ease-out " +
                (active
                  ? "h-4 w-4 rotate-0 scale-110 opacity-100"
                  : "h-3.5 w-3.5 -rotate-90 scale-90 opacity-70")
              }
            />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
