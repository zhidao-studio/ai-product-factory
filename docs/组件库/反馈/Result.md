# Result 结果页

> 流程终结的明确反馈，提供下一步。

---

## 1. 解剖
```
        [✓ 大图标]
        操作成功
        说明文字一行...
   [查看详情]  [返回列表]
```

## 2. 变体
- success（成功）
- error（失败）
- info / warning
- 404 / 403（异常页）

## 3. Do / Don't
- ✅ 流程终点用 Result（提交完成/支付成功）
- ✅ 提供返回/下一步操作
- ❌ 普通列表空态用 Result（用 [Empty](Empty.md)）

## 4. 代码
```tsx
<Result status="success" title="提交成功"
  subTitle="我们将在 1 个工作日内审核"
  extra={[<Button type="primary">查看</Button>,<Button>返回</Button>]} />
```

## 5. 关系
- [页面模板/结果页](../页面模板/结果页.md)
- [Empty](Empty.md) — 空态区别
