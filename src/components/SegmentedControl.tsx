import { useLayoutEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

export type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
  Icon: LucideIcon;
};

type SegmentedControlProps<T extends string> = {
  ariaLabel: string;
  value: T;
  options: readonly SegmentedControlOption<T>[];
  onChange: (value: T) => void;
};

type SegmentMetric<T extends string> = {
  value: T;
  left: number;
  width: number;
  center: number;
};

type DragState = {
  left: number;
  targetIndex: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function SegmentedControl<T extends string>({
  ariaLabel,
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  const groupRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{
    pointerId: number;
    startX: number;
    initialLeft: number;
    width: number;
  } | null>(null);
  const suppressNextClickRef = useRef(false);
  const [metrics, setMetrics] = useState<SegmentMetric<T>[]>([]);
  const [dragState, setDragState] = useState<DragState | null>(null);

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const measure = () => {
      const buttons = Array.from(
        group.querySelectorAll<HTMLButtonElement>("[data-segment-value]"),
      );

      setMetrics(
        buttons.map((button) => {
          const optionValue = button.dataset.segmentValue as T;
          const left = button.offsetLeft;
          const width = button.offsetWidth;

          return {
            value: optionValue,
            left,
            width,
            center: left + width / 2,
          };
        }),
      );
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(group);
    return () => observer.disconnect();
  }, [options]);

  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const activeMetric = metrics[activeIndex];
  const indicatorLeft = dragState?.left ?? activeMetric?.left ?? 0;
  const indicatorWidth = activeMetric?.width ?? 0;
  const visualIndex = dragState?.targetIndex ?? activeIndex;

  const getNearestIndex = (center: number) => {
    if (metrics.length === 0) return activeIndex;

    return metrics.reduce((nearestIndex, metric, index) => {
      const nearestDistance = Math.abs(metrics[nearestIndex].center - center);
      const currentDistance = Math.abs(metric.center - center);
      return currentDistance < nearestDistance ? index : nearestIndex;
    }, 0);
  };

  const updateDrag = (clientX: number) => {
    const dragStart = dragStartRef.current;
    const group = groupRef.current;
    const first = metrics[0];
    const last = metrics[metrics.length - 1];

    if (!dragStart || !group || !first || !last) return;

    const rawLeft = dragStart.initialLeft + clientX - dragStart.startX;
    const left = clamp(rawLeft, first.left, last.left);
    const center = left + dragStart.width / 2;
    const targetIndex = getNearestIndex(center);

    if (Math.abs(clientX - dragStart.startX) > 3) {
      suppressNextClickRef.current = true;
    }

    setDragState({ left, targetIndex });
  };

  const finishDrag = () => {
    const targetIndex = dragState?.targetIndex;
    const shouldClearSuppressedClick = suppressNextClickRef.current;

    dragStartRef.current = null;
    setDragState(null);

    if (shouldClearSuppressedClick) {
      window.setTimeout(() => {
        suppressNextClickRef.current = false;
      }, 0);
    }

    if (targetIndex === undefined) return;

    const target = options[targetIndex];
    if (target && target.value !== value) {
      onChange(target.value);
    }
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={ariaLabel}
      className="relative isolate grid w-full auto-cols-fr grid-flow-col gap-1 overflow-hidden rounded-xl border border-neutral-300/80 bg-neutral-100 p-1 shadow-inner shadow-black/[0.03] dark:border-neutral-700 dark:bg-neutral-950/70 dark:shadow-black/30"
    >
      <div
        aria-hidden
        className={
          "pointer-events-none absolute top-1 left-0 z-0 h-9 rounded-[9px] border border-white/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.16),0_8px_16px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-neutral-800 dark:shadow-[0_1px_0_rgba(255,255,255,0.08),0_8px_16px_rgba(0,0,0,0.28)] " +
          (dragState
            ? "transition-none"
            : "transition-[transform,width,opacity] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]")
        }
        style={{
          opacity: indicatorWidth > 0 ? 1 : 0,
          transform: `translate3d(${indicatorLeft}px, 0, 0) scale(${dragState ? 1.025 : 1})`,
          width: indicatorWidth,
        }}
      />

      {options.map((option, index) => {
        const active = value === option.value;
        const highlighted = visualIndex === index;
        const { Icon } = option;

        return (
          <button
            key={option.value}
            data-segment-value={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={(event) => {
              if (suppressNextClickRef.current) {
                suppressNextClickRef.current = false;
                event.preventDefault();
                return;
              }

              onChange(option.value);
            }}
            onPointerDown={(event) => {
              if (!active || !activeMetric) return;

              dragStartRef.current = {
                pointerId: event.pointerId,
                startX: event.clientX,
                initialLeft: activeMetric.left,
                width: activeMetric.width,
              };
              event.currentTarget.setPointerCapture(event.pointerId);
              setDragState({ left: activeMetric.left, targetIndex: activeIndex });
            }}
            onPointerMove={(event) => {
              if (dragStartRef.current?.pointerId !== event.pointerId) return;
              updateDrag(event.clientX);
            }}
            onPointerUp={(event) => {
              if (dragStartRef.current?.pointerId !== event.pointerId) return;
              event.currentTarget.releasePointerCapture(event.pointerId);
              finishDrag();
            }}
            onPointerCancel={(event) => {
              if (dragStartRef.current?.pointerId !== event.pointerId) return;
              event.currentTarget.releasePointerCapture(event.pointerId);
              dragStartRef.current = null;
              setDragState(null);
            }}
            title={option.label}
            className={
              "relative z-10 flex h-9 min-w-0 touch-none select-none items-center justify-center gap-1.5 rounded-[9px] px-2 text-[13px] font-semibold leading-none outline-none transition-[color,transform] duration-150 ease-out active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-400/55 dark:focus-visible:ring-emerald-300/50 " +
              (highlighted
                ? "cursor-grab text-neutral-950 active:cursor-grabbing dark:text-neutral-50"
                : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100")
            }
          >
            <span
              aria-hidden
              className={
                "grid h-[18px] w-[18px] shrink-0 place-items-center transition-opacity duration-150 " +
                (highlighted ? "opacity-100" : "opacity-65")
              }
            >
              <Icon aria-hidden className="h-4 w-4" />
            </span>
            <span className="whitespace-nowrap">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
