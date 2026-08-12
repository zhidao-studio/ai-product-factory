# 业务组件：订单卡（OrderCard）

> 模块：组件库 / 业务组件 ｜ 复用：Card + List.Item + Tag + Button
> 用途：订单列表、订单中心；展示单笔订单的商品、金额、状态与操作。

---

## 1. 解剖结构

```
┌───────────────────────────────────┐
│ 订单号 NO.20260811xxxx   待付款 Tag │  ← 头部：单号 + 状态标签(右)
│ ─────────────────────────────────  │
│ [缩略图] 商品标题 x2 ……  ￥299.00  │  ← 商品行（可多行折叠）
│ [缩略图] 商品标题 x1               │
│ ─────────────────────────────────  │
│ 共 3 件  合计 ￥598.00   去支付     │  ← 底部：汇总 + 主操作按钮
└───────────────────────────────────┘
```

- **状态标签**：用 `Tag` 语义色（待付款=warning，已完成=success，已取消=default，售后中=info/error）。
- **缩略图**：64×64px（移动端）/ 56×56（H5），圆角 `radius.sm`(4)，浅底占位。
- **主操作**：每卡至多 1 个 `primary`（如"去支付"）；次要操作为文字按钮（"查看""退款"）。

---

## 2. 状态映射（统一）

| 状态 | Tag 色 | 主操作 |
|---|---|---|
| 待付款 | warning | 去支付 |
| 待发货 | info | 提醒发货 / 查看 |
| 待收货 | info | 查看物流 |
| 已完成 | success | 再次购买 |
| 已取消 | default | 删除 |
| 售后中 | error | 查看进度 |

---

## 3. 跨端代码（antd-mobile，H5/RN 优先）

```tsx
import { Card, Tag, Button, Image } from 'antd-mobile';
import { OrderCardItem } from '@/components/business';

<Card>
  <div className="order-header">
    <span>NO.{order.no}</span>
    <Tag color={statusMeta[order.status].color}>{statusMeta[order.status].text}</Tag>
  </div>
  {order.items.slice(0,2).map(it => (
    <div key={it.id} className="order-item">
      <Image src={it.thumb} width={56} height={56} fit="cover" />
      <div className="order-item-meta">
        <span>{it.title}</span>
        <span>x{it.qty}</span>
      </div>
      <span>￥{it.price}</span>
    </div>
  ))}
  {order.items.length > 2 && <div className="order-more">共 {order.items.length} 件</div>}
  <div className="order-footer">
    <span>合计 ￥{order.total}</span>
    <Button color="primary" size="small" onClick={pay}>去支付</Button>
  </div>
</Card>
```

PC（列表页用 Table 行展开，不用卡片堆叠；但订单详情侧可用此卡）。

---

## 4. Do / Don't

- ✅ 状态用统一 Tag 色映射
- ✅ 多商品折叠，显示"共 N 件"
- ✅ 主操作唯一、危险操作用 danger
- ❌ 一卡多个 primary 按钮
- ❌ 缩略图用随机非 Token 占位色
- ❌ 金额不加千分位/货币符号

---

## 5. 自检

- [ ] 状态→Tag 色来自映射表
- [ ] 主操作 ≤ 1 primary
- [ ] 金额格式化（￥ + 千分位）
- [ ] 多商品折叠正确
- [ ] 缩略图尺寸/圆角符合 Token
