/**
 * 高亮对比模式的类型与两模式共享的高亮样式约定。
 *
 * 设计要点(见 design.md「类型与共享样式」「高亮实现」):
 * - Hover_Mode 取值恒为 "super" | "native" 之一,两者互斥(Req 1.1)。
 * - Super Hover 与 Native :hover 两套机制复用 *逐字相同* 的高亮视觉,
 *   确保两模式差异仅来自命中机制而非配色(Req 3.5)。
 *
 * 这里把高亮拆成可复用的 class 片段:
 * - HIGHLIGHT_BG / HIGHLIGHT_TEXT / HIGHLIGHT_TEXT_DARK 为不带变体前缀的"基础视觉",
 *   供 <li> 在不同触发条件(`data-[super-hover-active]:` 与 `data-[native]:hover:`)
 *   下拼接出带前缀的相同视觉类。
 * - HIGHLIGHT_TRANSITION 为两模式共用的过渡时长(Req 3.5)。
 * - HIGHLIGHT 为基础视觉的合并字符串,便于需要整体引用的场景。
 */

/** 当前生效的高亮机制,两者互斥,同一时刻仅一个生效(Req 1.1)。 */
export type HoverMode = "super" | "native";

/** 高亮背景色(无变体前缀)。 */
export const HIGHLIGHT_BG = "bg-emerald-500/15";

/** 高亮文字色(无变体前缀,明亮主题)。 */
export const HIGHLIGHT_TEXT = "text-emerald-700";

/** 高亮文字色(暗色主题,已含 dark: 前缀)。 */
export const HIGHLIGHT_TEXT_DARK = "dark:text-emerald-300";

/** 两模式共用的过渡时长(Req 3.5)。 */
export const HIGHLIGHT_TRANSITION = "transition-colors duration-75";

/**
 * 两模式共享的高亮"基础视觉" class(背景 + 文字 + 暗色文字)。
 * 不含触发变体前缀,供 <li> 拼接出 super / native 两套带前缀且逐字相同的视觉类(Req 3.5)。
 */
export const HIGHLIGHT = `${HIGHLIGHT_BG} ${HIGHLIGHT_TEXT} ${HIGHLIGHT_TEXT_DARK}`;
