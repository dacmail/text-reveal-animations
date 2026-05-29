// Panel de controles: texto, fuente, peso, tamaño y tema.
// Notifica los cambios mediante callbacks.

import {
  MAX_CHARS, DEFAULT_TEXT, DEFAULT_SIZE, MIN_SIZE, MAX_SIZE,
  FONTS, DEFAULT_FONT, DEFAULT_WEIGHT,
} from "./config.js";

const THEME_KEY = "te-theme";

export function getInitialState() {
  return {
    text: DEFAULT_TEXT,
    font: DEFAULT_FONT,
    weight: DEFAULT_WEIGHT,
    size: DEFAULT_SIZE,
  };
}

// --- Tema ------------------------------------------------------------------
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
}

export function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(stored || (prefersDark ? "dark" : "light"));
}

function fillWeights(select, font) {
  select.innerHTML = "";
  font.weights.forEach((w) => {
    const opt = document.createElement("option");
    opt.value = w;
    opt.textContent = w;
    select.appendChild(opt);
  });
}

// Monta el panel y llama a `onChange(state)` ante cualquier cambio.
export function initControls({ onChange }) {
  const state = getInitialState();

  const textInput = document.getElementById("ctl-text");
  const fontSelect = document.getElementById("ctl-font");
  const weightSelect = document.getElementById("ctl-weight");
  const sizeInput = document.getElementById("ctl-size");
  const sizeVal = document.getElementById("ctl-size-val");
  const counter = document.getElementById("ctl-counter");
  const themeBtn = document.getElementById("ctl-theme");

  // Texto
  textInput.maxLength = MAX_CHARS;
  textInput.value = state.text;
  const updateCounter = () => { counter.textContent = `${textInput.value.length}/${MAX_CHARS}`; };
  updateCounter();
  textInput.addEventListener("input", () => {
    state.text = textInput.value || DEFAULT_TEXT;
    updateCounter();
    onChange({ ...state });
  });

  // Fuentes
  FONTS.forEach((f) => {
    const opt = document.createElement("option");
    opt.value = f.name;
    opt.textContent = f.name + (f.variable ? " ·var" : "");
    fontSelect.appendChild(opt);
  });
  fontSelect.value = state.font;

  // Pesos (según fuente)
  const currentFont = () => FONTS.find((f) => f.name === state.font);
  fillWeights(weightSelect, currentFont());
  weightSelect.value = state.weight;

  fontSelect.addEventListener("change", () => {
    state.font = fontSelect.value;
    const f = currentFont();
    fillWeights(weightSelect, f);
    // Ajustar peso si el actual no existe en la nueva fuente
    if (!f.weights.includes(state.weight)) {
      state.weight = f.weights.includes(400) ? 400 : f.weights[0];
    }
    weightSelect.value = state.weight;
    onChange({ ...state });
  });

  weightSelect.addEventListener("change", () => {
    state.weight = Number(weightSelect.value);
    onChange({ ...state });
  });

  // Tamaño
  sizeInput.min = MIN_SIZE;
  sizeInput.max = MAX_SIZE;
  sizeInput.value = state.size;
  sizeVal.textContent = `${state.size}px`;
  sizeInput.addEventListener("input", () => {
    state.size = Number(sizeInput.value);
    sizeVal.textContent = `${state.size}px`;
    onChange({ ...state });
  });

  // Tema
  themeBtn.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
  });

  return state;
}
