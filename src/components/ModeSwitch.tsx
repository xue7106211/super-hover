import { Crosshair, MousePointer2, type LucideIcon } from "lucide-react";
import type { HoverMode } from "../hoverMode";

type ModeSwitchProps = {
  mode: HoverMode;
  onChange: (mode: HoverMode) => void;
};

const OPTIONS: { value: HoverMode; label: string; Icon: LucideIcon }[] = [
  { value: "super", label: "Super Hover", Icon: Crosshair },
  { value: "native", label: "Native :hover", Icon: MousePointer2 },
];

/**
 * 分段式两态切换控件,用于在 Super Hover 与原生 :hover 之间切换(Req 1.2/1.3)。
 * 激活项高亮并以 aria-checked 标注当前模式(Req 1.6),其余可点击切换。
 * 复用 ThemeToggle 的分段式 radiogroup 视觉,保持面板内控件风格一致。
 */
export function ModeSwitch({ mode, onChange }: ModeSwitchProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Hover mode"
      className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-neutral-100 p-1 dark:border-neutral-800 dark:bg-neutral-900"
    >
      {OPTIONS.map((opt) => {
        const active = mode === opt.value;
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
                  ? "h-4 w-4 scale-110 opacity-100"
                  : "h-3.5 w-3.5 scale-90 opacity-70")
              }
            />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
