# Requirements Document

## Introduction

本特性在现有 Super Hover Demo 基础上,新增一个**原生 `:hover` 对比模式**,让用户能直接对照"浏览器原生 `:hover`"与"Super Hover 每帧命中检测"的差异——差异在**指针不动、滚动列表**时最明显:原生 `:hover` 在滚动期间不更新(浏览器仅在指针移动时重算 `:hover`),Super Hover 仍逐帧追踪指针下方的元素。

同一时刻列表只有一种高亮机制生效(单列表 + 模式切换)。所有控制集中到一个**贴右侧、常驻、可折叠的悬浮配置面板**中:面板既是模式开关入口,也整合了主题切换以及当前激活项/指针坐标信息。页面默认以 Super Hover 模式、展开态加载。

## Glossary

- **System**: 本 Demo 应用(Super Hover 工程化展示项目)。
- **Hover_Mode**: 当前生效的高亮机制,取值为 `Super_Hover` 或 `Native_Hover`,两者互斥,同一时刻仅一个生效。
- **Super_Hover**: 基于 `requestAnimationFrame` + `elementFromPoint` 的每帧命中检测高亮机制(通过 `useSuperHoverRef` 接入)。
- **Native_Hover**: 浏览器原生 CSS `:hover` 高亮机制。
- **Demo_List**: 可滚动的专辑列表容器及其列表项。
- **Config_Panel**: 贴浏览器视口右侧、`position: fixed` 的常驻悬浮控制面板,可在展开/收起两态间切换。
- **Mode_Switch**: Config_Panel 内用于切换 Hover_Mode 的开关控件。
- **Status_Section**: Config_Panel 内展示当前激活列表项(封面、编号、标题、艺人、年份)与指针视口坐标的区域。
- **Theme_Control**: Config_Panel 内用于切换明/暗主题的控件(由现有 ThemeToggle 迁移整合)。
- **Active_Item**: 当前指针下方被高亮的 Demo_List 列表项。

## Requirements

### Requirement 1: 切换高亮对比模式

**User Story:** 作为一名查看 Demo 的用户,我想在原生 `:hover` 与 Super Hover 两种高亮机制之间切换,以便直接对比两者在滚动时的行为差异。

#### Acceptance Criteria

1. THE System SHALL 在任一时刻将 Hover_Mode 维持为 `Super_Hover` 与 `Native_Hover` 中的恰好一个。
2. WHEN 用户通过 Mode_Switch 选择 `Native_Hover`, THE System SHALL 将 Hover_Mode 切换为 `Native_Hover`。
3. WHEN 用户通过 Mode_Switch 选择 `Super_Hover`, THE System SHALL 将 Hover_Mode 切换为 `Super_Hover`。
4. IF 用户通过 Mode_Switch 选择当前已生效的 Hover_Mode, THEN THE System SHALL 维持该 Hover_Mode 不变且不清除当前 Active_Item 高亮(幂等无操作)。
5. WHEN Hover_Mode 发生切换, THE System SHALL 清除上一模式产生的 Active_Item 高亮状态,使切换完成后不存在任何处于高亮状态的列表项,直到指针重新命中。
6. WHEN Hover_Mode 发生切换, THE Config_Panel SHALL 更新并显示当前生效的 Hover_Mode 名称。

### Requirement 2: Super Hover 模式行为

**User Story:** 作为一名用户,我想在 Super Hover 模式下看到逐帧命中检测的高亮,以便观察滚动时高亮持续跟随指针。

#### Acceptance Criteria

1. WHILE Hover_Mode 为 `Super_Hover`, THE System SHALL 以 `requestAnimationFrame` 节奏对指针下方的列表项执行命中检测并施加高亮。
2. WHILE Hover_Mode 为 `Super_Hover`, THE System SHALL 在任一时刻至多高亮一个列表项,且该列表项为其矩形区域包含当前指针坐标的那一项。
3. WHILE Hover_Mode 为 `Super_Hover`, THE System SHALL 停用 Native_Hover 高亮,使所有 Demo_List 列表项不应用原生 `:hover` 高亮样式。
4. WHILE Hover_Mode 为 `Super_Hover` 且指针保持静止, WHEN 用户滚动 Demo_List, THE System SHALL 在滚动后将高亮更新到此时位于指针下方的列表项。
5. WHILE Hover_Mode 为 `Super_Hover`, IF 指针未落在任何 Demo_List 列表项的矩形区域内, THEN THE System SHALL 移除全部 Super_Hover 高亮。

### Requirement 3: 原生 :hover 模式行为

**User Story:** 作为一名用户,我想在原生 `:hover` 模式下看到浏览器默认的悬停高亮,以便对照它在滚动时不更新的局限。

#### Acceptance Criteria

