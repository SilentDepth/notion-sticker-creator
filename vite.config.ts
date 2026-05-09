import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import icons from 'unplugin-icons/vite'
import { unwasm } from 'unwasm/plugin'
import { defineConfig } from 'vite-plus'

const useWasmEsmImport = process.env.NODE_ENV !== 'development'
const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true'

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  fmt: {
    ignorePatterns: ['routeTree.gen.ts'],
    semi: false,
    singleQuote: true,
    arrowParens: 'avoid',
    sortImports: {
      groups: [
        'builtin',
        'side_effect',
        'external',
        'unplugin-icons',
        'src-aliases',
        ['parent', 'sibling', 'index'],
        'unknown',
      ],
      customGroups: [
        {
          groupName: 'unplugin-icons',
          elementNamePattern: ['~icons/**'],
        },
        {
          groupName: 'src-aliases',
          elementNamePattern: ['#/**'],
        },
      ],
      newlinesBetween: false,
      partitionByNewline: false,
    },
  },
  lint: {
    ignorePatterns: ['routeTree.gen.ts', 'src/utils/webp/index.js'],
    options: { typeAware: true, typeCheck: true },
    rules: {
      'no-unused-vars': 'warn',
    },
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    ...(isTest
      ? []
      : [
          devtools(),
          tanstackStart({
            spa: {
              enabled: false,
            },
            prerender: {
              enabled: false,
            },
          }),
          nitro({
            compatibilityDate: '2026-05-01',
            preset: 'cloudflare_module',
            wasm: false,
            cloudflare: {
              wrangler: {
                keep_vars: true,
                observability: {
                  enabled: true,
                },
              },
            },
          }),
        ]),
    unwasm({ esmImport: useWasmEsmImport, lazy: useWasmEsmImport }),
    viteReact(),
    icons({
      compiler: 'jsx',
      jsx: 'react',
      autoInstall: true,
    }),
    tailwindcss(),
  ],
})
