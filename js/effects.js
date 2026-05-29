// Definición de los efectos de aparición de texto.
// Cada efecto: { id, group, label, code, run(el, ctx) -> cleanup() }
// `el` es el contenedor de texto (.te-text) ya con fuente/peso/tamaño aplicados.
// `ctx` expone helpers (gsap, ScrollTrigger). `run` devuelve una función de limpieza.

const { gsap } = window;
const ScrollTrigger = window.ScrollTrigger;

// --- Helpers de split (sin SplitText de pago) -----------------------------

// Envuelve cada palabra en un <span class="te-word"> (conservando espacios).
function splitWords(el, text) {
  el.innerHTML = "";
  const frag = document.createDocumentFragment();
  const words = text.split(/(\s+)/); // conserva los espacios como tokens
  words.forEach((token) => {
    if (/^\s+$/.test(token)) {
      frag.appendChild(document.createTextNode(token));
    } else if (token.length) {
      const span = document.createElement("span");
      span.className = "te-word";
      span.textContent = token;
      frag.appendChild(span);
    }
  });
  el.appendChild(frag);
  return Array.from(el.querySelectorAll(".te-word"));
}

// Envuelve cada letra en un <span class="te-char">, agrupando por palabra
// para evitar que las palabras se partan al final de línea.
function splitChars(el, text) {
  el.innerHTML = "";
  const frag = document.createDocumentFragment();
  const words = text.split(/(\s+)/);
  words.forEach((token) => {
    if (/^\s+$/.test(token)) {
      frag.appendChild(document.createTextNode(token));
      return;
    }
    if (!token.length) return;
    const wordWrap = document.createElement("span");
    wordWrap.className = "te-word";
    for (const ch of token) {
      const span = document.createElement("span");
      span.className = "te-char";
      span.textContent = ch;
      wordWrap.appendChild(span);
    }
    frag.appendChild(wordWrap);
  });
  el.appendChild(frag);
  return Array.from(el.querySelectorAll(".te-char"));
}

// Inserta texto plano (un solo nodo) y lo devuelve.
function setPlain(el, text) {
  el.textContent = text;
  return el;
}

// toggleActions estándar: anima al entrar, revierte al salir hacia arriba.
const TOGGLE = "play none none reverse";

// Crea un ScrollTrigger asociado a una timeline y devuelve cleanup.
function fromTween(tween) {
  return () => {
    if (tween.scrollTrigger) tween.scrollTrigger.kill();
    tween.kill();
  };
}

// --- Definición de efectos -------------------------------------------------

