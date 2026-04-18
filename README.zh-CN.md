# ice-glass

[English](./README.md) | 简体中文

[![npm version](https://img.shields.io/npm/v/ice-glass.svg?color=cb3837&logo=npm)](https://www.npmjs.com/package/ice-glass)
[![downloads](https://img.shields.io/npm/dm/ice-glass.svg?color=blue)](https://www.npmjs.com/package/ice-glass)
[![bundle size](https://img.shields.io/bundlephobia/minzip/ice-glass?label=gzip)](https://bundlephobia.com/package/ice-glass)
[![license](https://img.shields.io/npm/l/ice-glass.svg?color=brightgreen)](./LICENSE)
[![provenance](https://img.shields.io/badge/provenance-signed-7c3aed?logo=github)](https://docs.npmjs.com/generating-provenance-statements)

一个带有折射效果的 **冰晶玻璃** UI 组件 —— 由四层构成
(SVG 位移折射 → 背景模糊 → 内容层 → 边缘高光),
打包为一个精巧的库,提供 **原生 JS**、**React** 与 **Vue** 绑定。

**[在线演示 →](https://trirrin.github.io/ice-glass/)** &nbsp;•&nbsp;
**[更新日志 →](./CHANGELOG.md)**

![ice-glass 预览](./preview.png)

## 为什么要做这个

大多数"玻璃拟态(glassmorphism)"只是模糊加一层白色覆盖,看起来很廉价。
真正的磨砂玻璃会先折射背后的画面,再柔化边界,最后沿着边缘浮起一道亮线。
`ice-glass` 三件事都做了:

| 图层         | 作用                                                   | 默认值                                                              |
| ------------ | ------------------------------------------------------ | ------------------------------------------------------------------- |
| `ig-distort` | SVG 位移折射                                           | `backdrop-filter: url(#ice-lens)`(scale `50`,baseFrequency `0.012`)|
| `ig-blur`    | 磨砂 + 轻微着色                                        | `backdrop-filter: blur(12px) saturate(170%)`;`background: rgba(255,255,255,0.3)` |
| `ig-content` | 你的子节点 —— 不受任何滤镜影响                         | `position: relative; z-index: 2`                                    |
| `ig-edge`    | 经过遮罩的环形亮边,保留色相                           | `padding: 1.5px`;`backdrop-filter: saturate(1.8) contrast(1.2)`    |

兼容性:**Chrome 76+、Safari 17.4+、Edge**。Firefox 对
`backdrop-filter: url()` 支持不完整 —— 会降级为仅剩的模糊层。

### DOM 结构

水合(或渲染框架组件)之后,容器内部固定有四个兄弟节点,
**你的子节点会被塞进 `.ig-content` 里,而不是挂在根节点上**。
凡是依赖直接子选择器、flex/grid 布局或 overflow 处理的祖先样式,
都要留意这一点:

```html
<div class="ice-glass" data-ice-ready="1">
  <div class="ig-distort" aria-hidden="true"></div>
  <div class="ig-blur"    aria-hidden="true"></div>
  <div class="ig-content">
    <!-- 你的插槽 / children 会出现在这里 -->
  </div>
  <div class="ig-edge"    aria-hidden="true"></div>
</div>
```

`.ice-glass` 自身固定为 `position: relative; overflow: hidden`。
任何针对子节点的布局规则(`display: flex`、`grid-template`、`overflow: auto` 等)
都应当作用在 `.ig-content` 上,而不是 `.ice-glass` —— 详见下面的
[可滚动容器](#可滚动容器) 示例。

## 安装

```bash
npm install ice-glass
# 或: pnpm add ice-glass / yarn add ice-glass / bun add ice-glass
```

样式表单独分发,通常在整个应用里只引一次:

```ts
import 'ice-glass/style.css';
```

---

## 原生 JS

零配置,直接扔进去就能用:

```html
<link rel="stylesheet" href="node_modules/ice-glass/dist/style.css">
<script type="module">
  import 'ice-glass/auto';   // 自动注入 SVG 滤镜 + 监听 DOM
</script>

<div class="ice-glass" style="border-radius:24px; padding:24px;">
  <h2>Hello, glass.</h2>
</div>
```

> **不要在 React / Vue / Svelte 应用里使用 `ice-glass/auto`。**
> 自动运行时依靠 `MutationObserver` 把插槽 children 搬进 `.ig-content`,
> 这会和框架的虚拟 DOM 对抗,在下一次重渲染时污染 diff。
> 在框架项目里应该渲染下面的 `<IceGlass>` 组件 —— 它以声明式方式
> 产出四层结构,并在根节点上打上 `data-ice-ready="1"`,所以就算同时加载了
> `ice-glass/auto`,auto 运行时也会跳过它。

需要更精细的控制?引入核心 API 即可:

```ts
import { observe, hydrate, injectSvgFilter } from 'ice-glass';

// 一步到位: 注入滤镜 + 水合已有节点 + 监听新节点
const dispose = observe();

// 或手动
injectSvgFilter();
hydrate(document.querySelector('.my-card')!);

// 之后
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

标准的 `div` 属性、`ref`、事件处理等都支持。

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

也可以全局注册:

```ts
import { createApp } from 'vue';
import { IceGlass } from 'ice-glass/vue';

createApp(App).component('IceGlass', IceGlass).mount('#app');
```

在 `<IceGlass>` 上挂 `ref` 拿到的是 **组件实例**,而不是根 `<div>`。
底层 DOM 元素通过 `el` 字段暴露:

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IceGlass } from 'ice-glass/vue';

const card = ref<{ el: HTMLDivElement | null } | null>(null);

onMounted(() => {
  // 比如测量尺寸、设置 focus,或者再深入到 .ig-content
  const rect = card.value?.el?.getBoundingClientRect();
  console.log('card size:', rect?.width, rect?.height);
});
</script>

<template>
  <IceGlass ref="card" class="card">…</IceGlass>
</template>
```

React 绑定用的是 `forwardRef`,所以 `<IceGlass>` 上的 `ref` 已经直接指向
根 `<div>`,无需多绕一层。

---

## 自定义样式

四层结构都响应普通 CSS,可以自由覆盖。

```css
/* 更透明 / 模糊更弱 */
.my-card.ice-glass > .ig-blur {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(6px);
}

/* 更强的折射 —— 调整位移强度 */
/* (覆写滤镜定义,或用新 id 复制一份 #ice-lens) */

/* 更饱和的边缘 —— 在不偏色的前提下拉高饱和 + 对比 */
.my-card.ice-glass > .ig-edge {
  backdrop-filter: saturate(2.2) contrast(1.3);
}
```

外层元素上设置的圆角会通过 `border-radius: inherit` 传给每一层内层,
所以只需要设一次。

### 可滚动容器

`.ice-glass` 有 `overflow: hidden`,这是为了让模糊层和边缘层能被干净地遮罩 ——
所以直接在 `.ice-glass` 上设 `overflow: auto` 是没用的。
把滚动容器的职责下放到 `.ig-content` 上即可:

```css
.scroll-card.ice-glass > .ig-content {
  overflow: auto;
  max-height: 320px;
}
```

同样的思路适用于所有你想赋予子节点的布局角色 —— `display: flex`、
`display: grid`、给滚动条留出 `padding-right` 等等。
记住:样式写在 `.ig-content` 上,不要写在 `.ice-glass` 上。

---

## 已知限制

- **亮色背景下的边缘亮度。** 早期版本在 `.ig-edge` 上用的是
  `brightness(> 1)`。在本身就很亮的画面上(浅色渐变、白色页面),
  乘法会把每个通道都钳在 1,结果就是边缘变成一条和背景融为一体的纯白,
  高光彻底消失。从 `0.1.1` 起改为 `saturate(1.8) contrast(1.2)`,
  放大背景既有色相而不触发通道裁剪,任何底色下边缘都能看见。
  **代价**:在对比很低 / 饱和度很低的背景上(例如浅灰铺白),
  现在的边缘比纯亮度方案要更低调。如果需要另一种平衡,
  可以按 [自定义样式](#自定义样式) 覆写 `.ig-edge` 的 `backdrop-filter`。
- **Firefox。** `backdrop-filter: url(#ice-lens)` 支持不完整,
  折射会降级为仅剩的模糊层。组件整体仍然能呈现出合理的玻璃感。
- **Safari < 17.4。** 边缘环形依赖 `mask-composite: exclude`,样式表里
  已经提供了 `-webkit-mask-composite: xor` 回退;在更老的 Safari 上,
  环形可能会渲染成一块实心色。

---

## API 参考

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
// 组件 expose 了 { el: Ref<HTMLDivElement | null> },方便直接访问 DOM。
export const IceGlass: import('vue').DefineComponent<{}, () => VNode, ...>;
```

所有 API 都对 SSR 友好:`document` 未定义时会静默 no-op,
框架组件把滤镜注入延后到 `useEffect` / `onMounted`。

---

## 开发

```bash
git clone https://github.com/Trirrin/ice-glass.git
cd ice-glass
npm install
npm run build       # tsup → dist/
npm run typecheck
```

直接用浏览器打开 `index.html` 就能看到独立的演示 —— 纯 HTML + CSS + JS,
不需要构建步骤。

## 许可证

MIT © 2026 [Trirrin](https://github.com/Trirrin)
