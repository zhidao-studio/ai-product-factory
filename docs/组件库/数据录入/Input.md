# Input 输入框

> 输入框是数据录入的核心。规范覆盖解剖、状态、尺寸与移动端字号保护。

---

## 1. 概述

用于单行文本录入。多行用 `TextArea`。移动端优先用选择类控件替代输入（见 [表单设计](../UX交互/表单设计.md)）。

---

## 2. 解剖结构

```
┌──────────────────────────────────┐
│ [前缀图标] 占位符/输入文字 [后缀/清除] │  ← 容器(高32) + 内边距(12横向) + 边框(1px)
└──────────────────────────────────┘
```

- 容器：圆角 6px，边框 1px `#D9D9D9`
- 文字：14px，占位符 `colorTextPlaceholder`
- 前后缀图标：16px，`colorIcon`

---

## 3. 交互状态

| 状态 | 视觉 |
|---|---|
| Default | 灰边框 |
| Hover | 主色边框（PC） |
| Focus | 主色边框 + `controlOutline` 2px 主色光晕 |
| Filled | 文字深色 |
| Disabled | 灰底 `rgba(0,0,0,0.04)` + 灰字 |
| Error | 错误色边框 + 下方错误文案 |
| With clear | 右侧出现清除图标（有值时） |

---

## 4. 变体

| 类型 | 说明 |
|---|---|
| 基础输入框 | 单行文本 |
| TextArea | 多行，`autoSize` 可自动增高 |
| 带前缀/后缀 | 图标或文字（如 ¥、搜索） |
| 带清除 | `allowClear` |
| 密码框 | `type="password"` 可见切换 |
| 搜索框 | 组合按钮 |
| 组合输入框 | 前后附加 Select/按钮 |

---

## 5. 尺寸

| Size | 高度(PC) | 移动端 |
|---|---|---|
| large | 40px | 48px |
| middle | 32px | 44px |
| small | 24px | 36px |

> **移动端强制**：输入框字号 ≥ 16px，防止 iOS Safari 聚焦自动缩放。

---

## 6. Do / Don't

**Do**
- ✅ 占位符说明输入格式（如"请输入手机号"）
- ✅ 错误时在框下红字说明原因
- ✅ 移动端用 `allowClear` 便于修改

**Don't**
- ❌ 占位符替代 Label（Label 必须存在）
- ❌ 移动端输入框 < 16px 字号
- ❌ 长文本用单行 Input（用 TextArea）

---

## 7. 代码

```tsx
// PC
<Input prefix={<UserIcon />} placeholder="请输入手机号" allowClear status={error?'error':''} />
<Input.Password placeholder="请输入密码" />

// 移动端 (antd-mobile)
<Input placeholder="请输入手机号" clearable onChange={...} />
```

---

## 8. 无障碍

- `<label>` 关联；错误用 `aria-describedby` 指错误文案
- 清除按钮 `aria-label="清除"`
- 触控目标 ≥ 44px

---

## 9. 关系

- [表单设计](../UX交互/表单设计.md) — 校验时机
- [色彩系统](../基础规范/色彩系统.md) — 边框/错误色
