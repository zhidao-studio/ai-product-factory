import { defineConfig } from '@tarojs/cli'
import path from 'node:path'
import devConfig from './dev'
import prodConfig from './prod'

export default defineConfig(async (merge) => {
  const clientApiBaseUrl = process.env.TARO_APP_API_BASE_URL || 'http://localhost:8082'
  const baseConfig = {
    projectName: 'miniapp',
    date: '2026-8-11',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2,
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    sass: {
      implementation: 'sass',
    },
    framework: 'react',
    compiler: 'webpack5',
    alias: {
      '@': path.resolve(process.cwd(), 'src')
    },
    defineConstants: {
      __CLIENT_API_BASE_URL__: JSON.stringify(clientApiBaseUrl),
    },
    mini: {
      postcss: {
        autoprefixer: { enable: true },
        pxtransform: { enable: true },
      },
    },
  }

  if (process.env.NODE_ENV === 'development') {
    return merge({}, baseConfig, devConfig)
  }
  return merge({}, baseConfig, prodConfig)
})
