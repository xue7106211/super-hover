import { useMemo, useState } from "react";
import { useSuperHoverRef } from "super-hover/react";
import { ALBUMS, type Album } from "./data";
import type { HoverMode } from "./hoverMode";
import { ConfigPanel } from "./components/ConfigPanel";
import { useTheme } from "./useTheme";

export default function App() {
  const { theme, setTheme } = useTheme();
  // 唯一真相来源:当前生效的高亮机制,默认 super(Req 8.1)。门控两套机制保证互斥(Req 1.1)。
  const [hoverMode, setHoverMode] = useState<HoverMode>("super");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  // id → Album 的反查表，只构建一次
  const byId = useMemo(
    () => new Map(ALBUMS.map((album) => [album.id, album])),
    [],
  );

  // 把返回的 callback ref 挂到滚动容器上，库会自动接线并派发 hover 事件
  // enabled 门控:仅 super 模式挂载每帧命中检测;native 模式 enabled:false 不挂载,
  // 由库卸载移除 data-super-hover-active,自动停掉 Super Hover 高亮(Req 2.1, 3.2)。
  const listRef = useSuperHoverRef({
    enabled: hoverMode === "super",
    onEnter(event) {
      // 回调拿到的是 DOM 元素，从 data 属性反查业务 id
      const el = event.detail.current as HTMLElement | null;
      setActiveId(el?.dataset.superHoverId ?? null);
    },
    onLeave() {
      setActiveId(null);
    },
    onMove(event) {
      setPointer({ x: event.detail.x, y: event.detail.y });
    },
  });

  const activeAlbum: Album | null = activeId ? byId.get(activeId) ?? null : null;

  // 模式切换处理:幂等 + 切换清高亮(供 ConfigPanel/ModeSwitch 使用,任务 7 接线)。
  // - 若所选 mode 等于当前 hoverMode,直接 return,不触发任何状态更新(幂等无操作,Req 1.4)。
  // - 否则切换 hoverMode,并 setActiveId(null) 清除上一模式残留高亮,
  //   使切换完成后不存在高亮项,直到指针重新命中(Req 1.5)。
  const onModeChange = (mode: HoverMode) => {
    if (mode === hoverMode) return;
    setHoverMode(mode);
    setActiveId(null);
  };

  return (
    <div className="min-h-full bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Super Hover
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              A per-frame hover hit-test. Scroll the list with the pointer held
              still to see the highlight track the element underneath.
            </p>
          </div>
        </header>

        {/* 单列布局:列表占满宽度;所有控制收纳进贴右侧的 fixed ConfigPanel,
            面板脱离文档流浮于内容之上,不改变列表宽度(Req 4.2)。 */}
        <ul
          ref={listRef}
          // data-mode 暴露当前生效机制,便于调试/样式钩子(Req 2.3/3.1 的模式语义来源)
          data-mode={hoverMode}
          className="h-[70vh] divide-y divide-neutral-200 overflow-auto rounded-xl border border-neutral-200 bg-neutral-50 dark:divide-neutral-900 dark:border-neutral-800 dark:bg-neutral-900/30"
        >
          {ALBUMS.map((album) => (
            <li
              key={album.id}
              // data-super-hover 标记可命中；激活态 data-super-hover-active 由库自动添加
              data-super-hover
              data-super-hover-id={album.id}
              // 仅 native 模式附加 data-native:作为原生 :hover 变体的命中开关(Req 3.1);
              // super 模式不附加 → data-[native]:hover: 整体不命中,原生 :hover 无样式(Req 2.3)。
              {...(hoverMode === "native" ? { "data-native": "" } : {})}
              // 两组逐字相同的视觉变体,差异仅来自触发机制(Req 3.5):
              // - super:库自动加的 data-super-hover-active 触发(每帧命中,Req 2.1)。
              // - native:仅当存在 data-native 时,浏览器原生 :hover 触发(Req 3.1/3.3/3.4)。
              className="flex items-center gap-4 px-4 py-3 transition-colors duration-75 data-[super-hover-active]:bg-emerald-500/15 data-[super-hover-active]:text-emerald-700 dark:data-[super-hover-active]:text-emerald-300 data-[native]:hover:bg-emerald-500/15 data-[native]:hover:text-emerald-700 dark:data-[native]:hover:text-emerald-300"
            >
              <span className="w-10 shrink-0 font-mono text-xs text-neutral-400 dark:text-neutral-600">
                {album.id}
              </span>
              <img
                src={album.cover}
                alt={album.title}
                loading="lazy"
                className="h-10 w-10 shrink-0 rounded-md object-cover ring-1 ring-neutral-200 dark:ring-neutral-800"
              />
              <span className="flex-1 truncate text-sm">{album.title}</span>
              <span className="hidden shrink-0 text-xs text-neutral-500 sm:block">
                {album.artist}
              </span>
              <span className="w-12 shrink-0 text-right font-mono text-xs text-neutral-400 dark:text-neutral-600">
                {album.year}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 贴右侧常驻悬浮配置面板:整合 ModeSwitch / StatusPanel / ThemeToggle,默认展开(Req 8.2) */}
      <ConfigPanel
        mode={hoverMode}
        onModeChange={onModeChange}
        album={activeAlbum}
        pointer={pointer}
        theme={theme}
        onThemeChange={setTheme}
      />
    </div>
  );
}
