import type { Album } from "../data";

type StatusPanelProps = {
  album: Album | null;
  pointer: { x: number; y: number };
};

/**
 * 反映当前指针下元素的状态区块,完全由 Super Hover 的 enter/leave/move 事件驱动。
 *
 * 视觉上作为 ConfigPanel 内部的一个区块(非独立 aside):去掉自身的边框/背景/内边距,
 * 由外层面板 section 统一提供分隔与留白,与 ModeSwitch、ThemeToggle 视觉协调。
 * props `{ album, pointer }` 保持不变。
 */
export function StatusPanel({ album, pointer }: StatusPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Active element
        </p>
        {album ? (
          <div className="mt-2">
            <img
              src={album.cover}
              alt={album.title}
              className="mb-3 aspect-square w-full rounded-lg object-cover ring-1 ring-neutral-200 dark:ring-neutral-800"
            />
            <p className="font-mono text-sm text-emerald-600 dark:text-emerald-400">
              #{album.id}
            </p>
            <p className="mt-1 text-lg font-medium text-neutral-900 dark:text-neutral-100">
              {album.title}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {album.artist} · {album.year}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-neutral-400 dark:text-neutral-600">
            — nothing hovered —
          </p>
        )}
      </div>

      <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <p className="text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Pointer (viewport)
        </p>
        <p className="mt-2 font-mono text-sm text-neutral-600 dark:text-neutral-300">
          x: {Math.round(pointer.x)} · y: {Math.round(pointer.y)}
        </p>
      </div>

      <p className="text-xs leading-relaxed text-neutral-400 dark:text-neutral-500">
        Keep the cursor still and scroll the list. Native <code>:hover</code>{" "}
        freezes during scroll, but Super Hover re-runs a hit-test every frame, so
        the highlight keeps following whatever is under your pointer.
      </p>
    </div>
  );
}
