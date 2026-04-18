import { defineComponent, h, onMounted, ref } from 'vue';
import { injectSvgFilter } from './index';

/**
 * Ice-glass container for Vue 3.
 *
 *   import { IceGlass } from 'ice-glass/vue';
 *   import 'ice-glass/style.css';
 *
 *   <IceGlass class="card">...</IceGlass>
 *
 * Vue's default `inheritAttrs` merges class / style / listeners onto the
 * root element. The root carries `data-ice-ready="1"` so the optional
 * `ice-glass/auto` runtime observer will never double-hydrate it.
 *
 * The underlying `<div class="ice-glass">` is exposed as `el` on the
 * component instance, so `iceGlassRef.value.el` returns the DOM node
 * (useful for focus, scroll, measuring, etc.).
 */
export const IceGlass = defineComponent({
  name: 'IceGlass',
  setup(_props, { slots, expose }) {
    const el = ref<HTMLDivElement | null>(null);

    onMounted(() => {
      injectSvgFilter();
    });

    expose({ el });

    return () =>
      h(
        'div',
        { class: 'ice-glass', 'data-ice-ready': '1', ref: el },
        [
          h('div', { class: 'ig-distort', 'aria-hidden': 'true' }),
          h('div', { class: 'ig-blur', 'aria-hidden': 'true' }),
          h('div', { class: 'ig-content' }, slots['default']?.()),
          h('div', { class: 'ig-edge', 'aria-hidden': 'true' }),
        ],
      );
  },
});
