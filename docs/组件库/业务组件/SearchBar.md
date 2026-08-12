# 业务组件：搜索栏（SearchBar）

> 模块：组件库 / 业务组件 ｜ 复用：Input.Search / antd-mobile SearchBar
> 用途：列表页顶部、首页搜索、筛选入口；常配合 FilterBar 使用。

---

## 1. 解剖结构

```
[ 搜索图标 ]  请输入关键字            [ 取消 ]   ← 输入态显示"取消"
```

- **占位符**：具体而非"搜索"，如"搜索商品 / 订单号"。
- **清除**：有内容显示清除图标（allowClear）。
- **取消**：移动端聚焦后右侧出现"取消"，点击收起键盘。
- **圆角**：`radius.lg`(8) 移动端 / `radius.base`(6) PC。
- **背景**：`colorBgLayout` 或浅灰底，非白底更聚焦。

---

## 2. 状态

| 状态 | 表现 |
|---|---|
| 默认 | 灰底圆角，占位符提示 |
| 聚焦 | 底边/整框高亮 `colorPrimary`，出现取消 |
| 有值 | 显示清除图标，可触发搜索 |
| 禁用 | 灰化，禁输入 |

---

## 3. 跨端代码

PC（antd）：
```tsx
<Input.Search placeholder="搜索商品 / 订单号" allowClear
  onSearch={v => query(v)} enterButton={false} />
```

H5/RN（antd-mobile）：
```tsx
import { SearchBar } from 'antd-mobile';
<SearchBar placeholder="搜索商品 / 订单号" showCancelButton
  onSearch={v => query(v)} />
```

---

## 4. Do / Don't

- ✅ 占位符具体描述可搜内容
- ✅ 移动端有取消按钮收起键盘
- ✅ 圆角与端一致
- ❌ 占位符写"搜索"（无指引）
- ❌ 搜索栏无清除
- ❌ 每次输入都发请求（用 debounce 300ms）

---

## 5. 自检

- [ ] 占位符具体
- [ ] 清除 + 取消齐备
- [ ] 输入防抖（300ms）
- [ ] 圆角/底色符合端规范
