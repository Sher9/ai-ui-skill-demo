# 布局 / 构图模式（Layout Patterns）

从零构建 UI 时**先读**。本文件给"好看的构图长什么样"——可量化的骨架模式，配合 `templates/` 下的完整可抄样例。设计质量 80% 在构图，此处是天花板，不是地板。

## 0. 通用骨架（适用于所有页面）

```css
.container { width: 100%; max-width: 1200px; margin-inline: auto; padding-inline: var(--space-6); }
.section  { padding-block: var(--space-16); }      /* 区块节奏 */
@media (min-width: 768px) { .container { padding-inline: var(--space-8); } }
```

- 页面容器 ≤ 1200px；文本列 ≤ 68ch（阅读场景）。
- 断点：`sm 640 / md 768 / lg 1024 / xl 1280`。移动端单列，≥768 才多列。
- 区块垂直间距走节奏分级（见 `visual-principles.md` 第 4 节），不随手给随机值。

## 1. 非对称分屏（Hero / 首屏）—— 替代"居中 Hero"

反模式禁用居中 Hero。用 **1.1fr : 0.9fr 或 1.2fr : 0.8fr** 的非对称两栏，左文右资产，或反向。

```
┌───────────────────┬──────────────┐
│  Eyebrow (小标)    │              │
│  H1 (字重+紧字距)   │   视觉资产    │
│  sub (secondary)   │  (图/产品/插画)│
│  [主按钮][次按钮]   │              │
│  信任条(logos)      │              │
└───────────────────┴──────────────┘
```

- 左栏内容**左对齐**；Eyebrow 用 `primary` 或小字 `wide` 字距。`templates/hero-split.html`。
- 不要左右都塞满；一侧留白即呼吸。

## 2. 非对称特性区 —— 替代"三等卡片行"

反模式禁用 `repeat(3, 1fr)`。改用：

- **之字布局（zig-zag）**：图文左右交替，2 列，每项占满宽，留白大。适合功能介绍。
- **2+1 非对称栅格**：主卡占 2 列、次卡占 1 列；或 4 列里做 1 张大 + 若干小。
- **横向滚动**：移动端特性卡横向滑动（`scroll-snap`），不硬塞网格。

`templates/features-asymmetric.html`。

## 3. 数据带（Stats Band）

一行 3–4 个关键指标，数字用 `font-mono` + `tabular-nums` + `4xl/5xl`，下方 `text-secondary` 标签。背景用 `surface-2` 或淡 `primary` 着色带，与白底区块交替，制造节奏。

`templates/stats-band.html`。

## 4. 定价（Pricing）

- 3 档中**中间档高亮**（着色边框 + 轻微放大 + 徽标"Popular"），其余两档克制。
- 用 `surface` 卡片 + `shadow-md`；高亮档用 `primary` 淡着色背景 + `border` 着主色。
- 功能列表用 Lucide 勾选图标（success 色），不用纯文字。

`templates/pricing.html`。

## 5. 设置 / 表单页（Settings Form）

- 左侧**分组导航**（section 锚点），右侧表单；或顶部 Tabs。
- 标签在上、控件在下；字段组间距 `space-6`；整页最大宽 ~ 720px 居中（表单属窄列，允许居中）。
- 输入聚焦：`border-color: primary` + 3px 着色光环（`box-shadow: 0 0 0 3px color-mix(...)`）。

`templates/settings-form.html`。

## 6. 后台仪表盘（Dashboard）

- 顶部栏（logo + 搜索 + 头像）→ 左固定侧栏（导航）→ 主区 `surface-2` 底。
- 主区用 **12 列栅格**，卡片跨不同列数（如 KPI 4×3 列，图表 8+4 列）制造非对称层次。
- 表格用 1px 行分隔 + 留白，数值右对齐 `tabular-nums`。

`templates/dashboard.html`。

## 7. 构图自检（落笔前问自己）

- [ ] 是否**单一视觉焦点**？（一屏一个主行动 / 一个主信息）
- [ ] 是否"一处大胆 + 其余克制"？（不要处处强调）
- [ ] 留白是否为 4 的倍数且分级可见？
- [ ] 是否避免了居中 Hero / 三等卡片行？
- [ ] 移动端是否单列且可用？
