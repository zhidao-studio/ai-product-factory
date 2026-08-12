# 国际化与 RTL 规范

> 模块：跨端通用 ｜ 适用：所有端（尤其 H5 / 小程序 / PC Web 需出海）
> 关联：字体排版、栅格与布局、组件库
> 核心：**从第一行代码就按"可翻译"设计**，否则后期改造成本是初期的 5~10 倍。

---

## 1. 文本膨胀系数（Text Expansion）

不同语言长度差异极大，布局必须能自适应，禁止定死宽度。

| 语言 | 相对英文膨胀 | 布局对策 |
|---|---|---|
| 中文 | 0.8~1.0 | 基准 |
| 英文 | 1.0 | 基准 |
| 德文 | 1.8~2.5 | 按钮/标签避免固定宽，允许换行 |
| 俄文 | 1.5~2.0 | 同上 |
| 阿拉伯文 | 1.3~1.8 | 兼顾 RTL |
| 日文 | 0.9~1.1 | 同中文 |

- **规则**：所有含文案的容器用 `max-width` + 自动高度，不用固定 height 截断。
- **按钮**：`min-width` + 内边距自适应，文案变化不破版。
- **截断**：仅在"列表项/卡片标题"等明确场景截断（两行 `line-clamp`），且需产品确认。

---

## 2. 文案与代码分离

- 所有用户可见文案走 i18n key，**禁止**在组件里硬编码字符串。
- 结构：`locales/{zh-CN,en-US,ar-SA}.json`，key 用"模块.功能.含义"命名（`order.list.empty`）。
- 动态值用占位符：`订单 {count} 件` → `order.count: '订单 {count} 件'`（禁止字符串拼接）。

```ts
// ✅
t('order.empty', { count: 3 })
// ❌
`订单 ${count} 件`   // 无法翻译语序
```

---

## 3. RTL（从右到左，阿拉伯语等）

- **根容器**：`dir="rtl"` 自动镜像（逻辑属性优先）。
- **用逻辑属性替代物理属性**：
  - `margin-inline-start` 替代 `margin-left`
  - `padding-inline-end` 替代 `padding-right`
  - `inset-inline-start` 替代 `left`
- **antd**：`<ConfigProvider direction="rtl">` 自动处理组件内部镜像。
- **图标**：方向性图标（箭头、返回）需水平翻转；对称性图标（设置、搜索）不需。
- **图表**：坐标轴方向、图例位置随之镜像；数字/日期保持 LTR（不翻转数字）。

```tsx
<ConfigProvider direction={isRTL ? 'rtl' : 'ltr'}>
  <AntdApp>{children}</AntdApp>
</ConfigProvider>
```

---

## 4. 数字 / 日期 / 货币格式

| 项 | 规范 |
|---|---|
| 数字千分位 | 用 `Intl.NumberFormat(locale)`，`1,286`(en) / `1 286`(fr) |
| 货币 | `Intl.NumberFormat(locale,{style:'currency',currency:'USD'})` |
| 日期 | `Intl.DateTimeFormat(locale)`，`2026/8/11`(zh) vs `8/11/2026`(en) |
| 时区 | 展示用户所在时区，存储统一 UTC |

- 禁止手写格式化函数；统一封装 `formatNumber/formatDate/formatCurrency`。

---

## 5. 字体与排版

- 阿拉伯文需 `font-family` 追加 Arabic 字体回退；CJK 用系统中文字体。
- 行高：非拉丁文（如泰文、阿拉伯文）行高 ≥ 1.6，避免字符上下切。
- 字号：RTL 文本字号可比 LTR 略大 1px 提升可读性。

---

## 6. 反模式

- ❌ 组件内硬编码任何用户文案
- ❌ 字符串拼接组装多语言
- ❌ 用 `left/right` 物理属性做布局（RTL 会错）
- ❌ 数字/日期手写格式化
- ❌ 方向性图标未翻转

---

## 7. 自检

- [ ] 所有文案走 i18n key，无硬编码
- [ ] 布局可承受 ≥ 2x 文本膨胀
- [ ] RTL 用逻辑属性 + ConfigProvider direction
- [ ] 方向性图标翻转
- [ ] 数字/日期/货币用 Intl API
- [ ] 字体回退覆盖目标语言
