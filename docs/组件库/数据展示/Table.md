# Table 表格

> 表格是 PC 中后台最高频的数据展示组件。规范定义密度、状态与交互。

---

## 1. 概述

用于结构化数据的多列展示、排序、筛选、分页。移动端不推荐表格，改用 List（见 [List](List.md)）。

---

## 2. 解剖结构

```
┌──────┬──────┬──────┬──────┐
│ 列头 │ 列头 │ 列头 │ 操作 │  ← Header (加粗, 背景 #FAFAFA)
├──────┼──────┼──────┼──────┤
│ 数据 │ 数据 │ 数据 │ [编辑]│  ← Row (hover 高亮)
│ 数据 │ 数据 │ 数据 │ [编辑]│
├──────┴──────┴──────┴──────┤
│ < 上一页 1 2 3 ... 下一页> │  ← Pagination
└───────────────────────────┘
```

---

## 3. 密度（三档）

| 模式 | 行高 | 内边距 | 适用 |
|---|---|---|---|
| default | 48px | 16px | 常规 |
| compact | 40px | 12px | 数据密集 |
| middle | 44px | 14px | 折中 |

```tsx
// 紧凑模式通过算法全局开启
theme={ { algorithm: theme.compactAlgorithm } }
```

---

## 4. 状态

| 状态 | 表达 |
|---|---|
| 普通行 | 白底 |
| Hover 行 | `rgba(0,0,0,0.04)` |
| 选中行 | 主色浅背景 `#E6F4FF` |
| 斑马纹 | 奇数行 `rgba(0,0,0,0.02)`（可选） |
| 展开行 | 内嵌详情 |
| 加载 | 整表 Spin / Skeleton |
| 空 | `Empty` |

---

## 5. 交互能力

- 排序：列头点击切换升/降/无
- 筛选：列头下拉筛选
- 固定列：`fixed` 左/右滚动
- 固定表头：`scroll.y` 纵向滚动
- 行选择：`rowSelection` 多选
- 展开：嵌套子表
- 分页：默认每页 20 条，`showSizeChanger`

---

## 6. 视觉规范

- 仅水平分割线，`colorSplit`
- 列头加粗，背景 `#FAFAFA` 或透明
- 数字列右对齐（tabular-nums）
- 操作列固定在右侧

---

## 7. Do / Don't

**Do**
- ✅ 列数 ≤ 12，超出用展开/抽屉
- ✅ 操作列固定右侧
- ✅ 大数据用虚拟滚动

**Don't**
- ❌ 表格承载超长文本（截断 + Tooltip）
- ❌ 移动端用 Table（改 List）

---

## 8. 代码

```tsx
<Table
  columns={columns}
  dataSource={data}
  rowKey="id"
  scroll={{ x: 1000 }}
  pagination={{ pageSize: 20, showSizeChanger: true }}
  rowSelection={{ selectedRowKeys, onChange }}
/>
```

---

## 9. 关系

- [List](List.md) — 移动端替代
- [页面模板/列表页](../页面模板/列表页.md) — 表格在页面中
- [阴影与层级](../基础规范/阴影与层级.md) — 浮层
