import { defineConfig } from '@tarojs/cli'
import path from 'node:path'
import devConfig from './dev'
import prodConfig from './prod'
import type { UserConfig } from '@tarojs/cli'

export default defineConfig(async (merge, { command, mode }) => {
  const baseConfig: UserConfig = {
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
    mini: {
      postcss: {
        autoprefixer: { enable: true },
        pxtransform: { enable: true },
      },
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      postcss: {
        autoprefixer: { enable: true },
        pxtransform: { enable: true },
      },
    },
    rn: {
      appName: 'miniapp',
    },
  }

  if (process.env.NODE_ENV === 'development') {
    return merge({}, baseConfig, devConfig)
  }
  return merge({}, baseConfig, prodConfig)
})
