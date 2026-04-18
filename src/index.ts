/**
 * ice-glass core — framework-agnostic API.
 *
 * Public surface:
 *   - injectSvgFilter()  Inject the <svg id="ice-glass-svg"> filter once per document.
 *   - hydrate(el)        Turn an element into a four-layer ice-glass wrapper.
 *   - scan(root)         Hydrate every .ice-glass inside `root` (including `root`).
 *   - observe(options?)  Inject + scan document.body + watch future mutations.
 *
 * All functions are SSR-safe: they no-op when `document` is undefined.
 * The observer watches `childList`/`subtree` only — toggling the
 * `ice-glass` class on an existing element will not trigger hydration.
 */

export const SVG_HOST_ID = 'ice-glass-svg';
export const FILTER_ID = 'ice-lens';

const SVG_MARKUP = `<svg id="${SVG_HOST_ID}" style="position:absolute;width:0;height:0" aria-hidden="true"><defs><filter id="${FILTER_ID}" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="7" result="noise"/><feGaussianBlur in="noise" stdDeviation="2" result="smoothNoise"/><feDisplacementMap in="SourceGraphic" in2="smoothNoise" scale="50" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg>`;

export function injectSvgFilter(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(SVG_HOST_ID)) return;
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', injectSvgFilter, { once: true });
    return;
  }
  const tpl = document.createElement('template');
  tpl.innerHTML = SVG_MARKUP;
  const svg = tpl.content.firstChild;
  if (svg) document.body.appendChild(svg);
}

export function hydrate(el: HTMLElement): void {
  if (el.dataset['iceReady'] === '1') return;
  el.dataset['iceReady'] = '1';

  const doc = el.ownerDocument;
  const content = doc.createElement('div');
  content.className = 'ig-content';
  while (el.firstChild) content.appendChild(el.firstChild);

  const distort = buildLayer(doc, 'ig-distort');
  const blur = buildLayer(doc, 'ig-blur');
  const edge = buildLayer(doc, 'ig-edge');

  el.append(distort, blur, content, edge);
}

function buildLayer(doc: Document, cls: string): HTMLDivElement {
  const d = doc.createElement('div');
  d.className = cls;
  d.setAttribute('aria-hidden', 'true');
  return d;
}

export function scan(root: ParentNode): void {
  const rootEl = root as Element;
  if (rootEl.classList?.contains('ice-glass')) {
    hydrate(rootEl as HTMLElement);
  }
  rootEl.querySelectorAll?.('.ice-glass').forEach((node) => {
    hydrate(node as HTMLElement);
  });
}

export interface ObserveOptions {
  /** Root to observe. Defaults to document.documentElement. */
  root?: Node;
}

/**
 * One-call setup: inject SVG filter, hydrate every existing `.ice-glass`,
 * then watch `root` (default: `document.documentElement`) so dynamically
 * added elements are hydrated too.
 *
 * Calling `observe()` multiple times installs multiple independent
 * observers — each returned dispose only stops the observer it created.
 *
 * @returns a dispose function that stops this observer.
 */
export function observe(options: ObserveOptions = {}): () => void {
  if (typeof document === 'undefined') return noop;

  injectSvgFilter();
  if (document.body) scan(document.body);

  const target = options.root ?? document.documentElement;
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((n) => {
        if (n.nodeType === 1) scan(n as Element);
      });
    }
  });
  mo.observe(target, { childList: true, subtree: true });

  return () => {
    mo.disconnect();
  };
}

function noop(): void {
  /* no-op */
}
