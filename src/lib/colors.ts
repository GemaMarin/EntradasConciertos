export function hashHue(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h % 360;
}

/** Degradado tipo "cartel" para un artista */
/** Paletas curadas [brillo, base, sombra] para que todo combine */
const PALETTES: [string, string, string][] = [
  ["#ff8a3d", "#ff3d6e", "#4a0b2a"], // atardecer
  ["#ff6bd6", "#8b3dff", "#1b0b4a"], // neón
  ["#5ee7ff", "#3d6bff", "#0b1a4a"], // eléctrico
  ["#ffd23d", "#ff6b3d", "#4a1a0b"], // fuego
  ["#3dffc4", "#0fa39b", "#062a33"], // menta
  ["#ff9ec7", "#e03d8b", "#3a0b2e"], // chicle
  ["#b8a1ff", "#5b3dff", "#120b3a"], // lavanda
  ["#ffb36b", "#d9482b", "#2e0f0b"], // terracota
  ["#7dd3ff", "#7a3dff", "#24083d"], // aurora
  ["#ff5f5f", "#b3123d", "#2a0410"], // carmesí
];

export function artistGradient(hue: number): string {
  const [a, b, c] = PALETTES[Math.floor(hue / 36) % PALETTES.length];
  return `radial-gradient(110% 90% at 12% 8%, ${a} 0%, transparent 58%),
    radial-gradient(90% 90% at 95% 100%, ${c} 0%, transparent 70%),
    linear-gradient(140deg, ${b}, ${c})`;
}

export const initials = (name: string) =>
  name
    .replace(/^(the|los|las|el|la)\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
