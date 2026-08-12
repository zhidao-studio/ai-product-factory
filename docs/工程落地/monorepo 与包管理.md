# monorepo 与包管理

> 中大型项目用 monorepo 统一管理设计系统包、业务包与多端应用。

---

## 1. 仓库结构（pnpm + Turborepo 推荐）

```
repo/
├── packages/
│   ├── tokens/          # Design Token (TS + CSS 变量产物)
│   ├── antd-theme/      # antd ThemeConfig 封装
│   ├── ui/              # 业务通用组件库 (基于 antd)
│   ├── ui-mobile/       # 移动端组件 (基于 antd-mobile)
│   └── icons/           # 自定义 SVG 图标组件
├── apps/
│   ├── web-admin/       # PC 中后台
│   ├── h5/              # H5 (antd-mobile)
│   └── mini/            # 微信小程序 (antd-mini / Taro)
└── package.json (root, workspaces)
```

---

## 2. 包依赖关系

```
tokens  ←  antd-theme  ←  ui / ui-mobile  ←  apps
```

- `tokens` 不依赖任何 UI 库（纯数据）
- 各端 theme 引用同一 `tokens`
- 业务组件依赖对应端 antd + tokens

---

## 3. 工具链

| 工具 | 用途 |
|---|---|
| pnpm | 高效包管理 + workspace |
| Turborepo | 任务编排（build/lint/test 缓存） |
| Changesets | 版本与 CHANGELOG 自动生成 |
| TypeScript | 类型共享 |
| Style Dictionary / Tokens Studio | Token 多端产物生成 |

---

## 4. 版本与发布

- 每个包独立语义化版本
- `changeset` 记录变更 → 发版自动更新 CHANGELOG
- 设计 Token 变更触发所有消费包 CI 校验
- 发版前跑 [设计走查清单](../设计协作/设计走查清单.md) 关联检查

---

## 5. 多端代码共享

- 业务逻辑（hooks/store）：跨端共享（如 `apps/*` 引用 `packages/logic`）
- UI 组件：按端分别（antd / antd-mobile / antd-mini）
- Token：唯一来源，各端消费

---

## 6. CI 检查

- [ ] Token 与 Figma 一致性（脚本比对）
- [ ] 组件无硬编码色值（lint 规则）
- [ ] 无障碍自动化测试（axe）
- [ ] 视觉回归（Chromatic / 截图对比）

---

## 7. 规则

- ✅ Token 单一来源，禁止各端复制
- ✅ 发版走 changeset，写变更说明
- ❌ 业务包直接依赖 antd 内部未导出 API
- ❌ 跨端复制组件（抽为共享包）

---

## 8. 关系
- [Design Token 架构](Design Token 架构.md) — 单一来源
- [组件封装策略](组件封装策略.md) — 业务组件包
- [版本与变更管理](../设计协作/版本与变更管理.md) — 变更流程
