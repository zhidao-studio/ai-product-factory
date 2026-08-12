# 业务组件：筛选栏（FilterBar）

> 模块：组件库 / 业务组件 ｜ 复用：Dropdown / Select / 抽屉筛选
> 用途：列表页条件筛选；与 SearchBar、分页联动。

---

## 1. 解剖结构（PC）

```
[ 状态 ▾ ] [ 分类 ▾ ] [ 时间 ▾ ]  ……  [ 更多筛选 ]       右侧：共 128 条
```
- 横向排列筛选条件，每项 `radius.base` 胶囊/下拉。
- 已选条件用可删除的 `Tag` 展示在下方（"筛选：待付款 ✕ 已选分类 ✕"）。
- 结果计数实时显示。

## 2. 解剖结构（移动端）

```
[ 状态 ▾ ] [ 分类 ▾ ] [ 筛选(2) ]   ← 底部"筛选"点开半屏 Drawer
```
- 移动端条件多 → 收敛为"筛选(N)"抽屉，N=已选数。
- 抽屉内用 Form 分组，底部固定"重置 / 确定"。

---

## 3. 行为规则

- **联动**：任一条件变更即重查（debounce 300ms）；分页重置到 1。
- **已选展示**：必须可见已选条件，支持单删/全清。
- **持久**：刷新页面保留筛选（URL query 或 state）。
- **空结果**：走 Empty 组件，并显示"清除筛选"快捷操作。

---

## 4. 跨端代码（antd）

```tsx
import { Select, Button, Tag, Space } from 'antd';

<Space wrap>
  <Select placeholder="状态" options={statusOpts} onChange={onChange} allowClear style={{width:140}} />
  <Select placeholder="分类" options={catOpts} onChange={onChange} allowClear style={{width:140}} />
  {activeFilters.map(f => (
    <Tag key={f.key} closable onClose={() => remove(f.key)}>{f.label}</Tag>
  ))}
  <Button onClick={reset}>重置</Button>
</Space>
<div className="result-count">共 {total} 条</div>
```

---

## 5. Do / Don't

- ✅ 已选条件可见可删
- ✅ 移动端收敛为筛选抽屉
- ✅ 筛选变更重置分页
- ❌ 筛选后无结果且无引导
- ❌ 移动端把 6 个下拉铺满屏幕
- ❌ 已选状态不持久（刷新丢失）

---

## 6. 自检

- [ ] 已选 Tag 可删 + 全清
- [ ] 移动端用抽屉收纳
- [ ] 分页随筛选重置
- [ ] 空结果有"清除筛选"入口
- [ ] 筛选状态可持久化
