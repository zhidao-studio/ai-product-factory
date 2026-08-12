# 业务组件：通知项（NotificationItem）

> 模块：组件库 / 业务组件 ｜ 复用：List.Item + Badge + Avatar + 时间
> 用途：站内信、消息中心、系统通知列表。

---

## 1. 解剖结构

```
┌─────────────────────────────────┐
│ (图标) 系统通知        10:24     │  ← 左图标(类型) + 标题 + 时间(右)
│   您提交的工单 #1234 已处理完成    │  ← 摘要(最多两行) + 未读圆点
│                      查看详情 >   │
└─────────────────────────────────┘
```

- **类型图标**：系统=info 蓝 / 成功=success 绿 / 警告=warning 黄 / 危险=error 红。
- **未读**：标题左侧 8px 蓝点 `colorPrimary`，整行浅底 `colorPrimaryBg`(淡蓝)。
- **时间**：`colorTextTertiary` 12px，相对时间优先（"10分钟前"）。
- **摘要**：`colorTextSecondary`，两行截断。

---

## 2. 变体

| 变体 | 用途 |
|---|---|
| 标准列表 | 消息中心主页 |
| 横幅提醒 | 顶部下拉（结合 Notification 组件） |
| 极简 | 设置页"通知"子项（无摘要） |

---

## 3. 跨端代码（antd）

```tsx
import { List, Badge, Typography } from 'antd';

<List.Item
  prefix={<Badge status={typeBadge[n.type]} />}
  style={n.unread ? { background: 'var(--color-primary-bg)' } : undefined}
  extra={<span className="time">{relativeTime(n.time)}</span>}
  onClick={() => read(n.id)}
>
  <div className="noti-title">{n.title}</div>
  <div className="noti-desc">{n.summary}</div>
</List.Item>
```

---

## 4. Do / Don't

- ✅ 未读态明确（蓝点 + 浅底）
- ✅ 类型用语义图标色
- ✅ 时间用相对时间
- ❌ 未读用刺眼背景（用淡 primary 底）
- ❌ 摘要无限行
- ❌ 时间用绝对时间且无"今天/昨天"折叠

---

## 5. 自检

- [ ] 未读态 = 蓝点 + 淡底
- [ ] 类型图标语义色正确
- [ ] 时间相对化
- [ ] 摘要两行截断