1. WHILE Hover_Mode 为 `Native_Hover`, WHEN 指针进入某个 Demo_List 列表项, THE System SHALL 对该列表项应用原生 `:hover` 高亮样式,且任一时刻至多一个列表项处于该高亮态。
2. WHILE Hover_Mode 为 `Native_Hover`, WHEN 指针移出某个列表项, THE System SHALL 移除该列表项的原生 `:hover` 高亮。
3. WHILE Hover_Mode 为 `Native_Hover`, THE System SHALL 停用 Super_Hover 的每帧命中检测,使滚动期间不触发任何基于命中检测的高亮更新。
4. WHILE Hover_Mode 为 `Native_Hover` 且指针保持静止, WHEN 用户滚动 Demo_List, THE System SHALL 使高亮停留在指针移动前命中的列表项,在指针再次移动前不更新高亮(即复现原生 `:hover` 滚动不更新的局限)。
5. THE System SHALL 对 `Super_Hover` 与 `Native_Hover` 两种模式采用相同的高亮背景色、文字色与过渡时长,使两模式差异仅来自命中机制而非配色。

### Requirement 4: 右侧常驻悬浮配置面板

**User Story:** 作为一名用户,我想有一个贴在页面右侧的常驻控制面板,以便随时访问对比开关与状态信息而不打断主内容浏览。

#### Acceptance Criteria

1. THE Config_Panel SHALL 以 `position: fixed` 贴靠浏览器视口右侧边缘渲染,且与右边缘的水平间距在滚动时保持不变。
2. THE Config_Panel SHALL 以高于主内容容器的堆叠层级叠加显示,不占据文档流空间,使 Demo_List 的宽度与布局在面板显示前后保持不变。
3. THE Config_Panel SHALL 在垂直方向上保持其顶部与底部不超出视口边界,使其全部控件在页面任意滚动位置均可见且可点击。
4. WHILE Config_Panel 展开态内容高度超过视口高度, THE Config_Panel SHALL 限制自身高度不超过视口高度并提供内部垂直滚动,使所有控件均可访问。
5. WHEN 视口尺寸发生变化, THE Config_Panel SHALL 重新计算自身位置以维持贴靠右侧且保持在视口可视范围内。

### Requirement 5: 配置面板的展开与收起

**User Story:** 作为一名用户,我想能折叠配置面板,以便在不需要时减少其对页面的遮挡。

#### Acceptance Criteria

1. WHEN 页面首次加载, THE Config_Panel SHALL 以展开态渲染。
2. WHILE Config_Panel 处于展开态, THE Config_Panel SHALL 同时显示 Mode_Switch、Status_Section 与 Theme_Control。
3. WHEN 用户在展开态点击折叠控件, THE Config_Panel SHALL 切换为收起态并隐藏 Mode_Switch、Status_Section 与 Theme_Control。
4. WHILE Config_Panel 处于收起态, THE Config_Panel SHALL 保留一个可见且可点击的触发控件用于重新展开。
5. WHEN 用户在收起态点击该触发控件, THE Config_Panel SHALL 切换回展开态并重新显示面板内容。
6. WHILE Config_Panel 处于收起态, THE System SHALL 保持当前 Hover_Mode 取值与主题设置不变。

### Requirement 6: 面板内的激活项与指针状态

**User Story:** 作为一名用户,我想在面板中看到当前被高亮的列表项与指针坐标,以便确认对比效果命中的是哪个元素。

#### Acceptance Criteria

1. WHEN 存在 Active_Item, THE Status_Section SHALL 显示该列表项的编号、封面、标题、艺人与年份,并不显示无激活项占位提示。
2. WHEN 存在 Active_Item 且其年份缺失或不可用, THE Status_Section SHALL 以 `—` 占位显示年份字段,其余字段照常显示。
3. IF 不存在 Active_Item, THEN THE Status_Section SHALL 显示无激活项的占位提示,并不显示列表项详情。
4. WHILE 指针位于 Demo_List 上方, THE Status_Section SHALL 显示指针的视口坐标 x 与 y(四舍五入取整为整数像素),该坐标独立于激活项详情或占位提示同时展示。

### Requirement 7: 主题切换整合进面板

**User Story:** 作为一名用户,我想在同一个面板里切换明暗主题,以便把所有控制集中到一处。

#### Acceptance Criteria

1. THE Config_Panel SHALL 在面板可视区域内提供 Theme_Control,且 Theme_Control 至少包含"明亮"与"暗黑"两个可选主题。
2. WHEN 用户通过 Theme_Control 选择某一主题, THE System SHALL 将整个界面切换到该主题,使所有受主题影响的界面元素呈现该主题的视觉样式。
3. WHEN 界面切换到某一主题完成后, THE Theme_Control SHALL 显示该已生效的主题作为当前选中项。
4. WHEN Config_Panel 首次加载, THE Theme_Control SHALL 显示当前实际生效的主题作为当前选中项。

### Requirement 8: 默认加载状态

**User Story:** 作为一名首次打开 Demo 的用户,我想默认就看到 Super Hover 的效果,以便立即理解本项目的核心价值。

#### Acceptance Criteria

1. WHEN 页面首次加载, THE System SHALL 将 Hover_Mode 初始化为 `Super_Hover`。
2. WHEN 页面首次加载, THE System SHALL 以展开态渲染 Config_Panel。
3. WHEN 页面首次加载完成, THE System SHALL 无需用户额外操作即可直接呈现 Super_Hover 的每帧命中检测高亮效果。
