# 移动端 / 小程序（Mobile & Mini-Program）

从零构建移动端页面或**小程序（微信/支付宝/抖音等）**时**先读**。本文件解决"为什么移动端、尤其小程序生成的页面巨难看"——根因是：原 web token 体系（`rem/px` + 拉丁字体 Geist）在移动端不成立。

## 0. 关键认知（为什么特别容易丑）

1. **单位是 rpx，不是 px/rem**。小程序用 `rpx`（`750rpx` = 屏宽），`px/rem` 不自适应；直接搬 web token 会变成固定像素，在不同机型错位。
2. **Geist / Satoshi 是纯拉丁字体，不含中文字形**。中文界面直出它们，会整段回退系统字体且常常掉字/错位——这是小程序"显脏"的头号原因。中文必须用 CJK 字体栈。
3. **触屏无 `:hover`**，`:focus-visible` 在无键盘场景下意义不大；按压态要用 `:active` / 小程序的 `hover-class`。
4. **刘海 / 底部安全区**需 `env(safe-area-inset-*)`，否则内容被遮挡或底部操作栏被 Home 条挡住。
5. **`100vh` 移动端有 bug**（地址栏伸缩），且小程序无真实视口高度概念，需 flex 撑满。

## 1. 字体（CJK 第一）

- 中文界面字体栈（web 移动端）：
  `-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif`
- 小程序字体栈：
  `"PingFang SC", "Helvetica Neue", "Microsoft YaHei", system-ui, sans-serif`
- 想保留 Geist 的拉丁/数字质感，可把它放在 CJK 之前：`"Geist", "PingFang SC", ...`——Geist 不含中文会自然回退到 PingFang，不影响中文。
- 生成时直接切：`node scripts/generate-tokens.mjs --platform wechat --out wxss` 会把字体族自动换成 CJK 栈。
- 正文字号 ≥ `28rpx`（≈14px），避免 iOS 双击/自动缩放；标题用字阶 `3xl` 及以上。

## 2. 小程序 token 导出与接入

```bash
node scripts/generate-tokens.mjs --platform wechat --mode light --density normal --out wxss,json --dir ./miniprogram/styles
```

- 产出 `tokens.wxss`：间距/字号/圆角已换算为 `rpx`（`px×2`、`rem×32`），变量定义在 `page` 上全局可用。
- 全局部署：在 `app.wxss` 顶部 `@import "styles/tokens.wxss";`。
- 组件标签用 `view` / `text` / `image` / `scroll-view`，**不是** `div` / `span` / `img`。
- `image` 必须设 `mode`：列表缩略图用 `aspectFill`，文章大图用 `widthFix`，头像用 `aspectFill` + 圆角。
- 注：生成器输出的变量名带语义前缀（如 `--color-semantic-bg`）；本文件与模板为易用采用扁平名（`--color-bg`）。接入时在 `app.wxss` 补一行别名即可：
  `--color-bg: var(--color-semantic-bg);`（或直接使用扁平名的模板块）。

## 3. WXSS 不支持 / 受限的 CSS 与替代

| 不支持 / 受限 | 替代方案 |
| --- | --- |
| `color-mix()` | 用预混 `rgba()` 或 8 位 hex（如 `#2563eb1a` ≈ 10% 透明） |
| `:focus-visible` | 小程序无键盘焦点场景，可忽略；需要可按 `hover-class` |
| `:hover`（触屏无效） | 用 `hover-class` + `:active` 做按压态 |
| `prefers-reduced-motion` | 不支持；动效自行克制（时长 ≤ 250ms） |
| `100vh` | 用 `height:100%` + 父级 `display:flex;flex-direction:column` 撑满 |
| `position: fixed` 底部 | 加 `padding-bottom: env(safe-area-inset-bottom)` |
| 通用 `*` 选择器 | 避免；显式写类名 |
| `box-shadow` 负扩散/大模糊 | 支持，但部分机型裁切；保持克制，阴影偏移 ≤ 20rpx |

## 4. 触控交互态

- 按压反馈：给可点元素加 `hover-class="press"`，并在 wxss 定义 `.press { opacity: .92; transform: scale(.98); }`（WXSS 支持 `transform`）。
- 列表行点击态：`hover-class` 让背景变 `var(--color-surface-2)`，整行可点。
- 不要用 `:hover` 表达任何必要状态（触屏没有悬停）。

## 5. 安全区与视口

- 底部 TabBar / 固定操作栏：`padding-bottom: calc(24rpx + env(safe-area-inset-bottom));`
- 自定义顶部导航：`padding-top: env(safe-area-inset-top);`
- 横向不贴边：内容左右留 `32rpx`（≈16px）。
- 整页布局：最外层 `page { height: 100%; }` + 容器 `display:flex; flex-direction:column;`，内容区 `flex:1; overflow:auto` 或 `scroll-view`。

## 6. 触控目标尺寸（可达性硬指标）

- 可点元素最小 `88rpx`（≈44px）高、`80rpx`（≈40px）宽。
- 主按钮高度 `88–96rpx`；列表行高 ≥ `112rpx`；图标按钮点击区 ≥ `80rpx`（可借 `padding` 扩大热区）。

## 7. 移动端布局模式（模板见 `templates/`）

- **底部 Tab 栏**：固定底部 + 安全区，图标 + 文字，当前项用 `primary`。
- **吸顶导航**：`sticky` / `fixed` 顶部，左右留白，标题左对齐。
- **列表行**：全宽分隔线行，左头像/图标 + 主副文字 + 右侧操作，整行可点。
- **全宽卡片**：左右 `32rpx` 外边距，圆角 `16rpx`，内距 `32rpx`。
- **底部操作栏**：固定底部双按钮（主填充 + 次描边），含安全区内边距。
- 避免：多列网格硬塞（移动端单列优先）、三等卡片行、超大居中标题、横向溢出。

## 8. 移动端 / 小程序自检清单

- [ ] 中文用 CJK 字体栈（非 Geist/Satoshi 直出）。
- [ ] 小程序间距/字号/圆角用 `rpx`（来自 `tokens.wxss`），无裸 `px` 布局值。
- [ ] 可点目标 ≥ `88rpx`；主按钮 `88–96rpx`。
- [ ] 固定底栏 / 操作栏含 `env(safe-area-inset-bottom)`。
- [ ] 无 `:hover` 依赖；按压态用 `hover-class` / `:active`。
- [ ] 无 `color-mix()` / `prefers-reduced-motion`（已用替代）。
- [ ] 单列优先，无横向溢出（横向内容用 `scroll-view`）。
- [ ] `image` 均设 `mode`；`100vh` 已替换为 flex 撑满。
