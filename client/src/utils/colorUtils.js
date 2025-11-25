const BASE_COLORS = {
  red: { h: 0, s: 75, l: 55 },
  orange: { h: 30, s: 80, l: 55 },
  yellow: { h: 50, s: 90, l: 60 },
  green: { h: 120, s: 70, l: 50 },
  teal: { h: 170, s: 70, l: 50 },
  cyan: { h: 190, s: 80, l: 55 },
  blue: { h: 210, s: 75, l: 55 },
  purple: { h: 270, s: 70, l: 55 },
  violet: { h: 285, s: 70, l: 55 },
  pink: { h: 320, s: 75, l: 65 },
  brown: { h: 25, s: 55, l: 40 },
  gray: { h: 0, s: 0, l: 50 },
  black: { h: 0, s: 0, l: 10 },
  white: { h: 0, s: 0, l: 95 },
};

const COLOR_SYNONYMS = {
  aqua: "cyan",
  turquoise: "teal",
  sky: "blue",
  ocean: "blue",
  sea: "teal",
  mint: "green",
  lime: "green",
  olive: "green",
  forest: "green",
  navy: "blue",
  indigo: "purple",
  lavender: "violet",
  lilac: "violet",
  rose: "pink",
  magenta: "pink",
  fuchsia: "pink",
  chocolate: "brown",
  coffee: "brown",
  sand: "brown",
  beige: "brown",
  gold: "yellow",
  silver: "gray",
  slate: "gray",
  charcoal: "gray",
};

const LIGHT_WORDS = ["light", "pale", "soft", "pastel", "baby", "sky"];
const DARK_WORDS = ["dark", "deep", "navy"];
const BRIGHT_WORDS = ["bright", "vibrant", "neon", "hot", "intense"];

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const r = Math.round(255 * f(0));
  const g = Math.round(255 * f(8));
  const b = Math.round(255 * f(4));
  const toHex = (v) => v.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const s = 65;
  const l = 55;
  return hslToHex(hue, s, l);
}

export function nameToColor(input) {
  const raw = (input || "").trim();
  if (!raw) return "";
  if (/^#?[0-9a-fA-F]{3,8}$/.test(raw)) {
    const clean = raw.startsWith("#") ? raw.slice(1) : raw;
    return `#${clean}`;
  }

  const tokens = raw
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean);
  if (!tokens.length) return stringToColor(raw);

  let baseColors = [];
  let lightAdjust = 0;
  let satAdjust = 0;

  for (const t of tokens) {
    if (BASE_COLORS[t]) {
      baseColors.push(BASE_COLORS[t]);
      continue;
    }
    if (COLOR_SYNONYMS[t] && BASE_COLORS[COLOR_SYNONYMS[t]]) {
      baseColors.push(BASE_COLORS[COLOR_SYNONYMS[t]]);
      continue;
    }
    if (LIGHT_WORDS.includes(t)) {
      lightAdjust += 15;
      satAdjust -= 10;
      continue;
    }
    if (DARK_WORDS.includes(t)) {
      lightAdjust -= 15;
      continue;
    }
    if (BRIGHT_WORDS.includes(t)) {
      satAdjust += 10;
      continue;
    }
  }

  if (!baseColors.length) {
    return stringToColor(raw);
  }

  let h = baseColors.reduce((sum, c) => sum + c.h, 0) / baseColors.length;
  let s =
    baseColors.reduce((sum, c) => sum + c.s, 0) / baseColors.length + satAdjust;
  let l =
    baseColors.reduce((sum, c) => sum + c.l, 0) / baseColors.length +
    lightAdjust;

  s = Math.max(20, Math.min(100, s));
  l = Math.max(20, Math.min(80, l));

  return hslToHex(h, s, l);
}

function hexToRgb(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const intVal = parseInt(h, 16);
  const r = (intVal >> 16) & 255;
  const g = (intVal >> 8) & 255;
  const b = intVal & 255;
  return { r, g, b };
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
  }

  return { h, s: s * 100, l: l * 100 };
}

function baseNameFromHue(h) {
  if (h >= 0 && h < 15) return "Red";
  if (h >= 15 && h < 35) return "Orange";
  if (h >= 35 && h < 65) return "Yellow";
  if (h >= 65 && h < 160) return "Green";
  if (h >= 160 && h < 190) return "Teal";
  if (h >= 190 && h < 230) return "Blue";
  if (h >= 230 && h < 260) return "Indigo";
  if (h >= 260 && h < 290) return "Purple";
  if (h >= 290 && h < 330) return "Magenta";
  return "Pink";
}

function hexToNiceName(hexInput) {
  const clean = hexInput.replace("#", "");
  if (!/^[0-9a-fA-F]{3,8}$/.test(clean)) return "";

  const { r, g, b } = hexToRgb(clean);
  const { h, s, l } = rgbToHsl(r, g, b);

  if (s < 10) {
    if (l > 85) return "White";
    if (l < 20) return "Black";
    if (l < 40) return "Dark Gray";
    if (l > 70) return "Light Gray";
    return "Gray";
  }

  if (h >= 20 && h < 55) {
    if (l < 30) return "Dark Brown";
    if (l < 55) return "Brown";
    if (l > 75 && s < 60) return "Beige";
    if (l > 65) return "Light Brown";
    return "Brown";
  }

  const base = baseNameFromHue(h);
  let prefix = "";

  if (l < 25) prefix = "Dark ";
  else if (l > 75) prefix = "Light ";
  else if (s > 80 && l > 45 && l < 70) prefix = "Bright ";

  return `${prefix}${base}`.trim();
}

export function getColorLabel(input) {
  if (!input) return "";
  const str = input.toString().trim();

  if (/^#?[0-9a-fA-F]{3,8}$/.test(str)) {
    const name = hexToNiceName(str);
    if (name) return name;
    return "Custom Color";
  }

  return str
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}
