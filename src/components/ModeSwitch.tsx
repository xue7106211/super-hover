import { Crosshair, MousePointer2, type LucideIcon } from "lucide-react";
import type { HoverMode } from "../hoverMode";
import { SegmentedControl } from "./SegmentedControl";

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
    <SegmentedControl
      ariaLabel="Hover mode"
      value={mode}
      options={OPTIONS}
      onChange={onChange}
    />
  );
}
