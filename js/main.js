// Punto de entrada: inicializa scroll suave (Lenis), GSAP/ScrollTrigger,
// renderiza las secciones de cada efecto y re-aplica al cambiar los controles.

import { EFFECTS } from "./effects.js";
import { initControls, initTheme } from "./controls.js";
import { loadFont } from "./fonts.js";

const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);

initTheme();

// --- Scroll suave con Lenis, sincronizado con ScrollTrigger ---------------
let lenis;
function initSmoothScroll() {
  if (typeof Lenis === "undefined") return; // fallback: scroll nativo
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// --- Construcción del DOM de las secciones --------------------------------
const grid = document.getElementById("effects");

function buildSections() {
  const frag = document.createDocumentFragment();
  EFFECTS.forEach((effect, i) => {
    const section = document.createElement("section");
    section.className = "te-section";
    section.id = `fx-${effect.id}`;

    const meta = document.createElement("div");
    meta.className = "te-meta";
    meta.innerHTML = `
      <span class="te-index">${String(i + 1).padStart(2, "0")}</span>
      <span class="te-group">${effect.group}</span>
      <span class="te-label">${effect.label}</span>
      <button class="te-code-toggle" aria-expanded="false">&lt;/&gt; código</button>`;

    const stage = document.createElement("div");
    stage.className = "te-stage";
    const wrap = document.createElement("div");
    wrap.className = "te-text-wrap";
    const text = document.createElement("div");
    text.className = "te-text";
    wrap.appendChild(text);
    stage.appendChild(wrap);

    const pre = document.createElement("pre");
    pre.className = "te-code";
    pre.hidden = true;
    pre.textContent = effect.code;

    meta.querySelector(".te-code-toggle").addEventListener("click", (e) => {
      const open = pre.hidden;
      pre.hidden = !open;
      e.target.setAttribute("aria-expanded", String(open));
    });

    section.appendChild(meta);
    section.appendChild(stage);
    section.appendChild(pre);
    frag.appendChild(section);

    effect._el = text; // referencia al contenedor de texto
  });
  grid.appendChild(frag);
}

// --- Aplicar estilo de fuente y (re)ejecutar efectos ----------------------
let cleanups = [];

function applyStyle(state) {
  const els = document.querySelectorAll(".te-text");
  els.forEach((el) => {
    el.style.fontFamily = `"${state.font}", sans-serif`;
    el.style.fontWeight = state.weight;
    el.style.fontSize = `${state.size}px`;
    el.dataset.text = state.text;
  });
}

function runEffects() {
  EFFECTS.forEach((effect) => {
    const el = effect._el;
    const cleanup = effect.run(el, { gsap, ScrollTrigger });
    if (typeof cleanup === "function") cleanups.push(cleanup);
  });

  ScrollTrigger.refresh();
}

async function apply(state) {
  await loadFont(state.font);

  // Limpiar timelines/triggers previos y resetear propiedades que los
  // efectos puedan haber dejado fijadas (transform, filter, fontWeight...).
  cleanups.forEach((fn) => { try { fn(); } catch (_) {} });
  cleanups = [];
  document.querySelectorAll(".te-text").forEach((el) => {
    gsap.set(el, { clearProps: "all" });
  });

  // IMPORTANTE: aplicar los estilos DESPUÉS del clearProps, si no se borran.
  applyStyle(state);
  runEffects();
}

// --- Init ------------------------------------------------------------------
initSmoothScroll();
buildSections();

const state = initControls({
  onChange: (s) => { apply(s); },
});

apply(state);

// Recalcular posiciones tras cargar todo / redimensionar.
window.addEventListener("load", () => ScrollTrigger.refresh());
