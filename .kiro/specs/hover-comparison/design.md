# Design Document

## Overview

本设计在现有 Super Hover Demo 上新增「原生 `:hover` 对比模式」,并把所有控制收纳进一个**贴右侧、常驻、可折叠的悬浮配置面板**(Config_Panel)。核心思路是:

- 在 `App` 中引入一个 `hoverMode` 状态(`'super' | 'native'`,默认 `'super'`),作为唯一真相来源。
- 用 `hoverMode` 同时**门控两套高亮机制**,保证互斥:
  - Super Hover 侧:把 `hoverMode === 'super'` 传给 `useSuperHoverRef({ enabled })`——库的 `enabled: false` 会**不挂载**命中检测,自动停掉每帧高亮(已通过 `react.d.ts` 验证该选项存在)。
  - 原生 `:hover` 侧:在滚动容器 `<ul>` 上挂一个 `data-mode` 属性,用 Tailwind 的属性变体 `data-[mode=native]:hover:...` 让原生 `hover:` 样式**只在 native 模式生效**。
- 两套高亮**复用同一组配色与过渡 class**,确保唯一差异来自机制(每帧命中 vs 原生 `:hover`)。
- 把现有 `StatusPanel`、`ThemeToggle` 从页面网格中移出,与新的 `ModeSwitch` 一起放进 `ConfigPanel`,网格退化为单列(列表占满宽度)。

需求映射:本设计覆盖 requirements.md 的 Req 1–8。

## Architecture

### 组件结构

```
App  (持有 hoverMode / activeId / pointer / theme 状态)
 ├─ <ul ref={listRef} data-mode={hoverMode}>      ← Demo_List(滚动容器 = super-hover root)
 │    └─ <li data-super-hover data-super-hover-id …>   ← 列表项(共享高亮 class)
 └─ <ConfigPanel>                                  ← position: fixed,贴右侧
      ├─ 折叠/展开触发按钮(收起态唯一可见控件)
      ├─ <ModeSwitch mode onChange>                ← Mode_Switch(super ⇄ native)
      ├─ <StatusPanel album pointer>               ← Status_Section(迁移自现有组件)
      └─ <ThemeToggle theme onChange>              ← Theme_Control(迁移自现有组件)
```

### 状态与数据流

| 状态 | 位置 | 说明 |
|------|------|------|
| `hoverMode: HoverMode` | `App` `useState` | 默认 `'super'`(Req 8.1)。门控两套机制。 |
| `activeId: string \| null` | `App` `useState` | 当前激活项 id,来自 super-hover 的 `onEnter/onLeave`。 |
| `pointer: {x,y}` | `App` `useState` | 指针视口坐标,来自 `onMove`。 |
| `theme` | `useTheme()` | 现有 hook,不改动其逻辑。 |
| `panelOpen: boolean` | `ConfigPanel` 内部 `useState` | 展开/收起,默认 `true`(Req 5.1)。仅 UI 态,不影响业务。 |

数据流保持现有单向模式:super-hover 事件 → `setActiveId/setPointer` → `App` 派生 `activeAlbum` → 经 props 传入 `ConfigPanel` → `StatusPanel`。

### 互斥与门控机制(关键)

```
hoverMode === 'super'                     hoverMode === 'native'
─────────────────────────                 ─────────────────────────
useSuperHoverRef({enabled:true})          useSuperHoverRef({enabled:false})  → 不挂载,无每帧高亮
<ul data-mode="super">                    <ul data-mode="native">
原生 hover: 变体不命中(被 data-mode=native 限定)  原生 hover: 变体命中 → CSS :hover 高亮
```

- **Super 模式(Req 2)**:`enabled:true`,super-hover 每帧命中,库自动给命中项加 `data-super-hover-active`;`data-mode="super"` 使原生 `hover:` 变体不生效(Req 2.3)。
- **Native 模式(Req 3)**:`enabled:false`,无命中检测,滚动时高亮滞留(Req 3.4 复现原生局限);`data-mode="native"` 让原生 `hover:` 变体生效(Req 3.1)。
- **切换清高亮(Req 1.5)**:`enabled` 从 true→false 时库卸载会移除 `data-super-hover-active`;同时在切到 native 时 `setActiveId(null)`、切到 super 时也复位,确保切换后无残留高亮。
- **幂等(Req 1.4)**:`ModeSwitch.onChange` 在所选值等于当前 `hoverMode` 时直接 `return`,不触发任何状态更新。

## Components and Interfaces

### 1. 类型与共享样式(放在 App.tsx 顶部或新建 `src/hoverMode.ts`)

```ts
export type HoverMode = "super" | "native";

// 两模式共享的高亮 class,确保差异仅来自机制(Req 3.5)
// 既被 data-[super-hover-active]:(super 模式)也被 data-[mode=native]:hover:(native 模式)复用
const HIGHLIGHT = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
```

