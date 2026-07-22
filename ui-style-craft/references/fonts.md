# 字体加载（让 Geist / Satoshi 真正渲染）

`design-tokens.md` 里写了 `font-family: Geist, Satoshi, system-ui`，但**只写 font-family 不会自动下载字体**——不加载，浏览器会静默回退到 `system-ui`，页面立刻变"普通"。本文件给出**即贴的加载片段**，从零构建 UI 时必做。

## 1. 推荐组合

| 字体 | 来源 | 说明 |
| --- | --- | --- |
| **Geist** + **Geist Mono** | Google Fonts（免费、稳定、CDN 快） | 首选，无需注册 |
| **Satoshi** | Fontshare（免费） | 作为 Geist 的备选人文无衬线，质感更暖 |

> 不要在 font-family 链里写 Inter（反模式）。Geist → Satoshi → system-ui 是合规回退链。

## 0. 重要：Geist / Satoshi 是纯拉丁字体，不含中文字形

中文界面**不要**直接写 `font-family: Geist`（否则中文整段回退系统字体且常掉字/错位）。正确做法：

- **Web 中文界面**：把 CJK 字体放在栈里（Geist 置于其前仅作用于拉丁字母与数字，中文自然回退）：
  `"Geist", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif`
- **小程序 / 移动端**：用 CJK 栈 `"PingFang SC", "Helvetica Neue", "Microsoft YaHei", system-ui, sans-serif`（详见 `references/mobile.md`）。
- 生成小程序 token 时直接用 `--platform wechat`，脚本会自动把字体族切成 CJK 栈，无需手写。

## 2. 即贴 `<head>` 片段（HTML）

```html
<!-- Geist（无衬线 + 等宽），并预连接加速 -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>

<!-- 可选：Satoshi 作为备选（Fontshare） -->
<link rel="preconnect" href="https://api.fontshare.com" crossorigin />
<link
  href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap"
  rel="stylesheet"
/>
```

把 `font-family` 链统一用 CSS 变量管理，避免散落：

```css
:root {
  --font-sans: "Geist", "Satoshi", system-ui, -apple-system, sans-serif;
  --font-mono: "Geist Mono", "JetBrains Mono", ui-monospace, monospace;
}
body { font-family: var(--font-sans); }
```

## 3. React / 框架项目

- **Next.js (app router)**：在 `app/layout.tsx` 用 `next/font/google` 的 `Geist` / `Geist_Mono`，自动自托管、零布局抖动（CLS）。
- **Vite / 其它**：用上面的 `<link>` 片段，或在入口 CSS 顶部 `@import url(...)`（注意 `@import` 必须位于文件最前，且略拖慢首屏，优先用 `<link>`）。

## 4. 字体加载态的兜底

网络慢时字体可能短暂缺失，用 `font-display: swap`（上面的 `&display=swap` 已包含）避免不可见文本（FOIT）。等宽数字用 `font-variant-numeric: tabular-nums` 让表格/统计数字对齐。

## 5. 衬线标题（business / guochao 预设）

`business`（商务厚重）与 `guochao`（国潮新中式）预设会生成 `--font-family-serif`，用于大标题提升质感：

- **Web 衬线**：`Source Serif 4`（Google Fonts，免费）作拉丁；中文用 `Noto Serif SC` / `Source Han Serif SC`。
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Noto+Serif+SC:wght@500;700&display=swap" rel="stylesheet" />
  ```
- **小程序 / 国潮衬线**：中文衬线栈 `"Noto Serif SC", "Source Han Serif SC", serif`（WeChat 基础库内置思源宋体回退）。
- **用法**：仅大标题 / 品牌字用 `font-family: var(--font-family-serif)`；正文与按钮仍用无衬线，避免阅读负担。其它风格（极简/玻璃/科技/马卡龙/多巴胺）默认禁用衬线，见 `references/styles.md` 风格例外。

## 6. 自检

- [ ] 页面实际渲染的是 Geist / Satoshi（或指定 CJK 栈），而非 system-ui（DevTools → Computed → font-family 验证）。
- [ ] 无 Inter；无衬线字体加载失败时不出现明显抖动。
- [ ] 等宽场景（代码、数值、时钟）用了 `--font-mono` + `tabular-nums`。
- [ ] `business` / `guochao` 标题用了 `--font-family-serif`，且衬线已实际加载（非回退到默认衬线）。
