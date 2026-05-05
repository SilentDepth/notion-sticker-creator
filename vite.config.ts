import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite-plus'

const config = defineConfig({
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
    ignorePatterns: ['routeTree.gen.ts'],
    options: { typeAware: true, typeCheck: true },
    rules: {
      'no-unused-vars': 'warn',
    },
  },
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), nitro(), tailwindcss(), tanstackStart(), viteReact()],
})

export default config
