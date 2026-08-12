# Android 平台适配

> Android 遵循 Material Design 3。在 AntD 统一语言上，尊重 M3 色彩角色、Shape System 与动态色彩。

---

## 1. 设计原则（M3）

| 原则 | 含义 |
|---|---|
| Dynamic Color | 可从壁纸派生配色 |
| Shape System | 圆角按组件类型分类 |
| Elevation | 颜色/阴影表达层级 |
| Expressive | 更有情感的微交互 |

---

## 2. M3 色彩角色

| 角色 | 用途 |
|---|---|
| Primary / On Primary | 主色 / 主色上文字 |
| Primary Container / On Primary Container | 主容器 / 容器上文字 |
| Secondary / Tertiary | 次/第三强调 |
| Surface / On Surface | 表面 / 表面文字 |
| Error / Outline | 错误 / 描边 |

> 本系统主色 `#1677FF` 映射为 M3 Primary；深色/容器自动派生。

---

## 3. Shape System

| 类别 | 圆角 | 用途 |
|---|---|---|
| None | 0dp | 全屏 |
| Extra Small | 4dp | 小组件 |
| Small | 8dp | 按钮/Chip |
| Medium | 12dp | 卡片 |
| Large | 16dp | 大卡片/底部表单 |
| Extra Large | 28dp | FAB/底部导航 |
| Full | 50% | 圆形/头像 |

> AntD 默认圆角偏小，Android 端适度放大至 M3 偏好。

---

## 4. 字体梯度（M3）

| 角色 | 字号 | 行高 | 字重 |
|---|---|---|---|
| Display Large | 57 | 64 | 400 |
| Headline Large | 32 | 40 | 400 |
| Title Large | 22 | 28 | 400 |
| Title Medium | 16 | 24 | 500 |
| Body Large | 16 | 24 | 400 |
| Body Medium | 14 | 20 | 400 |
| Label Large | 14 | 20 | 500 |

---

## 5. 布局参数

| 参数 | 值 |
|---|---|
| 最小触控目标 | 48×48 dp |
| 状态栏 | 24dp |
| 导航栏 | 56dp |
| 底部导航 | 80dp |
| 页面边距 | 16dp |
| FAB | 56dp（标准）/ 96dp（extended） |
| FAB 边距 | 16dp |

---

## 6. 交互特性

- 物理返回键支持
- Ripple 波纹效果
- Bottom Sheet
- Material You 动态色彩
- 全面屏手势导航

---

## 7. 与本系统对齐

- 主色 `#1677FF` → M3 Primary
- 阴影/层级见 [阴影与层级](../基础规范/阴影与层级.md)（M3 Elevation 参考）
- 动效见 [动效系统](../基础规范/动效系统.md)

---

## 8. 规则

- ✅ 触控目标 ≥ 48dp
- ✅ 尊重物理返回键
- ❌ 圆角过小（遵循 M3 Shape）
- ❌ 忽略动态色彩（如支持，从主色派生）

---

## 9. 关系
- [阴影与层级](../基础规范/阴影与层级.md) — Elevation
- 参考：https://m3.material.io
