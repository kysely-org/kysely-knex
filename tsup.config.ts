import {defineConfig} from 'tsup'

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    index: 'src/index.ts',
    migrations: 'src/migrations/index.ts',
  },
  format: ['cjs', 'esm'],
  outDir: 'dist',
  sourcemap: true,
})
