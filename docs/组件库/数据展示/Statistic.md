# Statistic 数值

> 突出展示关键指标，仪表盘核心组件。

---

## 1. 解剖
```
销售额 (标签, 二级色)
¥ 1,128,000  (数值, 大字, tabular-nums)
↑ 12% (趋势, 成功色)
```

## 2. 变体
- 纯数值
- 带前缀/后缀（¥、%）
- 带趋势（上升/下降箭头 + 色）
- 带加载（Skeleton）

## 3. 尺寸
数值字号 24~36px，加粗；标签 14px 二级色。

## 4. Do / Don't
- ✅ 关键指标用大字 + tabular-nums 对齐
- ✅ 趋势用功能色（升=成功,降=错误）
- ❌ 普通文本当 Statistic（用 Typography）

## 5. 代码
```tsx
<Statistic title="销售额" value={1128000} prefix="¥"
  valueStyle={{ color:'#1677FF' }} />
```

## 6. 关系
- [Card](Card.md) — 数值卡容器
- [页面模板/仪表盘](../页面模板/仪表盘.md)
