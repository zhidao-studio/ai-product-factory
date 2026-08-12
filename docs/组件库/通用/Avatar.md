# Avatar 头像

> 标识用户/实体，图形或文字。

---

## 1. 解剖
```
┌────┐
│ ◯  │  圆形容器, 内图标/图片/文字首字
└────┘
```

## 2. 变体
- 图片头像
- 图标头像（无图时）
- 文字头像（姓名首字，背景取色板）
- 带角标（Badge 显示在线状态）

## 3. 尺寸梯度
- 小 24 / 中 32 / 大 40 / 超大 64 / 圆形

## 4. 形状
默认圆形；方形可选（`shape="square"`）。

## 5. Do / Don't
- ✅ 图片加载失败回退图标
- ✅ 多用户用 Avatar.Group 叠加（显示前 N + 剩余数）
- ❌ 头像变形拉伸（object-fit cover）

## 6. 代码
```tsx
<Avatar src={url} size={40}>U</Avatar>
<Avatar.Group>{users.map(u => <Avatar key={u.id} src={u.avatar} />)}</Avatar.Group>
```

## 7. 关系
- [Badge](Badge.md) — 在线状态
- [List](List.md) — 列表项前缀
