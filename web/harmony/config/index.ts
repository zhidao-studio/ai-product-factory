import path from 'node:path'
import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import devConfig from './dev'
import prodConfig from './prod'

interface DocumentedHarmonyConfig {
  compiler: 'vite'
  projectPath: string
  hapName: string
}

export default defineConfig<'vite'>(async (merge) => {
  const clientApiBaseUrl = process.env.TARO_APP_API_BASE_URL || 'http://localhost:8082'
  const harmonyConfig: DocumentedHarmonyConfig = {
    compiler: 'vite',
    projectPath: path.resolve(process.cwd(), 'native'),
    hapName: 'entry',
  }

  const baseConfig = {
    projectName: 'harmony',
    date: '2026-8-12',
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
      '@': path.resolve(process.cwd(), 'src'),
    },
    defineConstants: {
      __CLIENT_API_BASE_URL__: JSON.stringify(clientApiBaseUrl),
    },
    harmony: harmonyConfig,
  }

  if (process.env.NODE_ENV === 'development') {
    // harmony-cpp 4.2.1 的类型声明滞后于其 README 中的 compiler 配置，在 CLI 边界统一收口。
    return merge({}, baseConfig as UserConfigExport<'vite'>, devConfig)
  }
  return merge({}, baseConfig as UserConfigExport<'vite'>, prodConfig)
})
