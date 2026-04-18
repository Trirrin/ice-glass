# ice-glass

A refractive **ice-glass** UI effect — a four-layer composition
(SVG displacement refraction → backdrop blur → content → edge highlight)
packaged as a tiny library with **vanilla**, **React** and **Vue** bindings.

**[Live demo →](https://trirrin.github.io/ice-glass/)**

![ice-glass preview](./preview.png)

## Why

Most "glassmorphism" is a blur plus a white overlay. It looks cheap. Real
frosted glass refracts whatever sits behind it, then softens it, then lifts
a bright line along the edge. `ice-glass` does all three:

| Layer        | What it does                                            |
| ------------ | ------------------------------------------------------- |
| `ig-distort` | `backdrop-filter: url(#ice-lens)` — SVG displacement    |
| `ig-blur`    | `backdrop-filter: blur(12px) saturate(170%)` + tint     |
| `ig-content` | Your children — unaffected by any filter                |
| `ig-edge`    | Masked ring with `brightness(1.5)` — the refraction rim |

Compatibility: **Chrome 76+, Safari 17.4+, Edge**. Firefox has partial
support for `backdrop-filter: url()` — it degrades to the plain blur layer.

## Install

```bash
npm install ice-glass
# or: pnpm add ice-glass / yarn add ice-glass / bun add ice-glass
```

The stylesheet is shipped separately so you can load it once per app:

```ts
import 'ice-glass/style.css';
```

---

## Vanilla JS

Zero setup, drop-in:

```html
<link rel="stylesheet" href="node_modules/ice-glass/dist/style.css">
<script type="module">
  import 'ice-glass/auto';   // auto-injects SVG filter + observes the DOM
</script>

<div class="ice-glass" style="border-radius:24px; padding:24px;">
  <h2>Hello, glass.</h2>
</div>
```

Need explicit control? Import the core API instead:

```ts
import { observe, hydrate, injectSvgFilter } from 'ice-glass';

// One-liner: inject filter + hydrate existing nodes + watch future ones
const dispose = observe();

// Or do it manually
injectSvgFilter();
hydrate(document.querySelector('.my-card')!);

// Later
dispose();
```

## React

```tsx
import { IceGlass } from 'ice-glass/react';
import 'ice-glass/style.css';

export function Card() {
  return (
    <IceGlass className="card" style={{ borderRadius: 24, padding: 24 }}>
      <h2>Hello, glass.</h2>
    </IceGlass>
  );
}
```

Works with any standard `div` attribute, `ref`, event handlers, etc.

## Vue 3

```vue
<script setup>
import { IceGlass } from 'ice-glass/vue';
import 'ice-glass/style.css';
</script>

<template>
  <IceGlass class="card" :style="{ borderRadius: '24px', padding: '24px' }">
    <h2>Hello, glass.</h2>
  </IceGlass>
</template>
```

Or register it globally:

```ts
import { createApp } from 'vue';
import { IceGlass } from 'ice-glass/vue';

createApp(App).component('IceGlass', IceGlass).mount('#app');
```

---

## Customization

The four layers respond to normal CSS, so override freely.

```css
/* More transparent / less frosted */
.my-card.ice-glass > .ig-blur {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(6px);
}

/* Stronger refraction — tweak the displacement scale */
/* (override the filter definition or duplicate #ice-lens with a new id) */

/* Brighter rim */
.my-card.ice-glass > .ig-edge {
  backdrop-filter: brightness(2) saturate(1.4);
}
```

A rounded corner on the outer element is inherited by every inner layer
via `border-radius: inherit`, so you only set it once.

---

## API reference

```ts
// ice-glass
export function injectSvgFilter(): void;
export function hydrate(el: HTMLElement): void;
export function scan(root: ParentNode): void;
export function observe(options?: { root?: Node }): () => void;
export const SVG_HOST_ID: string;
export const FILTER_ID: string;

// ice-glass/react
export const IceGlass: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
>;

// ice-glass/vue
export const IceGlass: import('vue').DefineComponent<{}, () => VNode, ...>;
```

All APIs are SSR-safe: they no-op when `document` is undefined, and the
framework components defer injection to `useEffect` / `onMounted`.

---

## Development

```bash
git clone https://github.com/Trirrin/ice-glass.git
cd ice-glass
npm install
npm run build       # tsup → dist/
npm run typecheck
```

Open `index.html` in a browser to see the standalone demo. No build step
needed for the demo — it is pure HTML + CSS + JS.

## License

MIT © 2026 [Trirrin](https://github.com/Trirrin)
