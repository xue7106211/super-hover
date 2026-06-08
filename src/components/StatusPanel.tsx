import type { Album } from "../data";

type StatusPanelProps = {
  album: Album | null;
  pointer: { x: number; y: number };
};

/**
 * Right-hand side panel that reflects the element currently under the pointer.
 * It is driven entirely by Super Hover's enter/leave/move events.
 */
export function StatusPanel({ album, pointer }: StatusPanelProps) {
  return (
    <aside className="flex flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-neutral-500">
          Active element
        </p>
        {album ? (
          <div className="mt-2">
            <img
              src={album.cover}
              alt={album.title}
              className="mb-3 aspect-square w-full rounded-lg object-cover ring-1 ring-neutral-800"
            />
            <p className="font-mono text-sm text-emerald-400">#{album.id}</p>
            <p className="mt-1 text-lg font-medium text-neutral-100">
              {album.title}
            </p>
            <p className="text-sm text-neutral-400">
              {album.artist} · {album.year}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-neutral-600">— nothing hovered —</p>
        )}
      </div>

      <div className="border-t border-neutral-800 pt-4">
        <p className="text-xs uppercase tracking-widest text-neutral-500">
          Pointer (viewport)
        </p>
        <p className="mt-2 font-mono text-sm text-neutral-300">
          x: {Math.round(pointer.x)} · y: {Math.round(pointer.y)}
        </p>
      </div>

      <p className="mt-auto text-xs leading-relaxed text-neutral-500">
        Keep the cursor still and scroll the list. Native <code>:hover</code>{" "}
        freezes during scroll, but Super Hover re-runs a hit-test every frame, so
        the highlight keeps following whatever is under your pointer.
      </p>
    </aside>
  );
}
