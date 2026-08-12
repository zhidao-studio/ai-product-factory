import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import path from 'node:path'
import devConfig from './dev'
import prodConfig from './prod'

export default defineConfig<'vite'>(async (merge) => {
  const baseConfig: UserConfigExport<'vite'> = {
    projectName: 'harmony',
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
    framework: 'react',
    compiler: 'vite',
    plugins: ['@tarojs/plugin-platform-harmony-cpp'],
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
    harmony: {
      projectPath: path.resolve(process.cwd(), 'native'),
      hapName: 'entry',
    },
  }

  if (process.env.NODE_ENV === 'development') {
    return merge({}, baseConfig, devConfig)
  }
  return merge({}, baseConfig, prodConfig)
})
