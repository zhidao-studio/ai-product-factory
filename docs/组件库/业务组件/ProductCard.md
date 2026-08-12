# 业务组件：商品卡（ProductCard）

> 模块：组件库 / 业务组件 ｜ 复用：Card + Image + Tag + Rate + Button
> 用途：商品列表、商城、推荐流；图文混排展示商品。

---

## 1. 解剖结构

```
┌─────────────────────────┐
│   [ 商品主图 16:9 ]       │  ← 主图，圆角 radius.sm，缺省占位
│   ┌──┐ 热销 Tag  ¥199     │  ← 角标(左上) + 价格(右上/下方)
│   商品标题（最多两行）      │
│   ★4.8  已售 2.3万        │  ← 评分 + 销量
│            加入购物车      │  ← 主操作
└─────────────────────────┘
```

- **主图**：比例固定 1:1（列表）或 16:9（banner 流），圆角 `radius.sm`(4)。
- **价格**：`colorError`(红) 突出，大号 medium；划线原价 `colorTextDisabled`。
- **评分**：`Rate` 半星，禁用交互态（展示用 `disabled`）。
- **角标**：`Tag` 绝对定位左上（热销/新品/折扣）。

---

## 2. 变体

| 变体 | 列数（移动端） | 用途 |
|---|---|---|
| 单列大图 | 1 | 详情推荐、信息密度高 |
| 双列瀑布 | 2 | 商品流、首页 |
| 三列网格 | 3（≥768px） | PC 商城 |

---

## 3. 跨端代码（antd-mobile）

```tsx
import { Card, Image, Tag, Rate, Button } from 'antd-mobile';

<Card className="product-card">
  <div className="thumb-wrap">
    <Image src={p.cover} fit="cover" />
    {p.hot && <Tag className="badge" color="error">热销</Tag>}
  </div>
  <div className="title">{p.title}</div>
  <div className="meta">
    <span className="price">¥{p.price}</span>
    {p.origin && <span className="origin">¥{p.origin}</span>}
  </div>
  <div className="sub">
    <Rate value={p.rate} readOnly /> {p.sold}+人付款
  </div>
  <Button color="primary" block size="small" onClick={addCart}>加入购物车</Button>
</Card>
```

---

## 4. Do / Don't

- ✅ 主图比例统一、有占位
- ✅ 价格用语义红、有划线原价
- ✅ 评分只读展示
- ❌ 标题超两行不截断（用 -webkit-line-clamp:2）
- ❌ 角标遮挡主图关键信息
- ❌ 价格用非 Token 色

---

## 5. 自检

- [ ] 主图比例固定、圆角 sm
- [ ] 价格色 = colorError，有原价划线
- [ ] 标题两行截断
- [ ] 评分只读
- [ ] 角标语义正确
