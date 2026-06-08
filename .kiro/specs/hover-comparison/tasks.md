# Implementation Plan

## Overview

本计划把 hover-comparison 特性拆成 8 个增量编码任务:先建立类型与共享样式(任务 1),再自底向上构建展示组件(ModeSwitch → ConfigPanel → 组装),随后在 App 中引入 `hoverMode` 状态并完成两套高亮机制的门控与互斥,最后重排布局并做构建/手动验证。每个任务都映射到 requirements.md 的具体验收准则,且都建立在前序任务产物之上,无悬空代码。

## Tasks

- [x] 1. 建立 HoverMode 类型与共享高亮样式
  - 在 `src/hoverMode.ts` 中导出 `export type HoverMode = "super" | "native"`
  - 导出两模式共享的高亮 class 约定(供 `<li>` 复用,保证配色一致),如分别导出背景/文字/暗色文字的 class 片段或一个约定好的字符串
  - _Requirements: 1.1, 3.5_

- [x] 2. 创建 ModeSwitch 组件
  - 在 `src/components/ModeSwitch.tsx` 新建组件,props 为 `{ mode: HoverMode; onChange: (mode: HoverMode) => void }`
  - 复用 ThemeToggle 的分段式 radiogroup 视觉:两段 "Super Hover" / "Native :hover",用 `role="radiogroup"` + `role="radio"` + `aria-checked` 标注当前模式
  - 点击某段调用 `onChange(value)`
  - _Requirements: 1.2, 1.3, 1.6_

- [x] 3. 创建 ConfigPanel 组件(悬浮 + 折叠骨架)
  - 在 `src/components/ConfigPanel.tsx` 新建组件,props 为 `{ mode, onModeChange, album, pointer, theme, onThemeChange }`
  - 外层 `fixed right-0 top-1/2 -translate-y-1/2 z-50`,展开卡片 `w-72`、圆角边框、`bg`/`dark:bg`、`max-h-[calc(100vh-2rem)] overflow-y-auto`
  - 内部 `useState` 管理 `panelOpen`(默认 `true`);展开态用 `flex flex-col gap-4 p-5`
  - 收起态仅渲染一个贴右侧的可点击触发控件(竖条/圆钮),`aria-expanded` 标注;点击在展开/收起间切换
  - 折叠逻辑只改 `panelOpen`,不触碰 mode/theme
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 4. 将 ModeSwitch、StatusPanel、ThemeToggle 组装进 ConfigPanel
  - 展开态依次渲染:当前模式标题/ModeSwitch、StatusPanel(传 `album`/`pointer`)、ThemeToggle(传 `theme`/`onThemeChange`)
  - StatusPanel 视觉微调以适配面板内部(去掉/调整独立 aside 外框),保持 `{album,pointer}` props 不变
  - _Requirements: 5.2, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3_

- [x] 5. 在 App 中引入 hoverMode 状态并接线门控
  - 新增 `const [hoverMode, setHoverMode] = useState<HoverMode>("super")`(默认 super)
  - 将 `useSuperHoverRef` 调整为 `useSuperHoverRef({ enabled: hoverMode === "super", onEnter, onLeave, onMove })`
  - 实现 `onModeChange`:若所选 === 当前则 `return`(幂等);否则 `setHoverMode` 并 `setActiveId(null)` 清高亮
  - _Requirements: 1.1, 1.4, 1.5, 2.1, 3.2, 8.1, 8.3_

- [x] 6. 实现列表项的双模式高亮(共享配色)
  - `<ul>` 加 `data-mode={hoverMode}`
  - `<li>` 在 `hoverMode === "native"` 时附加 `data-native` 属性(super 模式不附加)
  - className 同时写两组逐字相同的视觉变体:`data-[super-hover-active]:<highlight>` 与 `data-[native]:hover:<highlight>`,保留 `transition-colors duration-75`
  - 若构建期发现 `data-[native]:hover:` 不生效,按设计退化方案处理
  - _Requirements: 2.1, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 7. 重排 App 布局并挂载 ConfigPanel
  - 移除 header 中的 `<ThemeToggle>`(迁入面板)
  - 将网格由 `md:grid-cols-[1fr_18rem]` 改为单列,使 `<ul>` 占满宽度;移除原网格第二列的 StatusPanel
  - 渲染 `<ConfigPanel mode={hoverMode} onModeChange={...} album={activeAlbum} pointer={pointer} theme={theme} onThemeChange={setTheme} />`(默认展开)
  - _Requirements: 4.2, 7.1, 8.2_

- [x] 8. 构建验证与手动核对
  - 运行 `npm run build` 确认 `tsc -b` 类型检查与生产构建通过
  - 按设计的手动验证矩阵自检:默认 super+展开、两模式滚动行为差异、切换清高亮、幂等、面板贴右/不改列表宽度/折叠/超高滚动/缩放居中、主题切换
  - 修复发现的类型或视觉问题
  - _Requirements: 1.1, 1.4, 1.5, 2.3, 3.4, 3.5, 4.2, 5.6, 8.1, 8.2, 8.3_

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1"] },
    { "wave": 2, "tasks": ["2", "3", "5"] },
    { "wave": 3, "tasks": ["4", "6"] },
    { "wave": 4, "tasks": ["7"] },
    { "wave": 5, "tasks": ["8"] }
  ]
}
```

```
1 (类型与共享样式)
├─ 2 (ModeSwitch)
│   └─ 4 (组装 ConfigPanel 内容)
├─ 3 (ConfigPanel 骨架)
│   └─ 4
└─ 5 (App: hoverMode 状态 + enabled 门控)
    ├─ 6 (列表项双模式高亮)
    └─ 7 (布局重排 + 挂载 ConfigPanel)  ← 依赖 3、4

8 (构建验证) ← 依赖 1–7 全部完成
```

- 任务 1 是所有任务的基础(类型 + 共享样式)。
- 任务 2、3 可在 1 之后并行;任务 4 依赖 2、3。
- 任务 5 依赖 1;任务 6 依赖 5(需要 `hoverMode`);任务 7 依赖 4(ConfigPanel 完整)与 5(状态)。
- 任务 8 在全部实现完成后执行。

## Notes

- 项目无单测框架,遵循「不擅自引入测试」约定,验证以 `npm run build` + 手动核对为主(任务 8)。
- 需求中的毫秒级时限(100/300/500ms)是可测试性提示,不实现显式计时器。
- `useSuperHoverRef` 的 `enabled` 选项已通过阅读 `node_modules/super-hover/dist/react.d.ts` 确认存在,`false` 时不挂载命中检测。
- 封面加载失败回退为 nice-to-have,不阻塞主流程。
