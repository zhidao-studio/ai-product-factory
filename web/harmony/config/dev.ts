import type { UserConfigExport } from '@tarojs/cli'

export default {
  mini: {},
  h5: {
    devServer: {
      proxy: {
        '/dev-api': {
          target: 'http://localhost:8082',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/dev-api/, ''),
        },
      },
    },
  },
} satisfies UserConfigExport<'vite'>
