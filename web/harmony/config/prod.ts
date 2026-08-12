import type { UserConfigExport } from '@tarojs/cli'

export default {
  mini: {},
  h5: {
    /**
     * 生产环境可在 h5 下配置 publicPath / 路由等
     */
  },
} satisfies UserConfigExport<'vite'>
