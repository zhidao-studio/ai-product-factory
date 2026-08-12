import type { UserConfig } from '@tarojs/cli'

export default {
  mini: {
    compress: true,
  },
  h5: {
    /**
     * 生产环境可在 h5 下配置 publicPath / 路由等
     */
  },
} as Partial<UserConfig>
