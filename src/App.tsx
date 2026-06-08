import { useMemo, useState } from "react";
import { useSuperHoverRef } from "super-hover/react";
import { ALBUMS, type Album } from "./data";
import { StatusPanel } from "./components/StatusPanel";

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  // id → Album 的反查表，只构建一次
  const byId = useMemo(
    () => new Map(ALBUMS.map((album) => [album.id, album])),
    [],
  );

  // 把返回的 callback ref 挂到滚动容器上，库会自动接线并派发 hover 事件
  const listRef = useSuperHoverRef({
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

  return (
    <div className="min-h-full bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Super Hover</h1>
          <p className="mt-1 text-sm text-neutral-400">
            A per-frame hover hit-test. Scroll the list with the pointer held
            still to see the highlight track the element underneath.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_18rem]">
          {/* 这个滚动容器就是 Super Hover 的 root */}
          <ul
            ref={listRef}
            className="h-[70vh] divide-y divide-neutral-900 overflow-auto rounded-xl border border-neutral-800 bg-neutral-900/30"
          >
            {ALBUMS.map((album) => (
              <li
                key={album.id}
                // data-super-hover 标记可命中；激活态 data-super-hover-active 由库自动添加
                data-super-hover
                data-super-hover-id={album.id}
                className="flex items-center gap-4 px-4 py-3 transition-colors duration-75 data-[super-hover-active]:bg-emerald-500/15 data-[super-hover-active]:text-emerald-300"
              >
                <span className="w-10 shrink-0 font-mono text-xs text-neutral-600">
                  {album.id}
                </span>
                <img
                  src={album.cover}
                  alt={album.title}
                  loading="lazy"
                  className="h-10 w-10 shrink-0 rounded-md object-cover ring-1 ring-neutral-800"
                />
                <span className="flex-1 truncate text-sm">{album.title}</span>
                <span className="hidden shrink-0 text-xs text-neutral-500 sm:block">
                  {album.artist}
                </span>
                <span className="w-12 shrink-0 text-right font-mono text-xs text-neutral-600">
                  {album.year}
                </span>
              </li>
            ))}
          </ul>

          <StatusPanel album={activeAlbum} pointer={pointer} />
        </div>
      </div>
    </div>
  );
}