> 实现要点:Tailwind v4 无法用变量拼出任意变体,需把高亮拆成「基础视觉」与「触发条件」。做法是在 `<li>` 的 className 中**同时**写两组带前缀的相同视觉类:
> `data-[super-hover-active]:bg-emerald-500/15 ... ` 与 `data-[mode=native]:hover:bg-emerald-500/15 ...`,
> 其中后者依赖父级 `<ul data-mode>`(用 Tailwind 的 `group`/`peer` 或直接在 `<li>` 上读父属性——更稳妥是给 `<ul>` 一个 `group/list` 并用 `group-data-[mode=native]/list:hover:` 不可行,因为 hover 需作用于 li 自身)。**最终方案**见下「高亮实现」。

### 2. 高亮实现(避免 Tailwind 变体踩坑)

原生 `:hover` 必须作用于 `<li>` 自身,而「是否启用」取决于父 `<ul>` 的模式。可靠做法:把模式开关下沉到 `<li>`,由 `App` 给每个 `<li>` 计算一个 `data-native` 属性(仅 native 模式为真),再用 `data-[native]:hover:<highlight>`:

```tsx
<li
  data-super-hover
  data-super-hover-id={album.id}
  {...(hoverMode === "native" ? { "data-native": "" } : {})}
  className={
    "... transition-colors duration-75 " +
    // super 模式:库加的 active 属性触发
    "data-[super-hover-active]:bg-emerald-500/15 data-[super-hover-active]:text-emerald-700 dark:data-[super-hover-active]:text-emerald-300 " +
    // native 模式:仅当存在 data-native 时,原生 :hover 触发(相同视觉)
    "data-[native]:hover:bg-emerald-500/15 data-[native]:hover:text-emerald-700 dark:data-[native]:hover:text-emerald-300"
  }
>
```

- super 模式下不写 `data-native`,故 `data-[native]:hover:` 整体不命中 → 原生 `:hover` 无样式(Req 2.3)。
- native 模式下 `enabled:false`,库不会加 `data-super-hover-active` → super 高亮不出现(Req 3.2)。
- 两组视觉值逐字相同 → 配色一致(Req 3.5)。

> 说明:`data-[native]:` 这类「属性存在即命中」的变体在 Tailwind v4 受支持(`data-[native]` 匹配 `data-native` 属性存在)。若构建期发现该写法不生效,退化方案是在 `<ul>` 上用 `group/list` + `group-data-[mode=native]/list:` 配合 `[&:hover]`,但首选上面的 `data-native` 方案。

### 3. `ModeSwitch`(新建 `src/components/ModeSwitch.tsx`)

复用 `ThemeToggle` 的分段式 radiogroup 视觉,两段:Super Hover / Native :hover。

```ts
type ModeSwitchProps = {
  mode: HoverMode;
  onChange: (mode: HoverMode) => void;
};
```

- 渲染两个 `role="radio"` 按钮,`aria-checked` 标当前模式(Req 1.6 显示当前模式)。
- 点击调用 `onChange`;`App` 侧做幂等判断。

### 4. `ConfigPanel`(新建 `src/components/ConfigPanel.tsx`)

```ts
type ConfigPanelProps = {
  mode: HoverMode;
  onModeChange: (mode: HoverMode) => void;
  album: Album | null;
  pointer: { x: number; y: number };
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
};
```

布局与行为:

- 外层容器:`fixed right-0 top-1/2 -translate-y-1/2`(垂直居中、贴右),`z-50` 叠加在内容之上(Req 4.1/4.2)。
- 展开态卡片:圆角、边框、`bg`/`dark:bg`,内部 `flex flex-col gap-4 p-5`,宽约 `w-72`。
- 高度约束:`max-h-[calc(100vh-2rem)] overflow-y-auto`,内容超高时内部滚动(Req 4.4);`top-1/2 -translate-y-1/2` 天然随视口居中,resize 自动重算(Req 4.5),无需手写 resize 监听。
- 折叠:`panelOpen` 控制。
  - 展开态显示触发(折叠)按钮 + ModeSwitch + StatusPanel + ThemeToggle(Req 5.2)。
  - 收起态只渲染一个贴右侧的小竖条/圆形按钮(Req 5.3/5.4),点击切回展开。
  - 折叠纯 UI 态,不动 `hoverMode`/`theme`(Req 5.6)。
- 主内容不再为面板预留列宽:`App` 的网格由 `md:grid-cols-[1fr_18rem]` 改为单列,`<ul>` 占满(Req 4.2 不改变列表布局——这里是「让列表占满、面板浮于其上」)。

### 5. `StatusPanel` 改动(最小)

