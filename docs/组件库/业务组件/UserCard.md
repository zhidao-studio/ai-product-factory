# 业务组件：用户卡（UserCard）

> 模块：组件库 / 业务组件 ｜ 复用：Card + Avatar + Tag + Button
> 用途：成员列表、客户管理、通讯录、我的资料；展示用户身份与关键操作。

---

## 1. 解剖结构

```
┌─────────────────────────────┐
│ (Avatar)  张三               │  ← 头像 + 姓名(主) + 角色(副)
│            产品经理 · 在线    │
│ ───────────────────────────  │
│ [标签:VIP] [标签:团队A]       │  ← 角色/分组标签
│                    发消息     │  ← 主操作(右对齐)
└─────────────────────────────┘
```

- **头像**：PC 40px / 移动端 48px，圆角 `radius.circle`(50%)；缺省用首字母或默认图。
- **在线状态**：头像右下角 10px 圆点（绿=在线 / 灰=离线 / 黄=忙碌 / 红=勿扰）。
- **姓名**：`colorText` 14~16px medium；副标题 `colorTextSecondary`。
- **标签**：用 `Tag`，≤ 3 个。

---

## 2. 变体

| 变体 | 用途 |
|---|---|
| 列表型 | 通讯录、成员选择（左头像右操作） |
| 详情型 | 我的资料（大头像 + 完整字段 + 编辑） |
| 选择型 | 多选成员（带 Checkbox / 点击选中态） |

---

## 3. 跨端代码（antd）

```tsx
import { Avatar, Tag, Button, Badge } from 'antd';

<List.Item
  prefix={<Badge dot color={statusColor[u.status]} offset={[-4,-4]}>
            <Avatar src={u.avatar} size={48}>{u.name[0]}</Avatar>
          </Badge>}
  description={`${u.role} · ${statusText[u.status]}`}
  extra={<Button type="link" size="small">发消息</Button>}
>{u.name}</List.Item>
```

---

## 4. Do / Don't

- ✅ 头像缺省兜底（首字母），不裂图
- ✅ 在线状态用统一色点
- ✅ 标签 ≤ 3，来自数据而非手写
- ❌ 头像方形无圆角
- ❌ 姓名用非 Token 色
- ❌ 列表里塞 > 1 个主按钮

---

## 5. 自检

- [ ] 头像圆角 circle、有缺省态
- [ ] 在线状态色点符合映射
- [ ] 标签 ≤ 3 且语义化
- [ ] 主操作唯一
