# 业务组件：数据指标卡（StatCard）

> 模块：组件库 / 业务组件 ｜ 复用：Card + Statistic + 趋势标识
> 用途：仪表盘、概览页的顶部 KPI 区，单屏并排展示多个核心指标。

---

## 1. 解剖结构

```
┌─────────────────────────┐
│ [图标] 指标名称           │  ← 标题 colorTextSecondary 12~14px
│                          │
│ 12,860   ▲ 12.5%         │  ← 主值 colorText 24~30px medium；趋势色
│ 较昨日                │  ← 副文案 colorTextTertiary 12px
└─────────────────────────┘
```
- **图标**（可选）：左上 20~24px，色取主色或语义色，圆形浅底容器。
- **主值**：数字用 `fontWeightStrong`，千分位格式化。
- **趋势**：同比/环比用 `▲/▼` + 百分比，上涨非永远绿（见下方"语义陷阱"）。
- **对比基准**：默认"较昨日/较上周"，需明确标注。

---

## 2. 状态与变体

| 变体 | 说明 |
|---|---|
| 基础型 | 仅主值 + 标题 |
| 趋势型 | 主值 + 涨跌 + 基准（最常用） |
| 进度型 | 主值 + 进度条（达成率） |
| 迷你型（Sparkline） | 主值 + 内联微型折线（移动端友好） |

---

## 3. 尺寸与栅格

| 端 | 单卡宽 | 并排数 |
|---|---|---|
| PC | 自适应栅格列，最小 240px | 4（宽屏可 5~6） |
| 平板 | 1/2 屏 | 2 |
| 移动端/H5 | 全宽或 1/2 | 2（≥375px） / 1（<375px） |

---

## 4. 跨端代码（antd）

```tsx
import { Card, Statistic, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

<Card variant="borderless">
  <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--color-text-secondary)' }}>
    <UserOutlined /> 活跃用户
  </div>
  <Statistic value={12860} groupSeparator="," />
  <span style={{ color: up ? 'var(--color-success)' : 'var(--color-error)' }}>
    {up ? <ArrowUpOutlined/> : <ArrowDownOutlined/>} 12.5% 较昨日
  </span>
</Card>
```

移动端（antd-mobile）：
```tsx
import { Card, NumberKeyboard } from 'antd-mobile';
// 用 Grid 2 列布局包裹多个 StatCard
```

---

## 5. Do / Don't

- ✅ 主值突出、基准清晰、趋势带方向符号
- ✅ 移动端用 2 列 mini 型
- ❌ 把"下跌"也标绿（涨跌语义必须一致：涨=红或绿需在全局约定，且全系统统一；本系统默认**涨绿跌红**用于金融，**涨红跌绿**用于通用 KPI 请在文档明确，禁止混用）
- ❌ 主值用非 Token 大字
- ❌ 一张卡塞 3 个以上副指标

---

## 6. 自检

- [ ] 主值来自 Statistic，千分位正确
- [ ] 趋势方向色全局统一，未混用
- [ ] 基准文案明确
- [ ] 移动端 ≤ 2 列
