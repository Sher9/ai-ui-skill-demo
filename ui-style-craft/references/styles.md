# 风格预设（Style Presets）

ui-style-craft 的默认审美是「极简 / 商务」：克制、单强调色、off-black、着色阴影、无渐变。
但玻璃拟态、科技、马卡龙、国潮、多巴胺需要截然不同的色板、阴影与字体。

本文件把用户常提的 9 种风格诉求映射到 7 个**预设（preset）**，并说明如何生成、如何用、以及哪些全局禁令在该风格下被**有意放开**。

> 预设只改「天花板」（色板 / 阴影 / 字体 / 玻璃面），**不动地板**：对比度闸、4px 间距阶梯、≤2 字阶、无纯黑、无 Inter、focus-visible 在所有风格下都仍然生效。

---

## 0. 风格 → 预设 → 模板 速查

| 用户诉求 | 端点 | 预设 `--preset` | 起点模板 |
|---|---|---|---|
| 极简风 | Web | `minimal` | `hero-split` / `features-asymmetric` / `dashboard` |
| 商务风 | Web | `business` | `pricing` / `settings-form` |
| 玻璃拟态风 | Web | `glass` | `hero-split` + 玻璃面 |
| 科技风 | Web | `tech`（`--mode dark`） | `dashboard` + 辉光 |
| 极简卡片 | 小程序 | `minimal` | `miniprogram/` + `mobile.md` |
| 马卡龙 / 温暖治愈 | 小程序 | `macaron` | `miniprogram/` + 暖奶油底 |
| 国潮新中式 | 小程序 | `guochao` | `miniprogram/` + 衬线 + 纸纹 |
| 渐变多巴胺 | 小程序 | `dopamine` | `miniprogram/` + 多色渐变 |
| 科技 | 小程序 | `tech`（`--mode dark` + `--platform wechat`） | `miniprogram/` + 辉光 |

> Web 与小程序用同一套预设；小程序额外加 `--platform wechat`（切 CJK 字体 + 导出 `rpx` 的 `tokens.wxss`，详见 `mobile.md`）。

---

## 1. 生成命令

```bash
# Web 各风格（在已有项目里把产出的 tokens.css 接上）
node scripts/generate-tokens.mjs --preset minimal  --accent "#2563eb" --out css
node scripts/generate-tokens.mjs --preset business --accent "#1d4ed8" --out css
node scripts/generate-tokens.mjs --preset glass    --accent "#6366f1" --out css
node scripts/generate-tokens.mjs --preset tech     --mode dark --accent "#22d3ee" --out css
node scripts/generate-tokens.mjs --preset macaron  --accent "#f9a8d4" --out css
node scripts/generate-tokens.mjs --preset guochao  --accent "#3b6ea5" --out css
node scripts/generate-tokens.mjs --preset dopamine --accent "#ff5d8f" --out css

# 小程序（多强调色 + 暖底 + rpx）
node scripts/generate-tokens.mjs --preset macaron --platform wechat --accent "#f9a8d4" \
  --out wxss,json --dir ./miniprogram/styles
# 在 app.wxss 顶部：@import "styles/tokens.wxss";
```

可用 `--preset` 值：`minimal` `business` `glass` `tech` `macaron` `guochao` `dopamine`（非法值会报错并列出可选值）。

预设会**自动叠加**到 minimal 基线之上：暖调中性阶（macaron/guochao）、附加强调色（`--color-semantic-accent-2..4`）、辉光阴影（glass/tech/dopamine）、半透明磨砂面（`--glass-*`）、衬线标题（`--font-family-serif`，business/guochao）。

---

## 2. 风格例外（重要：哪些禁令被放开）

`SKILL.md` / `anti-patterns.md` 的全局禁令，在以下预设下**有意放开**，agent 不应再"修复"它们：

