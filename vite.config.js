import vue from '@vitejs/plugin-vue'
import windicss from 'vite-plugin-windicss'

/**
 * https://vitejs.dev/config/
 * @type {import('vite').UserConfig}
 */
export default {
  plugins: [vue(), windicss()],
}
