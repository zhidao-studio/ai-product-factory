# DatePicker 日期选择器

> 选择日期/时间，避免手动输入日期格式错误。

---

## 1. 解剖与变体

| 类型 | 说明 |
|---|---|
| DatePicker | 单日 |
| RangePicker | 日期区间 |
| 年/月/周 | 粒度选择 |
| 时间选择 | 时分秒 |
| 移动端 | `DatePicker` 底部滚轮弹起 |

## 2. 状态
同 Input：Default / Focus / Disabled / Error / Open（日历面板浮层）。

## 3. 尺寸
PC 同 Input（32/40/24）；移动端滚轮 44px+。

## 4. Do / Don't
- ✅ 区间选择用 RangePicker，显示起止
- ✅ 禁用未来/过去日期用 `disabledDate`
- ❌ 用 Input 让用户输入日期（格式错误）

## 5. 代码
```tsx
// PC
<DatePicker placeholder="选择日期" />
<RangePicker />

// 移动端 (antd-mobile)
<DatePicker mode="date" onConfirm={...}>
  <List.Item>选择日期</List.Item>
</DatePicker>
```

## 6. 关系
- [Input](Input.md) — 尺寸一致
- [表单设计](../UX交互/表单设计.md)
