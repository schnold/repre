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
  }