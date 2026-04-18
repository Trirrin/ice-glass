# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/) loosely, and the project
adheres to [Semantic Versioning](https://semver.org/).

## 0.1.2 — 2026-04-19

### Added

- **Vue component exposes the root `<div>` as `el`.** `cardRef.value.el`
  now returns `HTMLDivElement | null` — the React binding already
  exposed the element via `forwardRef`.
- **Publish provenance.** Releases are built and signed on GitHub
  Actions via OIDC, so npmjs.com displays a "Built and signed on
  GitHub Actions" attestation on the package page.
- **Simplified Chinese README** (`README.zh-CN.md`) linked from the
  English README.
- **CHANGELOG.md** (this file) linked from both READMEs.
- README: DOM-output section, per-layer default values, `Scrollable
  surfaces` recipe, `Known limitations` section (edge brightness
  tradeoff, Firefox, old Safari), and a warning against using
  `ice-glass/auto` inside framework apps.

### Changed

- `package.json`: shorter `description` (so npmjs.com stops
  truncating), extended `keywords` (`frosted-glass`, `css-filter`,
  `zero-deps`), declared `engines.node >=18`, and dropped `src/`
  from `files` — only `dist/`, READMEs, CHANGELOG, and LICENSE
  ship now.

## 0.1.1 — 2026-04-19

### Fixed

- **Edge hue preservation on bright backgrounds.** The `.ig-edge` layer
  previously used `backdrop-filter: brightness(1.5)`. On already-bright
  surfaces (light gradients, white pages) the multiplier clipped every
  channel to 1, producing a flat white rim that was visually
  indistinguishable from the background — the highlight disappeared
  entirely.
  Replaced with `backdrop-filter: saturate(1.8) contrast(1.2)`, which
  amplifies the surrounding hue without channel clipping, so the rim
  stays visible on any backdrop.
  **Tradeoff:** on very low-contrast / desaturated backgrounds the rim
  is now subtler than a pure-brightness boost would be. Override
  `.ig-edge`'s `backdrop-filter` per-component if you want a different
  balance.

## 0.1.0 — Initial release

- Four-layer ice-glass composition (`ig-distort` / `ig-blur` /
  `ig-content` / `ig-edge`) driven by an SVG displacement filter and
  `backdrop-filter`.
- Vanilla API (`injectSvgFilter` / `hydrate` / `scan` / `observe`) plus
  the `ice-glass/auto` side-effect entry.
- React binding (`ice-glass/react`) with `forwardRef` support.
- Vue 3 binding (`ice-glass/vue`).
