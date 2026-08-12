# Pagination 分页

> 长数据分块加载，保留位置感。

---

## 1. 解剖
```
< 上一页  1 2 [3] 4 5 ... 10  每页 20 条 ▽  下一页 >
```

## 2. 变体
- 基础分页（PC 表格底）
- 简洁版（仅上下页 + 页码）
- 可配置每页条数（`showSizeChanger`）
- 移动端：触底无限滚动替代（见 [List](List.md)）

## 3. 约束
- 默认每页 20 条
- 总页数 > 7 用省略号
- 跳页输入可选

## 4. Do / Don't
- ✅ 大数据用分页或虚拟滚动
- ✅ 显示总条数
- ❌ 移动端用页码分页（用无限滚动）

## 5. 代码
```tsx
<Pagination current={3} total={200} pageSize={20} showSizeChanger showTotal={(t)=>`共 ${t} 条`} />
```

## 6. 关系
- [Table](Table.md) — 表格分页
- [List](List.md) — 移动端无限滚动
