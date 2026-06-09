import { Sun, Moon, Monitor, type LucideIcon } from "lucide-react";
import type { Theme } from "../useTheme";
import { SegmentedControl } from "./SegmentedControl";

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
    <SegmentedControl
      ariaLabel="Color theme"
      value={theme}
      options={OPTIONS}
      onChange={onChange}
    />
  );
}
