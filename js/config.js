// Configuración global de la librería de efectos de texto.

// Límite de caracteres del input de texto del usuario.
export const MAX_CHARS = 80;

// Texto por defecto que se muestra al cargar.
export const DEFAULT_TEXT = "Text reveal animation";

// Tamaño por defecto (px).
export const DEFAULT_SIZE = 64;
export const MIN_SIZE = 24;
export const MAX_SIZE = 120;

// Lista curada de Google Fonts. `variable: true` indica que soporta
// el eje de peso variable (necesario para el efecto "variable font weight").
export const FONTS = [
  { name: "Inter", variable: true, weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: "Space Grotesk", variable: true, weights: [300, 400, 500, 600, 700] },
  { name: "Archivo", variable: true, weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: "Roboto Flex", variable: true, weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: "Fraunces", variable: true, weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: "Playfair Display", variable: true, weights: [400, 500, 600, 700, 800, 900] },
  { name: "Bricolage Grotesque", variable: true, weights: [200, 300, 400, 500, 600, 700, 800] },
  { name: "Syne", variable: true, weights: [400, 500, 600, 700, 800] },
  { name: "Sora", variable: true, weights: [100, 200, 300, 400, 500, 600, 700, 800] },
  { name: "Manrope", variable: true, weights: [200, 300, 400, 500, 600, 700, 800] },
  { name: "Space Mono", variable: false, weights: [400, 700] },
  { name: "JetBrains Mono", variable: true, weights: [100, 200, 300, 400, 500, 600, 700, 800] },
  { name: "Anton", variable: false, weights: [400] },
  { name: "Bebas Neue", variable: false, weights: [400] },
  { name: "DM Serif Display", variable: false, weights: [400] },
];

export const DEFAULT_FONT = "Space Grotesk";
export const DEFAULT_WEIGHT = 600;