export const EFFECTS = [
  // ===================== VISIBILIDAD / OPACIDAD =====================
  {
    id: "fade-in",
    group: "Visibilidad",
    label: "Fade in",
    code: `gsap.from(el, {
  opacity: 0, duration: 1, ease: "power2.out",
  scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" }
});`,
    run(el) {
      setPlain(el, el.dataset.text);
      const t = gsap.from(el, {
        opacity: 0, duration: 1, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 80%", toggleActions: TOGGLE },
      });
      return fromTween(t);
    },
  },
  {
    id: "fade-words",
    group: "Visibilidad",
    label: "Fade in por palabras",
    code: `const words = splitWords(el);
gsap.from(words, {
  opacity: 0, stagger: 0.08, duration: 0.6, ease: "power2.out",
  scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" }
});`,
    run(el) {
      const words = splitWords(el, el.dataset.text);
      const t = gsap.from(words, {
        opacity: 0, stagger: 0.08, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 80%", toggleActions: TOGGLE },
      });
      return fromTween(t);
    },
  },
  {
    id: "fade-chars",
    group: "Visibilidad",
    label: "Fade in por letras",
    code: `const chars = splitChars(el);
gsap.from(chars, {
  opacity: 0, stagger: 0.03, duration: 0.4, ease: "power1.out",
  scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" }
});`,
    run(el) {
      const chars = splitChars(el, el.dataset.text);
      const t = gsap.from(chars, {
        opacity: 0, stagger: 0.03, duration: 0.4, ease: "power1.out",
        scrollTrigger: { trigger: el, start: "top 80%", toggleActions: TOGGLE },
      });
      return fromTween(t);
    },
  },
  {
    id: "fade-out",
    group: "Visibilidad",
    label: "Fade out al salir",
    code: `gsap.to(el, {
  opacity: 0, ease: "none",
  scrollTrigger: { trigger: el, start: "center 30%", end: "top top", scrub: true }
});`,
    run(el) {
      setPlain(el, el.dataset.text);
      const t = gsap.to(el, {
        opacity: 0, ease: "none",
        scrollTrigger: { trigger: el, start: "center 30%", end: "top top", scrub: true },
      });
      return fromTween(t);
    },
  },

  // ===================== MÁSCARA / CLIP =====================
  {
    id: "clip-vertical",
    group: "Máscara / Clip",
    label: "Clip reveal vertical",
    code: `// el texto sube saliendo de una caja (overflow hidden en el wrapper)
gsap.from(el, {
  yPercent: 110, duration: 1, ease: "power3.out",
  scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" }
});`,
    run(el) {
      setPlain(el, el.dataset.text);
      el.parentElement.classList.add("te-clip");
      const t = gsap.from(el, {
        yPercent: 110, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el.parentElement, start: "top 85%", toggleActions: TOGGLE },
      });
      return () => { fromTween(t)(); el.parentElement.classList.remove("te-clip"); };
    },
  },
  {
    id: "clip-horizontal",
    group: "Máscara / Clip",
    label: "Clip reveal horizontal",
    code: `gsap.from(el, {
  clipPath: "inset(0 100% 0 0)", duration: 1.1, ease: "power3.inOut",
  scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" }
});`,
    run(el) {
      setPlain(el, el.dataset.text);
      const t = gsap.fromTo(el,
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 1.1, ease: "power3.inOut",
          scrollTrigger: { trigger: el, start: "top 80%", toggleActions: TOGGLE } });
      return fromTween(t);
    },
  },
  {
    id: "wipe",
    group: "Máscara / Clip",
    label: "Wipe reveal (persiana)",
    code: `// barra que se abre revelando el texto por palabras
const words = splitWords(el);
gsap.fromTo(words,
  { clipPath: "inset(0 0 100% 0)" },
  { clipPath: "inset(0 0 0% 0)", stagger: 0.1, duration: 0.6, ease: "power2.out",
    scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" } });`,
    run(el) {
      const words = splitWords(el, el.dataset.text);
      const t = gsap.fromTo(words,
        { clipPath: "inset(0 0 100% 0)" },
        { clipPath: "inset(0 0 0% 0)", stagger: 0.1, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 80%", toggleActions: TOGGLE } });
      return fromTween(t);
    },
  },

  // ===================== COLOR / TIPOGRAFÍA =====================
  {
    id: "color-reveal",
    group: "Color / Tipografía",
    label: "Color reveal (linterna)",
    code: `// las palabras pasan de tenue a color final según avanza el scroll
const words = splitWords(el);
gsap.fromTo(words, { opacity: 0.15 },
  { opacity: 1, color: "var(--accent)", stagger: 0.2, ease: "none",
    scrollTrigger: { trigger: el, start: "top 70%", end: "bottom 40%", scrub: true } });`,
    run(el) {
      const words = splitWords(el, el.dataset.text);
      const t = gsap.fromTo(words,
        { opacity: 0.15 },
        { opacity: 1, color: "var(--accent)", stagger: 0.5, ease: "none",
          scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 45%", scrub: true } });
      return fromTween(t);
    },
  },
  {
    id: "color-sweep",
    group: "Color / Tipografía",
    label: "Color sweep (gradiente)",
    code: `// un gradiente de color barre el texto de izquierda a derecha
el.classList.add("te-sweep");
gsap.fromTo(el, { backgroundPositionX: "100%" },
  { backgroundPositionX: "0%", ease: "none",
    scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 50%", scrub: true } });`,
    run(el) {
      setPlain(el, el.dataset.text);
      el.classList.add("te-sweep");
      const t = gsap.fromTo(el,
        { "--sweep": "0%" },
        { "--sweep": "100%", ease: "none",
          scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 50%", scrub: true } });
      return () => { fromTween(t)(); el.classList.remove("te-sweep"); };
    },
  },
  {
    id: "shine",
    group: "Color / Tipografía",
    label: "Shine / shimmer",
    code: `// un destello recorre el texto al entrar en viewport
el.classList.add("te-shine");
gsap.fromTo(el, { "--shine": "-30%" },
  { "--shine": "130%", duration: 1.4, ease: "power2.inOut",
    scrollTrigger: { trigger: el, start: "top 75%", toggleActions: "play none none reset" } });`,
    run(el) {
      setPlain(el, el.dataset.text);
      el.classList.add("te-shine");
      const t = gsap.fromTo(el,
        { "--shine": "-30%" },
        { "--shine": "130%", duration: 1.4, ease: "power2.inOut",
          scrollTrigger: { trigger: el, start: "top 75%", toggleActions: "play none none reset" } });
      return () => { fromTween(t)(); el.classList.remove("te-shine"); };
    },
  },
  {
    id: "highlight",
    group: "Color / Tipografía",
    label: "Highlight (subrayado)",
    code: `// el fondo de cada palabra se colorea como un subrayado
const words = splitWords(el);
words.forEach(w => w.classList.add("te-hl"));
gsap.fromTo(words, { "--hl": "0%" },
  { "--hl": "100%", stagger: 0.12, duration: 0.5, ease: "power1.out",
    scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" } });`,
    run(el) {
      const words = splitWords(el, el.dataset.text);
      words.forEach((w) => w.classList.add("te-hl"));
      const t = gsap.fromTo(words,
        { "--hl": "0%" },
        { "--hl": "100%", stagger: 0.12, duration: 0.5, ease: "power1.out",
          scrollTrigger: { trigger: el, start: "top 80%", toggleActions: TOGGLE } });
      return fromTween(t);
    },
  },

  // ===================== MOVIMIENTO / POSICIÓN =====================
  {
    id: "slide-up",
    group: "Movimiento",
    label: "Slide up",
    code: `gsap.from(el, {
  y: 60, opacity: 0, duration: 0.9, ease: "power3.out",
  scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" }
});`,
    run(el) {
      setPlain(el, el.dataset.text);
      const t = gsap.from(el, {
        y: 60, opacity: 0, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: TOGGLE },
      });
      return fromTween(t);
    },
  },
  {
    id: "slide-side",
    group: "Movimiento",
    label: "Slide in (lateral, por palabras)",
    code: `const words = splitWords(el);
gsap.from(words, {
  x: (i) => (i % 2 ? 80 : -80), opacity: 0, stagger: 0.08, duration: 0.8, ease: "power2.out",
  scrollTrigger: { trigger: el, start: "top 82%", toggleActions: "play none none reverse" }
});`,
    run(el) {
      const words = splitWords(el, el.dataset.text);
      const t = gsap.from(words, {
        x: (i) => (i % 2 ? 80 : -80), opacity: 0, stagger: 0.08, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 82%", toggleActions: TOGGLE },
      });
      return fromTween(t);
    },
  },
  {
    id: "drop-in",
    group: "Movimiento",
    label: "Drop in (rebote)",
    code: `const words = splitWords(el);
gsap.from(words, {
  y: -120, opacity: 0, stagger: 0.07, duration: 1, ease: "bounce.out",
  scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" }
});`,
    run(el) {
      const words = splitWords(el, el.dataset.text);
      const t = gsap.from(words, {
        y: -120, opacity: 0, stagger: 0.07, duration: 1, ease: "bounce.out",
        scrollTrigger: { trigger: el, start: "top 80%", toggleActions: TOGGLE },
      });
      return fromTween(t);
    },
  },
  {
    id: "parallax",
    group: "Movimiento",
    label: "Parallax text",
    code: `gsap.fromTo(el, { yPercent: 40 }, { yPercent: -40, ease: "none",
  scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });`,
    run(el) {
      setPlain(el, el.dataset.text);
      const t = gsap.fromTo(el,
        { yPercent: 30 },
        { yPercent: -30, ease: "none",
          scrollTrigger: { trigger: el.closest(".te-section"), start: "top bottom", end: "bottom top", scrub: true } });
      return fromTween(t);
    },
  },

  // ===================== ESCALA / 3D =====================
  {
    id: "scale-up",
    group: "Escala / 3D",
    label: "Scale up",
    code: `gsap.from(el, { scale: 0.4, opacity: 0, duration: 0.9, ease: "back.out(1.7)",
  scrollTrigger: { trigger: el, start: "top 82%", toggleActions: "play none none reverse" } });`,
    run(el) {
      setPlain(el, el.dataset.text);
      const t = gsap.from(el, {
        scale: 0.4, opacity: 0, duration: 0.9, ease: "back.out(1.7)",
        scrollTrigger: { trigger: el, start: "top 82%", toggleActions: TOGGLE },
      });
      return fromTween(t);
    },
  },
  {
    id: "zoom-out",
    group: "Escala / 3D",
    label: "Zoom out",
    code: `gsap.from(el, { scale: 2.2, opacity: 0, duration: 1, ease: "power3.out",
  scrollTrigger: { trigger: el, start: "top 82%", toggleActions: "play none none reverse" } });`,
    run(el) {
      setPlain(el, el.dataset.text);
      const t = gsap.from(el, {
        scale: 2.2, opacity: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 82%", toggleActions: TOGGLE },
      });
      return fromTween(t);
    },
  },
  {
    id: "flip",
    group: "Escala / 3D",
    label: "Flip / rotate (letras 3D)",
    code: `const chars = splitChars(el);
gsap.set(el, { perspective: 600 });
gsap.from(chars, {
  rotationX: -90, opacity: 0, transformOrigin: "50% 50% -20px", stagger: 0.04, duration: 0.7, ease: "back.out(1.7)",
  scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" } });`,
    run(el) {
      const chars = splitChars(el, el.dataset.text);
      gsap.set(el, { perspective: 600 });
      const t = gsap.from(chars, {
        rotationX: -90, opacity: 0, transformOrigin: "50% 50% -20px",
        stagger: 0.04, duration: 0.7, ease: "back.out(1.7)",
        scrollTrigger: { trigger: el, start: "top 80%", toggleActions: TOGGLE },
      });
      return fromTween(t);
    },
  },
  {
    id: "perspective",
    group: "Escala / 3D",
    label: "Perspective tilt",
    code: `gsap.set(el.parentElement, { perspective: 800 });
gsap.fromTo(el, { rotationX: 50, y: 40, opacity: 0 },
  { rotationX: 0, y: 0, opacity: 1, ease: "none",
    scrollTrigger: { trigger: el, start: "top 90%", end: "center 55%", scrub: true } });`,
    run(el) {
      setPlain(el, el.dataset.text);
      gsap.set(el.parentElement, { perspective: 800 });
      const t = gsap.fromTo(el,
        { rotationX: 50, y: 40, opacity: 0 },
        { rotationX: 0, y: 0, opacity: 1, ease: "none",
          scrollTrigger: { trigger: el, start: "top 90%", end: "center 55%", scrub: true } });
      return fromTween(t);
    },
  },

  // ===================== TIPOGRAFÍA DINÁMICA =====================
  {
    id: "variable-weight",
    group: "Tipografía dinámica",
    label: "Variable font weight",
    code: `// requiere fuente variable; el peso sigue al scroll
gsap.fromTo(el, { fontWeight: 100 }, { fontWeight: 900, ease: "none",
  scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true } });`,
    run(el) {
      setPlain(el, el.dataset.text);
      const t = gsap.fromTo(el,
        { fontWeight: 100 },
        { fontWeight: 900, ease: "none",
          scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true } });
      return fromTween(t);
    },
  },
  {
    id: "letter-spacing",
    group: "Tipografía dinámica",
    label: "Letter spacing collapse",
    code: `gsap.from(el, { letterSpacing: "0.6em", opacity: 0, duration: 1.1, ease: "power3.out",
  scrollTrigger: { trigger: el, start: "top 82%", toggleActions: "play none none reverse" } });`,
    run(el) {
      setPlain(el, el.dataset.text);
      const t = gsap.from(el, {
        letterSpacing: "0.6em", opacity: 0, duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 82%", toggleActions: TOGGLE },
      });
      return fromTween(t);
    },
  },
  {
    id: "blur",
    group: "Tipografía dinámica",
    label: "Blur to sharp",
    code: `gsap.from(el, { filter: "blur(16px)", opacity: 0, duration: 1, ease: "power2.out",
  scrollTrigger: { trigger: el, start: "top 82%", toggleActions: "play none none reverse" } });`,
    run(el) {
      setPlain(el, el.dataset.text);
      const t = gsap.fromTo(el,
        { filter: "blur(16px)", opacity: 0 },
        { filter: "blur(0px)", opacity: 1, duration: 1, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 82%", toggleActions: TOGGLE } });
      return fromTween(t);
    },
  },

  // ===================== SCRUB (vinculado al scroll) =====================
  {
    id: "scrub-words",
    group: "Scrub",
    label: "Scrubbed reveal por palabras",
    code: `// estilo Apple: el scroll ES la animación
const words = splitWords(el);
gsap.from(words, { opacity: 0.1, y: 20, stagger: 0.5, ease: "none",
  scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 45%", scrub: true } });`,
    run(el) {
      const words = splitWords(el, el.dataset.text);
      const t = gsap.from(words, {
        opacity: 0.1, y: 20, stagger: 0.5, ease: "none",
        scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 45%", scrub: true },
      });
      return fromTween(t);
    },
  },
  {
    id: "scrub-color",
    group: "Scrub",
    label: "Scrubbed color",
    code: `// el coloreado por letras sigue exactamente la rueda del scroll
const chars = splitChars(el);
gsap.fromTo(chars, { color: "var(--muted)" },
  { color: "var(--text)", stagger: 0.5, ease: "none",
    scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 45%", scrub: true } });`,
    run(el) {
      const chars = splitChars(el, el.dataset.text);
      const t = gsap.fromTo(chars,
        { color: "var(--muted)" },
        { color: "var(--text)", stagger: 0.5, ease: "none",
          scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 45%", scrub: true } });
      return fromTween(t);
    },
  },
];
