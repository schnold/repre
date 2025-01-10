// src/lib/utils/color-helpers.ts

export const PASTEL_COLORS = [
  '#FFB3BA', // Pink
  '#BAFFC9', // Green
  '#BAE1FF', // Blue
  '#FFE4BA', // Orange
  '#E8BAFF', // Purple
  '#FFBADF', // Rose
  '#BAF2FF', // Cyan
  '#FFFFBA', // Yellow
  '#D4FFBA', // Lime
  '#FFBAB8', // Coral
];

export function getRandomPastelColor(): string {
  return PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
}

export function adjustColorBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;

  // Ensure values stay within valid range (0-255)
  r = Math.max(Math.min(r, 255), 0);
  g = Math.max(Math.min(g, 255), 0);
  b = Math.max(Math.min(b, 255), 0);

  // Convert back to hex
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function getContrastColor(hexcolor: string): string {
  const r = parseInt(hexcolor.slice(1, 3), 16);
  const g = parseInt(hexcolor.slice(3, 5), 16);
  const b = parseInt(hexcolor.slice(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128 ? '#000000' : '#FFFFFF';
}

export function generateColorPalette(baseColor: string): string[] {
  const palette: string[] = [];
  // Generate lighter shades
  for (let i = 20; i >= -20; i -= 10) {
    palette.push(adjustColorBrightness(baseColor, i));
  }
  return palette;
}