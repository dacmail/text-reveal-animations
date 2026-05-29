# Text Reveal Animations

Librería/escaparate de **efectos de aparición de texto vinculados al scroll**, hechos con [GSAP](https://gsap.com/) + [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/). Escribe tu propio texto, elige fuente de Google Fonts, peso y tamaño, y haz scroll para ver cómo aparece y desaparece en 24 efectos distintos.

🔗 **Demo:** https://dacmail.github.io/text-reveal-animations/

## Características

- **44 efectos** agrupados: visibilidad, máscara/clip, color, movimiento/física, escala/3D, tipografía/glitch, y scrub vinculado al scroll (incluye scramble, typewriter, glitch, odometer, neon, gradient, arc/curve, pin+reveal, horizontal scroll, etc.).
- Entrada de **texto propio** (límite de caracteres configurable).
- Selector de **fuente** (Google Fonts curadas, incluyendo fuentes variables), **peso** y **tamaño**.
- **Dark / light mode** (persistido, respeta la preferencia del sistema).
- **Scroll suave** con [Lenis](https://github.com/darkroomengineering/lenis).
- Estética minimalista, tipografía monospace en mayúsculas.
- Cada efecto muestra su **snippet de código** GSAP.

## Stack

HTML + CSS + JavaScript (módulos ES), sin paso de build. GSAP, ScrollTrigger y Lenis se cargan por CDN.

> Nota: se usa un *split* de palabras/letras propio (no el plugin de pago SplitText).

## Desarrollo local

Al usar módulos ES, sírvelo con un servidor estático (no abras `index.html` con `file://`):

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

## Publicar en GitHub Pages

1. Sube el contenido a la rama `main`.
2. En **Settings → Pages**, elige *Deploy from a branch* → `main` → `/ (root)`.
3. El archivo `.nojekyll` evita que Jekyll interfiera con la carpeta `js/`.

## Estructura

```
index.html        Marcado: panel de controles + secciones
styles.css        Tema (dark/light), layout minimalista
js/
  config.js       Lista de fuentes y constantes
  fonts.js        Carga dinámica de Google Fonts
  controls.js     Panel de controles + tema
  effects.js      Definición de los 24 efectos (GSAP/ScrollTrigger)
  main.js         Init Lenis + GSAP, render y re-render
```

## Añadir un efecto

Añade una entrada al array `EFFECTS` en [`js/effects.js`](js/effects.js):

```js
{
  id: "mi-efecto",
  group: "Movimiento",
  label: "Mi efecto",
  code: `/* snippet mostrado en la UI */`,
  run(el) {
    // el.dataset.text contiene el texto del usuario
    const t = gsap.from(el, { /* ... */ scrollTrigger: { trigger: el, start: "top 80%" } });
    return () => { t.scrollTrigger?.kill(); t.kill(); }; // cleanup
  },
}
```