- 现有 props `{ album, pointer }` 不变,直接复用(Req 6)。
- 仅去掉其作为独立 `aside` 的外框样式或调整为适配面板内部(可保留,视觉上作为面板内一个区块)。年份 `—` 占位由 `data.ts` 的 `Album.year` 天然支持(Req 6.2),`Math.round(pointer)` 已存在(Req 6.4)。

### 6. `ThemeToggle` 改动

- 组件本身不变(props `{theme,onChange}`),只是渲染位置从 header 移入 `ConfigPanel`(Req 7)。header 处的 `<ThemeToggle>` 移除。

### 7. `App` 改动汇总

- 新增 `const [hoverMode, setHoverMode] = useState<HoverMode>("super");`
- `useSuperHoverRef({ enabled: hoverMode === "super", onEnter, onLeave, onMove })`。
- `onChangeMode`:幂等保护 + 切换时 `setActiveId(null)` 清高亮。
- `<ul>` 加 `data-mode={hoverMode}`(供调试/样式),`<li>` 按上方方案加条件 `data-native`。
- 移除 header 的 `ThemeToggle` 与网格第二列,改渲染 `<ConfigPanel … />`。

## Data Models

无新增持久化数据。新增的运行时类型:

```ts
type HoverMode = "super" | "native";
```

`Album` 类型沿用 `src/data.ts`(含 `year: number | "—"`)。

## Error Handling

- **封面加载失败**:`<img>` 可加 `onError` 回退占位(Req 6 细化项,nice-to-have);Demo 中优先保持简单,可后续增强。
- **super-hover 未命中任何项**:`onLeave` → `setActiveId(null)`,Status_Section 显示占位提示(Req 6.3)。
- **模式切换竞态**:`hoverMode` 为单一 `useState`,React 串行化更新,天然无竞态;幂等判断防止重复 set。
- 本特性不涉及网络/异步失败路径,需求中的毫秒级时限为可测试性提示,不实现显式计时器。

## Accessibility

- `ModeSwitch`/`ThemeToggle` 用 `role="radiogroup"` + `role="radio"` + `aria-checked`。
- 折叠按钮用 `aria-expanded` 标注面板展开态,`aria-label` 描述用途。
- `prefers-reduced-motion`:CLAUDE.md 提示——可在 Super 模式对动画敏感用户考虑降级,Demo 中作为可选增强(不阻塞)。

## Correctness Properties

以下不变量在任意时刻都应成立,可作为手动验证与回归检查的依据:

### Property 1: 模式互斥

`hoverMode` 恒为 `'super'` 或 `'native'` 之一;`useSuperHoverRef` 的 `enabled` 永远等于 `hoverMode === 'super'`。两套高亮机制不可能同时启用。

**Validates: Requirements 1.1, 2.3, 3.2**

### Property 2: 单一高亮项

任一时刻 Demo_List 中至多一个列表项处于高亮态(super 模式由库保证单个 `data-super-hover-active`;native 模式由 CSS `:hover` 单指针保证)。

**Validates: Requirements 2.2, 3.1**

### Property 3: 配色一致

两模式触发的高亮使用逐字相同的视觉 class(`bg-emerald-500/15` / `text-emerald-700` / `dark:text-emerald-300`)与过渡 `duration-75`,差异仅来自触发机制。

**Validates: Requirements 3.5**

### Property 4: 切换后无残留

任一次 `hoverMode` 变更后、指针重新命中之前,不存在任何处于高亮状态的列表项(`enabled:false` 卸载移除 `data-super-hover-active` + `setActiveId(null)`)。

**Validates: Requirements 1.5**

### Property 5: 幂等切换

对当前已生效模式再次选择不产生任何状态更新,也不清除已有高亮。

**Validates: Requirements 1.4**

### Property 6: 折叠不污染业务态

`panelOpen` 的任意变化都不改变 `hoverMode`、`theme`、`activeId`。

**Validates: Requirements 5.6**

### Property 7: 布局不变量

`ConfigPanel` 为 `position: fixed` 脱离文档流,Demo_List 的宽度与布局在面板展开/收起前后保持像素级一致。

**Validates: Requirements 4.2**

## Testing Strategy

以构建 + 手动验证为主(项目无测试框架,遵循「不擅自引入测试」约定):

1. `npm run build` 通过类型检查(`tsc -b`)与生产构建。
2. 手动验证矩阵:
   - 默认加载 = Super 模式 + 面板展开(Req 8)。
   - Super 模式:指针不动滚动列表,高亮跟随;原生 `:hover` 不出现。
   - Native 模式:指针不动滚动列表,高亮滞留不更新;移动指针后跟随。
   - 切换模式:高亮被清除;重复点当前模式无变化。
   - 面板:贴右侧、不改变列表宽度、可折叠/展开、内容超高可内部滚动、缩放窗口保持居中可见。
   - 主题切换在面板内生效。
