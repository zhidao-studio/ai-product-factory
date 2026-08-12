# Checkbox 多选框

> 从一组中多选，选项独立。

---

## 1. 解剖
```
☑ 选项一   ☐ 选项二   ☑ 选项三
```
方框 + 文字；选中主色填充 + 白勾。

## 2. 状态
Default / Hover / Checked / Disabled / Indeterminate(半选, 全选父)。

## 3. 变体
- 独立多选
- 组 `Checkbox.Group`
- 全选 + 半选（父级）

## 4. 尺寸
PC 框 16px；移动端 18~20px（热区 ≥ 44）。

## 5. Do / Don't
- ✅ 选项 > 2 用 Checkbox.Group
- ✅ 提供"全选"
- ❌ 多选一场景用 Checkbox（用 Radio）

## 6. 代码
```tsx
<Checkbox.Group options={opts} value={val} onChange={onChange} />
```

## 7. 关系
- [Radio](Radio.md) — 单选
- [Switch](Switch.md) — 二元
