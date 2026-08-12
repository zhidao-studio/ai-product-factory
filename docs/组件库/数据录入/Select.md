# Select 选择器

> 从预设集合中单选/多选。优先用选择器替代自由输入，减少错误（见 [表单设计](../UX交互/表单设计.md)）。

---

## 1. 解剖结构

```
┌────────────────────────────┐
│ 请选择          [展开箭头▼]  │  ← 容器(同Input) + 选中文字 + 后缀箭头
└────────────────────────────┘
        ┌──────────────┐
        │ ◉ 选项一      │  ← 下拉面板(浮层+阴影)
        │ ○ 选项二      │
        │ ○ 选项三      │
        └──────────────┘
```

---

## 2. 状态

Default / Hover / Focus / Disabled / Error / Open(展开) / Selected(选中项高亮) / Multiple(多选标签)。

---

## 3. 变体

| 类型 | 说明 |
|---|---|
| 单选 | 默认 |
| 多选 | `mode="multiple"`，选中以 Tag 呈现，可清除 |
| 可搜索 | `showSearch`，远程/本地过滤 |
| 远程加载 | 滚动加载选项 |
| 级联 | `Cascader`，省市区等 |
| 分组 | `OptGroup` |

---

## 4. 尺寸

与 Input 一致：large 40 / middle 32 / small 24（PC）；移动端用 `Picker` 底部弹起，高度 44px+。

---

## 5. 移动端差异

- antd-mobile 用 `Picker`（底部弹出滚轮）而非下拉面板
- 选项多时分页/搜索
- 多级用 `Cascader` 逐级选择

---

## 6. Do / Don't

**Do**
- ✅ 选项 ≤ 8 用单选，> 8 提供搜索
- ✅ 多选显示已选数量（如"已选 3 项"）
- ✅ 无选项时显示空态

**Don't**
- ❌ 用 Select 承载无限动态数据（改用搜索输入）
- ❌ 选项文字过长不截断+Tooltip

---

## 7. 代码

```tsx
// PC
<Select placeholder="请选择城市" showSearch optionFilterProp="label"
  options={[{value:'bj',label:'北京'},...]} />

// 移动端
<Picker columns={[...]} onConfirm={...}>
  <List.Item>选择城市</List.Item>
</Picker>
```

---

## 8. 无障碍

- 键盘上下键导航选项，Enter 选中，Esc 关闭
- 选中态 `aria-selected`
- 移动端滚轮支持读屏

---

## 9. 关系

- [Input](Input.md) — 尺寸一致
- [表单设计](../UX交互/表单设计.md) — 录入优化
