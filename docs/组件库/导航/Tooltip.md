# Tooltip 文字提示

> 悬浮/长按时显示辅助说明，不打断。

---

## 1. 解剖
```
  ┌──────────┐
  │ 说明文字  │ ← 浮层气泡, 指向触发元素
  └────┬─────┘
     [图标]
```

## 2. 变体
- 上方/下/左/右
- 纯文字 / 含快捷操作（Popover）

## 3. 触发
- PC：hover + focus
- 移动端：长按（Tooltip 不友好，建议直接用文字/Popover）

## 4. Do / Don't
- ✅ 图标按钮必配 Tooltip/aria-label
- ✅ 文案一行，过长用 Popover
- ❌ 移动端依赖 hover Tooltip（无 hover）

## 5. 代码
```tsx
<Tooltip title="编辑">
  <Button icon={<EditIcon />} aria-label="编辑" />
</Tooltip>
```

## 6. 关系
- [图标系统](../基础规范/图标系统.md) — 图标按钮标签
- [无障碍设计](../基础规范/无障碍设计.md)
