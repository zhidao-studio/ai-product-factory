# Design Token 架构

> Token 是设计系统落到工程的「单一事实来源」。本规范定义 Token 的三层结构与工程落地方式。

---

## 1. 三层 Token 架构

```
┌─────────────────────────────────────────────┐
│ Primitive（原始）                              │
│   120 色 + 灰阶 + 字号原始值                   │
│   仅取色来源，不直接使用                        │
├─────────────────────────────────────────────┤
│ Semantic（语义）  ← 设计直接引用               │
│   colorPrimary / colorText / colorBg...       │
│   功能/中性语义，跨端一致                      │
├─────────────────────────────────────────────┤
│ Component（组件）  ← antd 自动派生             │
│   colorPrimaryBg / colorPrimaryHover...       │
│   组件级消费，开发一般不手动指定               │
└─────────────────────────────────────────────┘
```

**设计侧**只使用 Semantic 层；Primitive 与 Component 由工具/antd 派生。

---

## 2. Semantic Token 全量（核心）

### 色彩
```ts
colorPrimary: '#1677FF'
colorSuccess: '#52C41A'
colorWarning: '#FAAD14'
colorError:   '#FF4D4F'
colorInfo:    '#1677FF'
colorText:        'rgba(0,0,0,0.88)'
colorTextSecondary: 'rgba(0,0,0,0.65)'
colorTextTertiary:  'rgba(0,0,0,0.45)'
colorTextDisabled:  'rgba(0,0,0,0.25)'
colorBorder:  '#D9D9D9'
colorSplit:   'rgba(5,5,5,0.06)'
colorBgLayout:     '#F5F5F5'
colorBgContainer:  '#FFFFFF'
colorBgElevated:   '#FFFFFF'
```

### 字体
```ts
fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
fontSize: 14
fontSizeLG: 16
fontSizeSM: 12
fontSizeHeading1: 38  // ...至 Heading5:16
```

### 间距
```ts
marginXXS:4  marginXS:8  marginSM:12  margin:16
marginMD:20  marginLG:24 marginXL:32 marginXXL:48
paddingXXS:4 paddingXS:8 paddingSM:12 padding:16 ...
```

### 圆角 / 尺寸 / 线宽
```ts
borderRadius:6  borderRadiusLG:8  borderRadiusSM:4  borderRadiusXS:2
controlHeight:32  controlHeightLG:40  controlHeightSM:24
lineWidth:1
```

### 阴影
```ts
boxShadow: '0 6px 16px 0 rgba(0,0,0,0.08),0 3px 6px -4px rgba(0,0,0,0.12),0 9px 28px 8px rgba(0,0,0,0.05)'
boxShadowSecondary / boxShadowTertiary
```

### 动效
```ts
motion: true
motionDurationSlow: '0.3s'
motionDurationMid: '0.2s'
motionEaseInOut: 'cubic-bezier(0.645,0.045,0.355,1)'
motionEaseOut:   'cubic-bezier(0.215,0.61,0.355,1)'
```

---

## 3. 工程落地方式

### 方案 A：CSS 变量（推荐，跨端一致）
```ts
// theme.config.ts —— 单一来源
export const tokens = { colorPrimary:'#1677FF', fontSize:14, ... };

// antd (CSS-in-JS)
<ConfigProvider theme={{ token: tokens, cssVar: true }}>

// 移动端 (antd-mobile) —— 转 CSS 变量
:root:root { --adm-color-primary: #1677FF; }
```

### 方案 B：TS 类型消费
```ts
import { theme, type ThemeConfig } from 'antd';
export const appTheme: ThemeConfig = { token: tokens };
```

### 方案 C：设计工具同步
- Figma Variables 与 `tokens` 文件同源生成（见 [Figma 组件库搭建](../设计协作/Figma 组件库搭建.md)）
- 用 Style Dictionary / Tokens Studio 双向同步，避免漂移

---

## 4. 多主题 Token

| 主题 | 派生方式 | 变更 |
|---|---|---|
| 亮色（默认） | `defaultAlgorithm` | — |
| 深色 | `darkAlgorithm` | 背景/文本反转自动 |
| 紧凑 | `compactAlgorithm` | sizeStep 4→2 |
| 品牌换肤 | 改 `colorPrimary` | 全链路派生 |

---

## 5. 跨端 Token 字典（节选）

| 语义 | PC (antd) | 移动端 (antd-mobile) | 小程序 |
|---|---|---|---|
| 主色 | `colorPrimary` | `--adm-color-primary` | 配置 |
| 文本 | `colorText` | `--adm-color-text` | 配置 |
| 背景 | `colorBgContainer` | `--adm-color-background` | 配置 |
| 圆角 | `borderRadius` | 固定 8 | 固定 |

---

## 6. 规则（强制）

- ❌ 业务代码禁止写死色值/间距（必须从 Token 引用）
- ✅ Token 变更走 [版本与变更管理](../设计协作/版本与变更管理.md)
- ✅ 新增语义色先提 PR，更新本文件与 Figma

---

## 7. 关系
- [主题切换实现](主题切换实现.md) — 主题如何应用
- [组件封装策略](组件封装策略.md) — 业务组件消费 Token
- [Figma 组件库搭建](../设计协作/Figma 组件库搭建.md) — 设计侧同步
