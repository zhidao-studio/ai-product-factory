# Modal 对话框

> 模态对话框打断当前流程，要求用户响应。慎用，仅在需用户确认或输入时使用。

---

## 1. 概述

用于：重要确认（删除）、表单录入、信息展示。非阻断提示用 [Message](Message.md) / Toast。

---

## 2. 解剖结构

```
        ┌────────────────────────────┐
        │ 标题文字               [×]  │  ← Header (标题+关闭)
        ├────────────────────────────┤
        │ 内容区（文字/表单/列表）      │  ← Body (内边距 24px)
        │                            │
        ├────────────────────────────┤
        │        [取消] [确定]        │  ← Footer (右对齐, 主按钮居右)
        └────────────────────────────┘
              ▲ 遮罩 rgba(0,0,0,0.45)
```

---

## 3. 状态

- Open：淡入 + 缩放 0.8→1（300ms easeOut）
- Close：淡出 + 缩放（200ms）
- 遮罩点击关闭（可配置 `maskClosable`）
- 加载中：确定按钮 loading

---

## 4. 变体

| 类型 | 说明 |
|---|---|
| 确认对话框 | `Modal.confirm`，图标 + 文案 + 确认/取消 |
| 表单对话框 | 内嵌 Form |
| 信息展示 | 大段内容，可滚动 |
| 全屏对话框 | 移动端常用，占满屏幕 |

---

## 5. 尺寸

| 尺寸 | 宽度 | 圆角 |
|---|---|---|
| small | 400px | 8px |
| default | 520px | 8px |
| large | 800px | 8px |

移动端：全屏或 `width: 90vw`，底部滑入。

---

## 6. Do / Don't

**Do**
- ✅ 标题说明意图（"删除确认"而非"提示"）
- ✅ 危险操作用 `danger` 确定按钮
- ✅ Footer 主按钮在右，次按钮在左

**Don't**
- ❌ 用 Modal 展示可后台完成的轻提示（用 Toast）
- ❌ 内容过长不滚动（设 `height` + 滚动）
- ❌ 同时弹多个 Modal

---

## 7. 代码

```tsx
// PC
<Modal title="删除确认" open={open} onOk={handleOk} onCancel={onCancel}
  okText="删除" okButtonProps={{ danger }} confirmLoading={loading}>
  确定删除该条记录？此操作不可恢复。
</Modal>

// 移动端 (antd-mobile Dialog)
Dialog.confirm({ content: '确定删除？', confirmText:'删除' });
```

---

## 8. 无障碍

- `role="dialog"` + `aria-modal="true"`
- 打开时焦点移入，关闭返回触发元素
- Esc 关闭；遮罩关闭可关闭
- 标题 `aria-labelledby`

---

## 9. 关系

- [Drawer](Drawer.md) — 更重内容用抽屉
- [Message](Message.md) — 轻提示替代
- [动效系统](../基础规范/动效系统.md) — 转场曲线