| 全局禁令 | 在哪些预设下放开 | 放开后的正确用法 |
|---|---|---|
| 渐变文字 | `glass` `tech` `dopamine` | 仅用于 Hero 主标题 / 品牌字；`background: linear-gradient(...); -webkit-background-clip: text; color: transparent;` |
| 霓虹外发光（着色 box-shadow） | `glass` `tech` `dopamine` | 用预设生成的辉光阴影 `var(--shadow-lg)`（已按主色着色、低透明度，非廉价纯黑辉光） |
| 高饱和强调色（>80%） | `glass` `tech` `dopamine` | 允许青/紫/粉等高饱和；仍避免大面积刺眼平涂，用于强调与渐变停靠点 |
| 最多 1 个强调色 | `tech` `macaron` `guochao` `dopamine` | 用 `accent-2..4` 做分区 / 标签 / 图标点缀，主行动仍只用 `primary` |

> 自检脚本 `audit-styles.mjs` 接受 `--style <preset>`：传 `glass`/`tech`/`dopamine` 时，会自动放宽上述检查，避免把风格正解误报为 error/warn。

```bash
node scripts/audit-styles.mjs --src ./dist --style tech
```

---

## 3. 逐风格指南

### 3.1 minimal · 极简风（Web）/ 极简卡片（小程序）
- **色板**：默认。单强调色 + 冷灰中性阶；小程序下用 `platform wechat` 切 CJK 字体。
- **签名**：大留白、单一视觉焦点、层级靠字重+间距、细 1px 边框、着色阴影。
- **do**：对齐到 4px 栅格；卡片用 `surface` + 1px `border`；主按钮用 `primary`。
- **don't**：不要加渐变、辉光、第二强调色（极简风不放开例外）。
- **起点**：Web `hero-split` / `dashboard`；小程序 `miniprogram/`。

### 3.2 business · 商务风（Web）
- **色板**：同 minimal，可启用**衬线标题**（`--font-family-serif` = Source Serif 4）。
- **签名**：信任感、克制、强对齐；标题用衬线提升厚重（金融/法律/咨询）。
- **do**：衬线仅用于大标题与数字；正文仍无衬线；用 `primary` 做关键数据高亮。
- **don't**：不要花哨渐变；衬线不要滥用到正文与小字。
- **起点**：`pricing` / `settings-form`。

### 3.3 glass · 玻璃拟态风（Web）
- **色板**：冷灰 + 半透明磨砂面；背景**必须有彩色块/渐变**供玻璃折射，否则玻璃感出不来。
- **签名**：`backdrop-filter: blur(var(--glass-blur))` + `var(--glass-bg)`（半透明白）+ `var(--glass-border)` 描边 + 柔和着色辉光。
- **do**：玻璃卡片浮在彩色渐变背景上；玻璃仅用于卡片/导航/弹层，不用于整页；文本保持高对比（玻璃上文字用 `text-primary` 加深）。
- **don't**：不要纯白背景上放玻璃（看不见）；不要玻璃文字（玻璃只做容器）；辉光保持柔和。
- **起点**：`hero-split` 的图侧换成彩色渐变块，左卡片用 `.glass` 类。

```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}
```

### 3.4 tech · 科技风（Web / 小程序，`--mode dark`）
- **色板**：近黑科技底（`--color-semantic-bg` 预设已覆写为 `#0a0e1a`）+ 青/紫双辉光（`accent-2` 紫、`accent-3` 天蓝）+ 渐变文字。
- **签名**：辉光阴影 `var(--shadow-lg)`（主色着色）、网格/分隔线、渐变标题、等宽字体点缀数据。
- **do**：暗底上用青色做主行动与描边辉光；分隔线用 `rgba(primary, 0.15)`；Hero 标题可用渐变文字（青→紫）。
- **don't**：不要纯黑 `#000`（用预设 `bg`）；辉光不要过曝成白色光晕；亮色文字务必达 AA（已校验）。
- **起点**：Web `dashboard` 暗色化；小程序 `miniprogram/` 暗色 + 辉光卡片。

