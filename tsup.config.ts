import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    auto: 'src/auto.ts',
    react: 'src/react.tsx',
    vue: 'src/vue.ts',
  },
  format: ['esm', 'cjs'],
  target: 'es2020',
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['react', 'react/jsx-runtime', 'vue'],
});
