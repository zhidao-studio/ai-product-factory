# Radio 单选框

> 从互斥选项中选一。

---

## 1. 解剖
```
◉ 选项一   ○ 选项二
```
圆点 + 文字；选中主色实心点。

## 2. 状态
Default / Hover / Checked / Disabled。

## 3. 变体
- `Radio.Group` 纵向/横向
- `Radio.Button` 按钮组（分段控件风格，选项 ≤ 4 推荐）

## 4. 尺寸
PC 点 16px；移动端 20px。

## 5. Do / Don't
- ✅ 选项 ≤ 5 用 Radio；> 5 用 [Select](Select.md)
- ✅ 默认选中一个（避免无选中歧义）
- ❌ 用 Radio 做多选（用 Checkbox）

## 6. 代码
```tsx
<Radio.Group optionType="button" options={opts} value={val} onChange={onChange} />
```

## 7. 关系
- [Checkbox](Checkbox.md) — 多选
- [Select](Select.md) — 长列表单选
