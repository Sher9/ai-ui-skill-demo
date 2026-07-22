#!/usr/bin/env node
/**
 * generate-tokens.mjs — 生成一套自洽的 design token。
 *
 * 零依赖（仅用 Node.js 标准库）。给定少量种子（强调色、明暗模式、密度、字阶比例），
 * 即可派生出完整的 token 集合，并导出为 JSON（单一真相源）、CSS 变量、TS 模块。
 *
 * 用法：
 *   node generate-tokens.mjs \
 *     --accent "#2563eb" --mode light --density normal \
 *     --ratio 1.125 --out json,css,ts --dir ./design-tokens
 *
 *   # 小程序：自动切 CJK 字体栈 + 导出 rpx 单位的 tokens.wxss
 *   node generate-tokens.mjs --platform wechat --out wxss,json --dir ./miniprogram/styles
 *
 *   # 风格预设：玻璃拟态 / 科技 / 马卡龙 / 国潮 / 多巴胺 / 商务 / 极简(默认)
 *   node generate-tokens.mjs --preset tech --mode dark --accent "#22d3ee" --out css
 *   node generate-tokens.mjs --preset macaron --accent "#f9a8d4" --out css
 *   node generate-tokens.mjs --preset guochao --accent "#3b6ea5" --out css
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hexToHsl, hslToRgb, hexToRgb, generateNeutralRamp, generateSemanticColors, contrastRatio } from '../lib/color.mjs';
import { modularScale, spacingScale, radiusScale } from '../lib/scale.mjs';
import { PRESETS, PRESET_NAMES, applyPreset } from '../lib/presets.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 从命令行读取 --key value 形式参数，缺失时回退到默认值。
function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

// 读取种子参数：强调色 / 明暗 / 密度 / 字阶比例 / 输出格式 / 输出目录。
const accent = arg('--accent', '#2563eb');
const mode = arg('--mode', 'light');
const density = arg('--density', 'normal');
const ratio = parseFloat(arg('--ratio', '1.125'));
const platform = arg('--platform', 'web'); // 'web' | 'wechat'（小程序）
const preset = arg('--preset', 'minimal');
if (!PRESETS[preset]) {
  console.error(`Invalid --preset: ${preset}. 可选：${PRESET_NAMES.join(', ')}`);
  process.exit(2);
}
const outFormats = arg('--out', 'json,css,ts').split(',').map((s) => s.trim()).filter(Boolean);
const dir = arg('--dir', path.resolve(__dirname, '..', 'design-tokens'));

// 小程序等中文界面：Geist/Satoshi 是纯拉丁字体，不含中文字形，直出会导致中文回退错乱。
// 因此 wechat 平台改用 CJK 字体栈（Geist 仍可置于 Latin 子栈位置，中文自然回退 PingFang）。
const fontSans = platform === 'wechat'
  ? '"PingFang SC", "Helvetica Neue", "Microsoft YaHei", system-ui, sans-serif'
  : 'Geist, Satoshi, system-ui, sans-serif';
const fontMono = platform === 'wechat'
  ? 'ui-monospace, "PingFang SC", monospace'
  : 'Geist Mono, JetBrains Mono, monospace';

// 解析强调色色相，非法则报错退出。
const hsl = hexToHsl(accent);
if (!hsl) { console.error(`Invalid --accent: ${accent}`); process.exit(2); }
const accentHue = hsl.h;

// 由强调色色相（warm 预设用固定暖色相）派生中性色阶，再派生语义色（含自动达标对比度）。
const neutralTone = PRESETS[preset].neutralTone === 'warm' ? 'warm' : 'cool';
const neutral = generateNeutralRamp(accentHue, mode, { tone: neutralTone });
const semantic = generateSemanticColors(accent, mode, neutral, contrastRatio);

// 着色阴影：取强调色色相，压低饱和度与明度，再以低透明度叠加，避免默认黑阴影的廉价感。
const tint = hslToRgb(accentHue, 25, 18);
const tintRgba = (a) => `rgba(${tint[0]}, ${tint[1]}, ${tint[2]}, ${a})`;
const shadow = {
  sm: `0 1px 2px 0 ${tintRgba(0.05)}`,
  md: `0 4px 6px -1px ${tintRgba(0.07)}, 0 2px 4px -2px ${tintRgba(0.05)}`,
  lg: `0 10px 15px -3px ${tintRgba(0.08)}, 0 4px 6px -4px ${tintRgba(0.05)}`,
  xl: `0 20px 25px -5px ${tintRgba(0.10)}, 0 8px 10px -6px ${tintRgba(0.05)}`,
};

// 在 minimal 基线之上叠加风格预设的偏差（多强调色 / 辉光阴影 / 衬线 / 玻璃面）。
const presetRgb = hexToRgb(accent) || [15, 23, 42];
const applied = applyPreset(preset, {
  accent, mode, neutral, semantic,
  primaryRgb: presetRgb, platform, cr: contrastRatio,
});
Object.assign(semantic, applied.semantic);
const shadowFinal = applied.shadow || shadow;
const fontFamily = { sans: fontSans, mono: fontMono };
if (applied.font.serif) fontFamily.serif = applied.font.serif;

// 组装完整 token 对象：meta 记录种子，color 含中性/语义色，
// font 含字族/字阶/字重/行高/字距，space 间距，radius 圆角，shadow 着色阴影，motion 动效。
const tokens = {
  meta: { accent, mode, density, ratio, preset, style: PRESETS[preset].label, version: '1.0.0', generator: 'ui-style-craft' },
  color: { neutral, semantic },
  font: {
    family: fontFamily,
    size: modularScale({ ratio }),
    weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
    lineHeight: { tight: '1.15', normal: '1.5', relaxed: '1.625' },
    letterSpacing: { tighter: '-0.02em', normal: '0', wide: '0.025em' },
  },
  space: spacingScale({ density }),
  spaceAlias: {
    xs: '{space.1}', sm: '{space.2}', md: '{space.4}',
    lg: '{space.6}', xl: '{space.8}', '2xl': '{space.12}',
  },
  radius: radiusScale(),
  shadow: shadowFinal,
  motion: {
    duration: { instant: '0ms', fast: '150ms', normal: '250ms', slow: '400ms' },
    easing: {
      standard: 'cubic-bezier(0.4,0,0.2,1)',
      emphasized: 'cubic-bezier(0.2,0,0.1)',
      decelerate: 'cubic-bezier(0,0,0.2,1)',
    },
  },
};
// 风格预设的玻璃磨砂面 token 仅在 glass 预设下存在，按需附加。
if (applied.glass) tokens.glass = applied.glass;

// 把 token 对象递归展平为 CSS 自定义属性（--a-b-c: ...），并把别名 {space.1} 改写成 var(--space-1)。
function toCss(tk) {
  const lines = [];
  const walk = (obj, prefix) => {
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined || v === null) continue;
      const name = prefix ? `${prefix}-${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, name);
      else {
        let val = String(v).replace(/\{(\w+)\.(\w+)\}/g, (_, a, b) => `var(--${a}-${b})`);
        lines.push(`  --${name}: ${val};`);
      }
    }
  };
  walk(tk, '');
  return `:root {\n${lines.join('\n')}\n}\n`;
}

// 把 token 对象导出为带类型约束的 TS 常量。
function toTs(tk) {
  return `export const tokens = ${JSON.stringify(tk, null, 2)} as const;\n`;
}

// 把长度值换算为小程序 rpx：1px = 2rpx（750rpx 屏宽基准），1rem(16px) = 32rpx。
// 仅转换 px / rem 单位，rgba 颜色、em 字距、无单位行高保持不变。
function toRpx(str) {
  return String(str).replace(/(-?\d*\.?\d+)(px|rem)/g, (_, num, unit) => {
    const n = parseFloat(num);
    const rpx = unit === 'rem' ? n * 32 : n * 2;
    return `${Math.round(rpx * 10) / 10}rpx`;
  });
}

// 导出 WXSS（小程序）：变量定义在 `page` 上全局可用，长度已换算为 rpx。
function toWxss(tk) {
  const lines = [];
  const walk = (obj, prefix) => {
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined || v === null) continue;
      const name = prefix ? `${prefix}-${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, name);
      else {
        let val = String(v).replace(/\{(\w+)\.(\w+)\}/g, (_, a, b) => `var(--${a}-${b})`);
        val = toRpx(val);
        lines.push(`  --${name}: ${val};`);
      }
    }
  };
  walk(tk, '');
  return `page {\n${lines.join('\n')}\n}\n`;
}

// 创建输出目录，并按需写出对应格式文件。
fs.mkdirSync(dir, { recursive: true });
if (outFormats.includes('json')) fs.writeFileSync(path.join(dir, 'tokens.json'), JSON.stringify(tokens, null, 2));
if (outFormats.includes('css')) fs.writeFileSync(path.join(dir, 'tokens.css'), toCss(tokens));
if (outFormats.includes('ts')) fs.writeFileSync(path.join(dir, 'tokens.ts'), toTs(tokens));
if (outFormats.includes('wxss')) fs.writeFileSync(path.join(dir, 'tokens.wxss'), toWxss(tokens));

console.log(`✓ Generated tokens (${mode}/${density}${platform !== 'web' ? '/' + platform : ''} / preset:${preset}) → ${dir}`);
console.log(`  accent=${accent}  primary=${semantic.primary}  text-muted=${semantic['text-muted']}`);
if (applied.def.accents) console.log(`  ⤷ 附加强调色：${applied.def.accents.join(', ')}`);
if (applied.def.glass) console.log(`  ⤷ 已追加玻璃磨砂面 token（--glass-*）`);
if (applied.font.serif) console.log(`  ⤷ 已启用衬线标题：${applied.font.serif}`);
if (outFormats.includes('wxss')) console.log(`  ⤷ tokens.wxss 已换算为 rpx（小程序用，@import 到 app.wxss）`);
