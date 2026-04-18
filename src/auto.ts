/**
 * `ice-glass/auto` — side-effect entry.
 *
 * Importing this module once automatically injects the SVG filter and starts
 * the MutationObserver, so any element with class="ice-glass" works out of
 * the box. For explicit control, import from `ice-glass` instead.
 */

import { observe } from './index';

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      observe();
    });
  } else {
    observe();
  }
}
