# 打磨层（Polish）—— 区分"及格"与"惊艳"

`design-tokens.md` / `anti-patterns.md` 保证页面不出错；本文件提供**可选的、有品味的细节**，让界面从"合规"升级到"好看"。每一项都克制使用——**一处大胆，其余克制**。全部走 token，不引入魔法值。

## 1. 表面处理（Surface）

- **克制的表面渐变**（非文字渐变，文字渐变仍禁用）：给 `surface` 一层极淡的 top→bottom 白/中性渐变，制造"纸感"，而非死白。
  ```css
  --surface-gradient: linear-gradient(180deg, #ffffff 0%, var(--color-surface-2) 100%);
  ```
- **细噪点纹理**：用内联 SVG `feTurbulence` 做 3%–5% 透明度的噪点叠加，消除大色块的"塑料感"（常用于 Hero 背景、卡片）。
  ```css
  .grain::after {
    content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0.04;
    background-image: url("data:image/svg+xml,...feTurbulence...");
  }
  ```
- **1px 细边**：边框用 `color-mix(in srgb, var(--color-border) 100%, transparent)` 或微妙提亮，避免灰边显脏；卡片可叠 `border` + `shadow-sm` 双保险。

## 2. 选区 / 滚动条 / 焦点

- **自定义选区色**：让选中文本呼应强调色，细节见品味。
  ```css
  ::selection { background: color-mix(in srgb, var(--color-primary) 18%, transparent); color: var(--color-text-primary); }
  ```
- **美化滚动条**（WebKit）：细、浅、圆头，不抢视觉。
  ```css
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-thumb { background: var(--color-neutral-300); border-radius: 9999px; border: 3px solid var(--color-bg); }
  ::-webkit-scrollbar-thumb:hover { background: var(--color-neutral-400); }
  ```
- **统一 focus ring**：所有可交互元素共用一条 `:focus-visible` 规则（着色 outline + offset），不重复写。

## 3. 图标

- **图标集**：统一用 **Lucide**（或 Radix Icons / Tabler），不要混用多套。
- **尺寸走 4px 网格**：16 / 20 / 24px；线宽统一 `1.5`–`2`，`stroke-linecap: round`。
- **颜色**：继承 `currentColor`，状态变化时随文字色变；不要用高饱和独立色。
- **对齐**：图标与文字 `vertical-align: middle` + `gap: var(--space-2)`。

## 4. 微动效（尊重 prefers-reduced-motion）

- 仅动 `transform` / `opacity`，时长走 `motion.duration`（fast 150 / normal 250）。
- **入场**：区块用轻微 `translateY(8px)→0` + `opacity 0→1`，错落延迟（stagger）制造节奏；不要全屏同时出现。
- **Hover**：卡片轻微上浮 `translateY(-2px)` + `shadow` 升一档；链接下划线展开。
- 全局兜底：
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; transition: none !important; }
  }
  ```

## 5. 图像 / 插图处理

- 统一圆角 `radius-lg/xl` + 着色淡阴影；避免直角硬边图片。
- 占位图用 `https://picsum.photos/seed/{seed}/{w}/{h}`（稳定、不碎链），不要 Unsplash 随链。
- 可能加载失败时给 `surface-2` 底色 + 居中图标兜底。

## 6. 数值与数据

- 数字用 `font-mono` + `font-variant-numeric: tabular-nums` 右对齐，列整齐。
- 关键指标配微小趋势色（success/danger）与箭头图标，不要纯文字。

## 7. 使用纪律

- [ ] 每项"有即加分，无也不扣分"——按需取用，不堆砌。
- [ ] 全站视觉语言一致（同一套图标、同一档阴影、同一类动效）。
- [ ] 不破坏 `audit-styles` 与 `validate-contrast` 的通过（polish 不改变对比度底线）。
