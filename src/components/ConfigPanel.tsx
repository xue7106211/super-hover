import { useState } from "react";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import type { HoverMode } from "../hoverMode";
import type { Album } from "../data";
import type { Theme } from "../useTheme";
import { ModeSwitch } from "./ModeSwitch";
import { StatusPanel } from "./StatusPanel";
import { ThemeToggle } from "./ThemeToggle";

type ConfigPanelProps = {
  mode: HoverMode;
  onModeChange: (mode: HoverMode) => void;
  album: Album | null;
  pointer: { x: number; y: number };
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
};

/**
 * 贴右侧、常驻、可折叠的悬浮配置面板(Config_Panel)。
 *
 * 本文件为「骨架」实现(tasks.md 任务 3):
 * - 完成 position: fixed 贴右侧、垂直居中、高于内容的堆叠层级、超高内部滚动等容器布局
 *   (Req 4.1/4.2/4.3/4.4/4.5)。
 * - 完成展开/收起两态切换:默认展开(Req 5.1),展开态依次渲染真实控件 Mode_Switch /
 *   Status_Section / Theme_Control(Req 5.2);收起态仅保留一个可点击触发控件用于重新展开
 *   (Req 5.3/5.4/5.5)。折叠仅改本地 `panelOpen`,不触碰 mode/theme(Req 5.6)。
 *
 * 任务 4 已组装真实控件:<ModeSwitch>(模式切换)、<StatusPanel>(激活项/指针状态)、
 * <ThemeToggle>(主题切换迁入面板),数据经 props 透传。
 */
export function ConfigPanel({
  mode,
  onModeChange,
  album,
  pointer,
  theme,
  onThemeChange,
}: ConfigPanelProps) {
  // 展开/收起仅为 UI 态,默认展开(Req 5.1)。不影响任何业务状态(Req 5.6)。
  const [panelOpen, setPanelOpen] = useState(true);

  // 外层:fixed 贴右侧、垂直居中、高于主内容(Req 4.1/4.2)。
  // top-1/2 -translate-y-1/2 让面板随视口居中,resize 时自动重算位置(Req 4.5),无需手写监听。
  //
  // 缓动动画思路:展开/收起两态的 DOM 同时挂载,通过 translate-x + opacity 过渡互相切换,
  // 而不是条件 return(条件 return 会卸载/挂载不同节点,没有可过渡的中间态)。
  // 隐藏的一侧用 translate-x-full 滑出右侧屏外 + opacity-0 + pointer-events-none 屏蔽交互,
  // 并用 aria-hidden 对辅助技术隐藏。
  const shellClassName = "fixed right-0 top-1/2 z-50 -translate-y-1/2";
  const ease =
    "transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]";

  // 展开态:卡片宽 w-72、圆角边框、bg/dark:bg、超高时内部垂直滚动(Req 4.4)。
  return (
    <div className={shellClassName}>
      {/* 收起态触发控件:贴右侧竖条,收起时滑入、展开时滑出(Req 5.3/5.4/5.5)。 */}
      <button
        type="button"
        aria-expanded={panelOpen}
        aria-hidden={panelOpen}
        aria-label="展开配置面板"
        tabIndex={panelOpen ? -1 : 0}
        onClick={() => setPanelOpen(true)}
        className={`absolute right-0 top-1/2 flex h-24 w-9 -translate-y-1/2 items-center justify-center rounded-l-xl border border-r-0 border-neutral-200 bg-white text-neutral-500 shadow-lg outline-none hover:text-neutral-800 focus-visible:ring-2 focus-visible:ring-emerald-400/55 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 dark:focus-visible:ring-emerald-300/50 ${ease} ${
          panelOpen
            ? "pointer-events-none translate-x-full opacity-0"
            : "translate-x-0 opacity-100"
        }`}
      >
        <SlidersHorizontal aria-hidden className="h-4 w-4" />
      </button>

      <div
        aria-hidden={!panelOpen}
        className={`max-h-[calc(100vh-2rem)] w-[21rem] overflow-y-auto rounded-l-2xl border border-r-0 border-neutral-200 bg-white/95 shadow-[0_18px_60px_rgba(0,0,0,0.16)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95 dark:shadow-[0_18px_60px_rgba(0,0,0,0.45)] ${ease} ${
          panelOpen
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-full opacity-0"
        }`}
      >
        <div className="flex flex-col gap-5 p-6">
          {/* 头部:标题 + 折叠触发控件(展开态)。aria-expanded 标注当前态。 */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Hover Lab
            </h2>
            <button
              type="button"
              aria-expanded={true}
              aria-label="收起配置面板"
              onClick={() => setPanelOpen(false)}
              className="rounded-md p-1 text-neutral-500 outline-none transition-colors hover:text-neutral-800 focus-visible:ring-2 focus-visible:ring-emerald-400/55 dark:text-neutral-400 dark:hover:text-neutral-100 dark:focus-visible:ring-emerald-300/50"
            >
              <ChevronRight aria-hidden className="h-4 w-4" />
            </button>
          </div>

          {/* 模式切换:Super Hover ⇄ Native :hover(Req 5.2) */}
          <section className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Mode
            </p>
            <ModeSwitch mode={mode} onChange={onModeChange} />
          </section>

          {/* 当前激活项与指针状态(Req 6.1/6.2/6.3/6.4) */}
          <section className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <StatusPanel album={album} pointer={pointer} />
          </section>

          {/* 主题切换(Req 7.1/7.2/7.3) */}
          <section className="flex flex-col gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <p className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Theme
            </p>
            <ThemeToggle theme={theme} onChange={onThemeChange} />
          </section>
        </div>
      </div>
    </div>
  );
}
