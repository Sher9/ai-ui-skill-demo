// lib/presets.mjs — ui-style-craft 的「风格预设」。
//
// 默认（minimal）审美是克制、单强调色、off-black、着色阴影、无渐变。
// 但玻璃拟态 / 科技 / 马卡龙 / 国潮 / 多巴胺需要截然不同的色板、阴影与字体。
// 本文件把每种风格的"偏差"声明为数据，由 generate-tokens.mjs 在 minimal 基线之上叠加，
// 既保留 token 纪律（对比度 / 间距阶梯不变），又打开"天花板"。
//
// 每个预设字段：
//   label     风格中文名
//   neutralTone  'cool'(默认) | 'warm'(暖奶油/宣纸底)
//   shadow    'tinted'(默认) | 'glow'(着色辉光，玻璃/科技/多巴胺用)
//   accents   额外强调色数组（accent-2..4），用于多色风格
//   serif     {cjk?:bool} 是否启用衬线标题（商务/国潮）
//   glass     true 时追加半透明磨砂面 token（玻璃拟态）
//   gradient  仅作信息标记：该风格下渐变文字/多色渐变属"正解"（供 references/styles.md 与 audit 引用）
//   bg        可选的基底背景覆盖（如科技用近黑底）
//   note      给 agent 的简短说明

export const PRESETS = {
  minimal: {
    label: '极简风',
    neutralTone: 'cool',
    shadow: 'tinted',
    gradient: false,
    note: '默认基线：克制留白、单强调色、off-black、着色阴影，无渐变与辉光。',
  },
  business: {
    label: '商务风',
    neutralTone: 'cool',
    shadow: 'tinted',
    serif: { cjk: false },
    gradient: false,
    note: '中性商务；可启用衬线标题（Source Serif / Noto Serif）提升厚重与信赖感。',
  },
  glass: {
    label: '玻璃拟态',
    neutralTone: 'cool',
    shadow: 'glow',
    glass: true,
    gradient: true,
    note: '半透明磨砂面 + backdrop-filter + 柔和着色辉光；背景需有彩色块/渐变供折射，否则玻璃感出不来。',
  },
  tech: {
    label: '科技风',
    neutralTone: 'cool',
    shadow: 'glow',
    accents: ['#a855f7', '#38bdf8'],
    gradient: true,
    bg: '#0a0e1a',
    note: '近黑科技底 + 青/紫双辉光 + 渐变文字/分隔线；高饱和强调色与着色外发光在此风格下允许（覆盖全局禁令）。建议 --mode dark。',
  },
  macaron: {
    label: '马卡龙 / 温暖治愈',
    neutralTone: 'warm',
    shadow: 'tinted',
    accents: ['#a7f3d0', '#fcd34d', '#c4b5fd', '#fca5a5'],
    gradient: false,
    note: '暖奶油底 + 多粉彩点缀（薄荷/蜜桃/薰衣草/珊瑚），低饱和、圆润、柔软、留白多。',
  },
  guochao: {
    label: '国潮新中式',
    neutralTone: 'warm',
    shadow: 'tinted',
    accents: ['#c0392b', '#caa84a', '#7d8b3a'],
    serif: { cjk: true },
    gradient: false,
    note: '米白宣纸底 + 黛蓝主色 + 朱砂/赭金/苔绿点缀 + 中文衬线标题（Noto Serif SC）+ 纸/墨纹理。',
  },
  dopamine: {
    label: '渐变多巴胺',
    neutralTone: 'cool',
    shadow: 'glow',
    accents: ['#ffb347', '#22d3ee', '#8b5cf6'],
    gradient: true,
    note: '高饱和多色渐变 + 渐变文字 + 鲜活亮底；大胆用色，渐变文字与辉光属正解（覆盖全局禁令）。',
  },
};

export const PRESET_NAMES = Object.keys(PRESETS);

// 在 minimal 基线之上，把预设的偏差叠加进 token。
// ctx: { accent, mode, neutral, semantic, primaryRgb, platform, cr }
// 返回: { def, semantic:{}, font:{}, shadow:null|{}, glass:null|{} }
export function applyPreset(name, ctx) {
  const def = PRESETS[name] || PRESETS.minimal;
  const out = { def, semantic: {}, font: {}, shadow: null, glass: null };

  // 额外强调色：每个附自动达标的 fg。
  if (Array.isArray(def.accents)) {
    def.accents.forEach((hex, i) => {
      const key = `accent-${i + 2}`;
      out.semantic[key] = hex;
      out.semantic[`${key}-fg`] = ctx.cr(hex, '#ffffff') >= 4.5 ? '#ffffff' : '#0a0a0b';
    });
  }

  // 风格基底背景覆盖（如科技风近黑底），仅暗色模式生效，避免与亮色文字冲突。
  if (def.bg && ctx.mode === 'dark') out.semantic.bg = def.bg;

  // 衬线标题字体栈。
  if (def.serif) {
    const cjk = def.serif.cjk || ctx.platform === 'wechat';
    out.font.serif = cjk
      ? '"Noto Serif SC", "Source Han Serif SC", serif'
      : '"Source Serif 4", Georgia, "Times New Roman", serif';
  }

  // 辉光阴影（玻璃/科技/多巴胺）：以主色着色的柔和外发光 + 1px 着色描边。
  if (def.shadow === 'glow') {
    const [r, g, b] = ctx.primaryRgb;
    const a = (n) => `rgba(${r}, ${g}, ${b}, ${n})`;
    out.shadow = {
      sm: `0 1px 2px 0 ${a(0.12)}`,
      md: `0 4px 14px -2px ${a(0.30)}, 0 0 0 1px ${a(0.14)}`,
      lg: `0 12px 34px -6px ${a(0.40)}, 0 0 0 1px ${a(0.16)}`,
      xl: `0 22px 52px -8px ${a(0.48)}, 0 0 0 1px ${a(0.18)}`,
    };
  }

  // 玻璃磨砂面 token。
  if (def.glass) {
    out.glass = {
      'bg': 'rgba(255, 255, 255, 0.55)',
      'bg-dark': 'rgba(20, 22, 34, 0.50)',
      'border': 'rgba(255, 255, 255, 0.45)',
      'blur': '18px',
      'shadow': '0 8px 32px -8px rgba(15, 23, 42, 0.20)',
    };
  }

  return out;
}
