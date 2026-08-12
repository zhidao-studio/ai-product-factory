# Button 按钮

> 按钮触发动作。本规范定义按钮的解剖、状态、变体与用法，作为其他组件文档的模板范例。

---

## 1. 概述与适用场景

用于触发即时操作（提交、保存、取消、删除等）。一个操作区域应只有**一个主按钮**。

---

## 2. 解剖结构（Anatomy）

```
┌─────────────────────────────┐
│ [图标]  按钮文字  [图标]      │  ← 容器(圆角6px) + 文字(14px/400) + 可选图标(16px)
└─────────────────────────────┘
```

- 容器：`borderRadius` 6px，高度由 Size 决定
- 文字：`fontSize` 14px（large 16px），字重 400（large 默认）
- 图标：16px（与文字 8px 间距）

---

## 3. 交互状态（States）

| 状态 | PC 视觉 | 移动端视觉 |
|---|---|---|
| Default | 主色填充 / 描边 | 同左 |
| Hover | 浅一阶主色（blue-5） | —（无 hover） |
| Active | 深一阶主色（blue-7） | 同左（按下态） |
| Focus | 主色描边 + `controlOutline` 2px | 同左 |
| Disabled | 主色 40% 透明 + 禁用文字 | 同左 |
| Loading | 内联 Spinner + 禁用 | 同左 |

---

## 4. 变体矩阵（Variants）

| Type | 样式 | 用途 | 约束 |
|---|---|---|---|
| **primary** | 主色实心 | 页面主操作（每屏唯一） | 一屏至多 1 个 |
| **default** | 白底 + 灰描边 | 次操作（取消/返回） | — |
| **dashed** | 虚线描边 | 添加类（新建/上传） | — |
| **text** | 无背景无边框 | 低强调操作（查看/更多） | — |
| **link** | 主色文字 | 跳转链接 | — |

| Size | 高度(PC) | 字号 | 移动端 |
|---|---|---|---|
| large | 40px | 16px | `size="large"` 44px |
| middle | 32px | 14px | 默认 44px |
| small | 24px | 14px | `size="small"` |

| Shape | 说明 |
|---|---|
| default | 圆角 6px |
| round | 胶囊（height/2） |
| circle | 圆形（仅图标按钮） |

| 其他属性 | 说明 |
|---|---|
| `block` | 占满父容器宽度（移动端表单提交常用） |
| `danger` | 危险操作（删除），用错误色 |
| `ghost` | 透明底浮在彩色背景上 |

---

## 5. 尺寸规格

```
PC: 高度 32(middle)/40(large)/24(small)，水平内边距 16px，圆角 6px
移动端: 高度 44px(默认)/48px(large)，block 时整行，圆角 8px
```

---

## 6. 用法 Do / Don't

**Do**
- ✅ 主操作使用 primary，次操作使用 default
- ✅ 危险操作（删除）加 `danger` + 二次确认
- ✅ 提交按钮在 loading 时禁用并显 Spinner
- ✅ 图标按钮必须配 Tooltip/aria-label

**Don't**
- ❌ 一屏放多个 primary 按钮（失去焦点）
- ❌ 用文字颜色区分主次而不用类型（如两个 default）
- ❌ 按钮文字含糊（"点击" → 应"提交订单"）
- ❌ 禁用态不解释原因（hover 给 Tooltip）

---

## 7. 跨端映射与代码

```tsx
// PC (antd)
<Button type="primary" size="large" loading={submitting} block onClick={submit}>
  提交订单
</Button>
<Button type="default">取消</Button>
<Button danger onClick={del}>删除</Button>

// 移动端 (antd-mobile)
<Button color="primary" size="large" block loading={submitting}>提交订单</Button>
<Button color="default">取消</Button>
```

---

## 8. 无障碍要点

- 禁用态需可聚焦并给出原因（Tooltip）
- 加载态用 `aria-busy`
- 图标按钮 `aria-label` 必填
- 触控目标 ≥ 44px（移动端）

---

## 9. 与其他文档关系

- [色彩系统](../基础规范/色彩系统.md) — 主色/危险色来源
- [间距与圆角](../基础规范/间距与圆角.md) — 内边距/圆角
- [页面模板/表单页](../页面模板/表单页.md) — 按钮组合
