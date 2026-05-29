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
    code: `// dos capas a distinta velocidad = sensación de profundidad
const stage = el.closest(".te-stage");
const bg = document.createElement("div"); // texto de fondo grande y tenue
bg.className = "te-parallax-bg"; bg.textContent = el.dataset.text;
stage.appendChild(bg);
gsap.fromTo(el, { yPercent: 60 }, { yPercent: -60, ease: "none",
  scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: true } });
gsap.fromTo(bg, { yPercent: -40 }, { yPercent: 40, ease: "none",
  scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: true } });`,
    run(el) {
      setPlain(el, el.dataset.text);
      const section = el.closest(".te-section");

      // Capa de fondo: misma palabra, grande y tenue, que se mueve al revés.
      const stage = el.closest(".te-stage");
      stage.classList.add("te-parallax-stage");
      const bg = document.createElement("div");
      bg.className = "te-parallax-bg";
      bg.textContent = el.dataset.text;
      bg.style.fontFamily = el.style.fontFamily;
      bg.style.fontSize = `${parseFloat(el.style.fontSize || 64) * 1.8}px`;
      stage.appendChild(bg);

      // Primer plano y fondo se mueven a distinta velocidad y sentido.
      const tFront = gsap.fromTo(el,
        { yPercent: 60 },
        { yPercent: -60, ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true } });
      const tBack = gsap.fromTo(bg,
        { yPercent: -40 },
        { yPercent: 40, ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true } });

      return () => { fromTween(tFront)(); fromTween(tBack)(); bg.remove(); stage.classList.remove("te-parallax-stage"); };
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

  // ===================== MÁSCARA / CLIP (nuevos) =====================
  {
    id: "iris",
    group: "Máscara / Clip",
    label: "Iris / circle reveal",
    code: `gsap.fromTo(el, { clipPath: "circle(0% at 50% 50%)" },
  { clipPath: "circle(75% at 50% 50%)", duration: 1, ease: "power2.out",
    scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" } });`,
    run(el) {
      setPlain(el, el.dataset.text);
      const t = gsap.fromTo(el,
        { clipPath: "circle(0% at 50% 50%)" },
        { clipPath: "circle(75% at 50% 50%)", duration: 1, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 80%", toggleActions: TOGGLE } });
      return fromTween(t);
    },
  },
  {
    id: "diagonal-wipe",
    group: "Máscara / Clip",
    label: "Diagonal wipe",
    code: `gsap.fromTo(el, { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" },
  { clipPath: "polygon(0 0, 130% 0, 100% 100%, 0 100%)", duration: 1, ease: "power3.inOut",
    scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" } });`,
    run(el) {
      setPlain(el, el.dataset.text);
      const t = gsap.fromTo(el,
        { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" },
        { clipPath: "polygon(0 0, 130% 0, 100% 100%, 0 100%)", duration: 1, ease: "power3.inOut",
          scrollTrigger: { trigger: el, start: "top 80%", toggleActions: TOGGLE } });
      return fromTween(t);
    },
  },
  {
    id: "block-reveal",
    group: "Máscara / Clip",
    label: "Block reveal",
    code: `// una barra de color cruza y deja el texto detrás
const bar = document.createElement("span"); bar.className = "te-block-bar";
el.parentElement.appendChild(bar);
gsap.set(el, { opacity: 0 });
const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" } });
tl.fromTo(bar, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.4, ease: "power2.in" })
  .set(el, { opacity: 1 })
  .to(bar, { scaleX: 0, transformOrigin: "right center", duration: 0.4, ease: "power2.out" });`,
    run(el) {
      setPlain(el, el.dataset.text);
      const wrap = el.parentElement;
      wrap.style.position = "relative";
      const bar = document.createElement("span");
      bar.className = "te-block-bar";
      wrap.appendChild(bar);
      gsap.set(el, { opacity: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 80%", toggleActions: TOGGLE } });
      tl.fromTo(bar, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.4, ease: "power2.in" })
        .set(el, { opacity: 1 })
        .to(bar, { scaleX: 0, transformOrigin: "right center", duration: 0.4, ease: "power2.out" });
      return () => { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); bar.remove(); gsap.set(el, { opacity: 1 }); };
    },
  },
  {
    id: "split-reveal",
    group: "Máscara / Clip",
    label: "Split reveal (centro)",
    code: `gsap.fromTo(el, { clipPath: "inset(0 50% 0 50%)" },
  { clipPath: "inset(0 0% 0 0%)", duration: 0.9, ease: "power3.out",
    scrollTrigger: { trigger: el, start: "top 82%", toggleActions: "play none none reverse" } });`,
    run(el) {
      setPlain(el, el.dataset.text);
      const t = gsap.fromTo(el,
        { clipPath: "inset(0 50% 0 50%)" },
        { clipPath: "inset(0 0% 0 0%)", duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 82%", toggleActions: TOGGLE } });
      return fromTween(t);
    },
  },

  // ===================== MOVIMIENTO / FÍSICA (nuevos) =====================
  {
    id: "elastic-in",
    group: "Movimiento",
    label: "Elastic in",
    code: `gsap.from(el, { y: 90, opacity: 0, duration: 1.2, ease: "elastic.out(1, 0.4)",
  scrollTrigger: { trigger: el, start: "top 82%", toggleActions: "play none none reverse" } });`,
    run(el) {
      setPlain(el, el.dataset.text);
      const t = gsap.from(el, {
        y: 90, opacity: 0, duration: 1.2, ease: "elastic.out(1, 0.4)",
        scrollTrigger: { trigger: el, start: "top 82%", toggleActions: TOGGLE },
      });
      return fromTween(t);
    },
  },
  {
    id: "skew-slide",
    group: "Movimiento",
    label: "Skew slide",
    code: `const words = splitWords(el);
gsap.from(words, { x: -70, skewX: 18, opacity: 0, stagger: 0.06, duration: 0.7, ease: "power3.out",
  scrollTrigger: { trigger: el, start: "top 82%", toggleActions: "play none none reverse" } });`,
    run(el) {
      const words = splitWords(el, el.dataset.text);
      const t = gsap.from(words, {
        x: -70, skewX: 18, opacity: 0, stagger: 0.06, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 82%", toggleActions: TOGGLE },
      });
      return fromTween(t);
    },
  },
  {
    id: "scatter",
    group: "Movimiento",
    label: "Stagger desde posiciones aleatorias",
    code: `const chars = splitChars(el);
gsap.from(chars, {
  x: () => gsap.utils.random(-220, 220), y: () => gsap.utils.random(-160, 160),
  rotation: () => gsap.utils.random(-90, 90), opacity: 0, stagger: 0.02, duration: 0.9, ease: "power3.out",
  scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" } });`,
    run(el) {
      const chars = splitChars(el, el.dataset.text);
      const t = gsap.from(chars, {
        x: () => gsap.utils.random(-220, 220), y: () => gsap.utils.random(-160, 160),
        rotation: () => gsap.utils.random(-90, 90), opacity: 0, stagger: 0.02, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 80%", toggleActions: TOGGLE },
      });
      return fromTween(t);
    },
  },
  {
    id: "wave",
    group: "Movimiento",
    label: "Wave / onda",
    code: `// onda viajera por las letras vinculada al scroll
const chars = splitChars(el);
gsap.to(chars, { y: -28, ease: "sine.inOut",
  stagger: { each: 0.06, from: "start", yoyo: true, repeat: 1 },
  scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 40%", scrub: true } });`,
    run(el) {
      const chars = splitChars(el, el.dataset.text);
      const t = gsap.to(chars, {
        y: -28, ease: "sine.inOut",
        stagger: { each: 0.06, from: "start", yoyo: true, repeat: 1 },
        scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 40%", scrub: true },
      });
      return fromTween(t);
    },
  },

  // ===================== TIPOGRAFÍA / GLITCH (nuevos) =====================
  {
    id: "scramble",
    group: "Tipografía / Glitch",
    label: "Scramble / decode",
    code: `// las letras pasan por glifos aleatorios hasta "decodificar"
const chars = splitChars(el);
const targets = chars.map(c => c.textContent);
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%&*";
// en onEnter, un rAF va fijando cada letra de forma escalonada`,
    run(el) {
      const chars = splitChars(el, el.dataset.text);
      const targets = chars.map((c) => c.textContent);
      const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%&*";
      const PER = 45, LOCK = 220;
      let raf, start;
      const frame = (now) => {
        const t = now - start;
        let pending = false;
        chars.forEach((c, i) => {
          const lockAt = i * PER + 200;
          if (t >= lockAt) { c.textContent = targets[i]; }
          else { pending = true; c.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]; }
        });
        if (pending || performance.now() - start < chars.length * PER + LOCK) raf = requestAnimationFrame(frame);
      };
      const begin = () => { cancelAnimationFrame(raf); start = performance.now(); raf = requestAnimationFrame(frame); };
      const reset = () => { cancelAnimationFrame(raf); chars.forEach((c, i) => { c.textContent = targets[i]; }); };
      const st = ScrollTrigger.create({ trigger: el, start: "top 80%", onEnter: begin, onEnterBack: begin, onLeave: reset });
      return () => { st.kill(); cancelAnimationFrame(raf); };
    },
  },
  {
    id: "typewriter",
    group: "Tipografía / Glitch",
    label: "Typewriter",
    code: `const chars = splitChars(el);
el.classList.add("te-typewriter"); // cursor parpadeante via CSS
gsap.set(chars, { opacity: 0 });
gsap.to(chars, { opacity: 1, duration: 0.01, stagger: 0.07, ease: "none",
  scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" } });`,
    run(el) {
      const chars = splitChars(el, el.dataset.text);
      el.classList.add("te-typewriter");
      gsap.set(chars, { opacity: 0 });
      const t = gsap.to(chars, {
        opacity: 1, duration: 0.01, stagger: 0.07, ease: "none",
        scrollTrigger: { trigger: el, start: "top 80%", toggleActions: TOGGLE },
      });
      return () => { fromTween(t)(); el.classList.remove("te-typewriter"); };
    },
  },
  {
    id: "glitch",
    group: "Tipografía / Glitch",
    label: "Glitch / RGB split",
    code: `// la clase .te-glitch (CSS) aplica la distorsión mientras está en viewport
ScrollTrigger.create({ trigger: el, start: "top 85%", end: "bottom 15%",
  toggleClass: { targets: el, className: "te-glitch" } });`,
    run(el) {
      setPlain(el, el.dataset.text);
      const st = ScrollTrigger.create({
        trigger: el, start: "top 85%", end: "bottom 15%",
        toggleClass: { targets: el, className: "te-glitch" },
      });
      return () => { st.kill(); el.classList.remove("te-glitch"); };
    },
  },
  {
    id: "odometer",
    group: "Tipografía / Glitch",
    label: "Counter / odometer",
    code: `// cada carácter rueda verticalmente (tipo cuentakilómetros) hasta el final
// se construye una columna de glifos por carácter y se desplaza con translateY`,
    run(el) {
      const text = el.dataset.text;
      el.innerHTML = "";
      const cols = [];
      const N = 8;
      for (const ch of text) {
        if (/\s/.test(ch)) { el.appendChild(document.createTextNode(ch)); continue; }
        const slot = document.createElement("span");
        slot.className = "te-slot";
        const col = document.createElement("span");
        col.className = "te-slot-col";
        const isDigit = /\d/.test(ch);
        for (let i = 0; i < N; i++) {
          const g = document.createElement("span");
          g.textContent = isDigit
            ? String(Math.floor(Math.random() * 10))
            : String.fromCharCode(65 + Math.floor(Math.random() * 26));
          col.appendChild(g);
        }
        const fin = document.createElement("span");
        fin.textContent = ch;
        col.appendChild(fin);
        slot.appendChild(col);
        el.appendChild(slot);
        cols.push(col);
      }
      const endPct = -(N / (N + 1)) * 100;
      const t = gsap.fromTo(cols,
        { yPercent: 0 },
        { yPercent: endPct, duration: 1.1, ease: "power3.out", stagger: 0.06,
          scrollTrigger: { trigger: el, start: "top 80%", toggleActions: TOGGLE } });
      return () => { fromTween(t)(); el.innerHTML = ""; el.textContent = el.dataset.text; };
    },
  },

  // ===================== COLOR / ESTILO (nuevos) =====================
  {
    id: "gradient",
    group: "Color / Tipografía",
    label: "Gradient text animado",
    code: `// gradiente multicolor que se desplaza de forma continua (CSS)
el.classList.add("te-gradient");`,
    run(el) {
      setPlain(el, el.dataset.text);
      el.classList.add("te-gradient");
      const st = ScrollTrigger.create({
        trigger: el, start: "top 85%", end: "bottom 15%",
        onEnter: () => el.classList.add("te-playing"),
        onLeave: () => el.classList.remove("te-playing"),
        onEnterBack: () => el.classList.add("te-playing"),
        onLeaveBack: () => el.classList.remove("te-playing"),
      });
      return () => { st.kill(); el.classList.remove("te-gradient", "te-playing"); };
    },
  },
  {
    id: "outline-fill",
    group: "Color / Tipografía",
    label: "Outline → fill",
    code: `// el texto empieza con contorno y se rellena de abajo a arriba con el scroll
el.classList.add("te-outline");
gsap.fromTo(el, { "--fill": "0%" }, { "--fill": "100%", ease: "none",
  scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true } });`,
    run(el) {
      setPlain(el, el.dataset.text);
      el.classList.add("te-outline");
      const t = gsap.fromTo(el,
        { "--fill": "0%" },
        { "--fill": "100%", ease: "none",
          scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true } });
      return () => { fromTween(t)(); el.classList.remove("te-outline"); };
    },
  },
  {
    id: "neon",
    group: "Color / Tipografía",
    label: "Neon flicker",
    code: `// encendido tipo letrero de neón con parpadeo (CSS)
ScrollTrigger.create({ trigger: el, start: "top 85%", end: "bottom 15%",
  toggleClass: { targets: el, className: "te-neon" } });`,
    run(el) {
      setPlain(el, el.dataset.text);
      const st = ScrollTrigger.create({
        trigger: el, start: "top 85%", end: "bottom 15%",
        toggleClass: { targets: el, className: "te-neon" },
      });
      return () => { st.kill(); el.classList.remove("te-neon"); };
    },
  },

  // ===================== 3D / PROFUNDIDAD (nuevos) =====================
  {
    id: "rotate-block",
    group: "Escala / 3D",
    label: "3D rotate del bloque",
    code: `gsap.set(el.parentElement, { perspective: 900 });
gsap.from(el, { rotationY: 90, opacity: 0, transformOrigin: "left center", duration: 1, ease: "power3.out",
  scrollTrigger: { trigger: el, start: "top 82%", toggleActions: "play none none reverse" } });`,
    run(el) {
      setPlain(el, el.dataset.text);
      gsap.set(el.parentElement, { perspective: 900 });
      const t = gsap.from(el, {
        rotationY: 90, opacity: 0, transformOrigin: "left center", duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 82%", toggleActions: TOGGLE },
      });
      return () => { fromTween(t)(); el.parentElement.style.perspective = ""; };
    },
  },
  {
    id: "depth-stack",
    group: "Escala / 3D",
    label: "Depth stack (extrusión)",
    code: `// extrusión 3D con capas (CSS) + ligera rotación vinculada al scroll
el.classList.add("te-depth");
gsap.set(el.parentElement, { perspective: 900 });
gsap.fromTo(el, { rotationY: 28 }, { rotationY: -28, ease: "none",
  scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 40%", scrub: true } });`,
    run(el) {
      setPlain(el, el.dataset.text);
      el.classList.add("te-depth");
      gsap.set(el.parentElement, { perspective: 900 });
      const t = gsap.fromTo(el,
        { rotationY: 28 },
        { rotationY: -28, ease: "none",
          scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 40%", scrub: true } });
      return () => { fromTween(t)(); el.classList.remove("te-depth"); el.parentElement.style.perspective = ""; };
    },
  },
  {
    id: "arc",
    group: "Escala / 3D",
    label: "Curve / arc text",
    code: `// el texto se dispone sobre una curva (SVG textPath) y entra con el scroll
// se genera un <svg> con un <path> en arco y un <textPath> centrado`,
    run(el) {
      const text = el.dataset.text;
      const size = parseFloat(el.style.fontSize || 64);
      el.innerHTML = "";
      const NS = "http://www.w3.org/2000/svg";
      const W = 1000, H = 360;
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg.setAttribute("width", "100%");
      svg.style.overflow = "visible";
      const defs = document.createElementNS(NS, "defs");
      const path = document.createElementNS(NS, "path");
      const pid = "arc-" + Math.random().toString(36).slice(2);
      path.setAttribute("id", pid);
      path.setAttribute("fill", "none");
      path.setAttribute("d", `M 60 ${H - 70} Q ${W / 2} 40 ${W - 60} ${H - 70}`);
      defs.appendChild(path);
      svg.appendChild(defs);
      const t = document.createElementNS(NS, "text");
      t.setAttribute("fill", "currentColor");
      t.setAttribute("font-size", String(size));
      t.style.fontFamily = el.style.fontFamily;
      t.style.fontWeight = el.style.fontWeight;
      const tp = document.createElementNS(NS, "textPath");
      tp.setAttribute("href", "#" + pid);
      tp.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + pid);
      tp.setAttribute("startOffset", "50%");
      tp.setAttribute("text-anchor", "middle");
      tp.textContent = text;
      t.appendChild(tp);
      svg.appendChild(t);
      el.appendChild(svg);
      const tw = gsap.fromTo(tp,
        { attr: { startOffset: "0%" }, opacity: 0 },
        { attr: { startOffset: "50%" }, opacity: 1, ease: "none",
          scrollTrigger: { trigger: el, start: "top 80%", end: "center 55%", scrub: true } });
      return () => { fromTween(tw)(); el.innerHTML = ""; el.textContent = el.dataset.text; };
    },
  },

  // ===================== SCRUB AVANZADOS (nuevos) =====================
  {
    id: "pin-reveal",
    group: "Scrub",
    label: "Pin + reveal",
    code: `// la sección se fija y el texto se revela por palabras mientras está pinneada
const section = el.closest(".te-section");
const words = splitWords(el);
gsap.set(words, { opacity: 0.12 });
gsap.to(words, { opacity: 1, stagger: 0.4, ease: "none",
  scrollTrigger: { trigger: section, start: "top top", end: "+=120%", scrub: true, pin: true } });`,
    run(el) {
      const section = el.closest(".te-section");
      const words = splitWords(el, el.dataset.text);
      gsap.set(words, { opacity: 0.12 });
      const t = gsap.to(words, {
        opacity: 1, stagger: 0.4, ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: "+=120%", scrub: true, pin: true, pinSpacing: true },
      });
      return () => { if (t.scrollTrigger) t.scrollTrigger.kill(); t.kill(); };
    },
  },
  {
    id: "horizontal",
    group: "Scrub",
    label: "Horizontal scroll",
    code: `// el texto se desplaza horizontalmente al hacer scroll vertical
el.style.whiteSpace = "nowrap";
gsap.fromTo(el, { xPercent: 60 }, { xPercent: -60, ease: "none",
  scrollTrigger: { trigger: el.closest(".te-section"), start: "top bottom", end: "bottom top", scrub: true } });`,
    run(el) {
      setPlain(el, el.dataset.text);
      el.style.whiteSpace = "nowrap";
      const t = gsap.fromTo(el,
        { xPercent: 60 },
        { xPercent: -60, ease: "none",
          scrollTrigger: { trigger: el.closest(".te-section"), start: "top bottom", end: "bottom top", scrub: true } });
      return () => { fromTween(t)(); el.style.whiteSpace = ""; };
    },
  },
];
