// Carga dinámica de Google Fonts mediante inyección de <link>.
// Se cachean las fuentes ya solicitadas para no duplicar peticiones.

import { FONTS } from "./config.js";

const loaded = new Set();

function familyToParam(font) {
  const family = font.name.replace(/ /g, "+");
  if (font.variable && font.weights.length > 1) {
    const min = font.weights[0];
    const max = font.weights[font.weights.length - 1];
    return `${family}:wght@${min}..${max}`;
  }
  if (font.weights.length > 1) {
    return `${family}:wght@${font.weights.join(";")}`;
  }
  return family;
}

// Carga una fuente por nombre y resuelve cuando está disponible.
export async function loadFont(name) {
  const font = FONTS.find((f) => f.name === name);
  if (!font) return;

  if (!loaded.has(name)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${familyToParam(font)}&display=swap`;
    document.head.appendChild(link);
    loaded.add(name);
  }

  // Esperar a que el navegador tenga la fuente lista (mejora el render inicial).
  try {
    await document.fonts.load(`${font.weights[0]} 64px "${name}"`);
    await document.fonts.ready;
  } catch (_) {
    /* document.fonts puede no estar disponible; se ignora */
  }
}

// Precarga todas las fuentes de la lista (para el <select>, opcional).
export function preloadAll() {
  FONTS.forEach((f) => loadFont(f.name));
}