### 3.5 macaron · 马卡龙 / 温暖治愈（小程序为主，Web 亦可）
- **色板**：**暖奶油底**（`--color-semantic-bg` ≈ `#faf8f5`）+ 多粉彩（`accent-2` 薄荷 / `accent-3` 蜜桃 / `accent-4` 薰衣草 / `accent-5` 珊瑚）。
- **签名**：圆润大圆角、柔软低饱和、粉彩作标签/图标/分区底色、暖棕文字（`text-primary` 已是暖棕）。
- **do**：卡片圆角放大（`--radius-xl` 甚至更大）；粉彩做小面积点缀（图标底、标签），主按钮仍用 `primary`（粉）；留白比极简更松。
- **don't**：不要高饱和平涂大面；不要冷灰文字（用暖棕）；不要黑阴影（用柔和着色阴影）。
- **起点**：`miniprogram/` 暖底 + 粉彩标签。

### 3.6 guochao · 国潮新中式（小程序 / Web）
- **色板**：**米白宣纸底**（暖调，`bg` ≈ 暖奶油）+ 黛蓝主色 + 朱砂 / 赭金 / 苔绿点缀（`accent-2..4`）+ **中文衬线标题**（`--font-family-serif` = Noto Serif SC）。
- **签名**：宣纸纹理（极淡噪点 / 米色肌理）、衬线大标题、朱砂印章式强调、细金线分隔、留白如画卷。
- **do**：标题用衬线（`font-family: var(--font-family-serif)`）；主色用黛蓝，强调用朱砂点缀；可加 `1px` 赭金细线作边框；背景叠极淡纸纹（SVG/CSS 噪点，非图片依赖）。
- **don't**：不要 Inter / 无衬线大标题（国潮用衬线）；不要高饱和荧光；不要圆角过圆（偏方、留印章感）。
- **起点**：`miniprogram/` + 衬线标题 + 宣纸底。

### 3.7 dopamine · 渐变多巴胺（小程序 / Web）
- **色板**：高饱和多色（`accent` 粉 + `accent-2` 橙 + `accent-3` 青 + `accent-4` 紫）+ 辉光阴影。
- **签名**：大胆多色渐变、渐变文字、渐变按钮、鲜活亮底、强对比。
- **do**：渐变文字用于 Hero；按钮可用 `linear-gradient(primary → accent-4)`；分区用不同粉彩渐变；保持间距秩序（仍走 4px 阶梯）。
- **don't**：不要脏脏的灰；不要无焦点（多巴胺也要主行动突出）；小程序渐变文字用 `background-clip:text` + `color:transparent`（WXSS 支持）。
- **起点**：`miniprogram/` + 多色渐变卡片。

---

## 4. 移动端 / 小程序叠加规则

小程序用上述预设时，仍遵守 `mobile.md` 的硬约束：
- 间距/字号/圆角用 `rpx`（来自 `tokens.wxss`，已自动换算）。
- 可点目标 ≥ `88rpx`；固定底栏含 `env(safe-area-inset-bottom)`。
- 触屏无 `:hover`，按压态用 `:active` / `hover-class`。
- WXSS 不支持 `color-mix` / `backdrop-filter` 在部分基础库版本有限——玻璃拟态在小程序优先用**半透明白底 + 1px 描边 + 柔和阴影**模拟（避免强依赖 backdrop-filter）；多巴胺渐变文字用 `background-clip:text`。

---

## 5. 自检（交付前）

除 `SKILL.md` 的视觉 QA 清单外，按风格追加：
- [ ] 用了对应 `--preset` 生成 token，且 `meta.preset` 与诉求一致。
- [ ] 该风格放开的技法（渐变文字 / 辉光 / 多强调色）已正确使用，而非被"修复"回极简。
- [ ] 仍通过 `validate-contrast.mjs`（所有风格对比度门槛不变）与 `audit-styles.mjs --style <preset>`。
- [ ] 小程序：用 `tokens.wxss` + `rpx` + 安全区 + 触控目标达标。
