# Notification 通知

> 异步/全局通知，常驻右上角，可手动关闭。PC 后台常用。

---

## 1. 解剖
```
┌──────────────────────────────┐
│ [ℹ] 标题                      [×] │
│     通知正文说明...            │    ← 右上角浮层, 宽 384px
└──────────────────────────────┘
```

## 2. 变体
- success / info / warning / error
- 标题 + 描述
- 持续至手动关闭或 4.5s 自动（可配）

## 3. 与 Message 区别
- Notification：信息多、常驻、右上角（PC）
- Message：轻量、顶部居中、自动消失（见 [Message](Message.md)）

## 4. Do / Don't
- ✅ 异步任务结果（"导出完成"）用 Notification
- ✅ 提供操作入口（查看/重试）
- ❌ 移动端用 Notification（用 Toast/原生通知）

## 5. 代码
```tsx
notification.success({ message:'导出完成', description:'文件已生成', btn:<a>下载</a> });
```

## 6. 关系
- [Message](Message.md) — 轻提示
- [反馈机制](../UX交互/反馈机制.md)
