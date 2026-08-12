# Figma 组件库搭建

> 设计师的唯一工作源。组件库结构对齐本系统文档，保证设计与开发 1:1 对应。

---

## 1. 库结构

```
Library（团队库）
├── Variables（变量）        ← 对应 Design Token
│   ├── Color / Primitive
│   ├── Color / Semantic
│   ├── Spacing / Radius
│   ├── Typography
│   └── Shadow / Motion
├── Styles（样式）
│   ├── Text Styles（字号梯度）
│   └── Effect Styles（阴影梯度）
└── Components（组件）
    ├── General（Button/Tag/...）
    ├── Data Entry（Input/Select/...）
    ├── Data Display（Table/Card/...）
    ├── Feedback（Modal/Drawer/...）
    └── Navigation（Menu/Tabs/...）
```

---

## 2. Variables 同步 Token

- Figma Variables 与 `packages/tokens` 同源生成
- 使用 Tokens Studio 双向同步，避免漂移
- 颜色用 Semantic 层绑定（如 `colorPrimary`），不直接填 `#1677FF`
- 模式（Mode）：light / dark 切换

---

## 3. 组件构建规范

- 每个组件 = 一个 Figma Component，含所有 Variant（状态/尺寸/类型）
- 用 Auto Layout 保证间距来自 Token
- 用 Variables 绑定颜色/圆角/间距（非固定值）
- 暴露属性（Component Properties）：Type / Size / Status / Disabled

---

## 4. 组件命名（对齐 [命名规范](命名规范.md)）

```
Button/Primary/Large
Input/Default/Error
Modal/Confirm
```
格式：`组件名/变体/状态`

---

## 5. 发布与版本

- 组件库发布为 Team Library
- 变更走 Figma 版本（`/versions`）
- 重大变更通知开发（同步 [版本与变更管理](版本与变更管理.md)）

---

## 6. 设计交付

- 高保真稿只使用库组件（禁止手绘临时样式）
- 交付时标注交互状态与边界情况
- 交付物：Figma 链接 + 本系统组件文档引用

---

## 7. 规则

- ❌ 禁止在设计稿硬编码色值（必须用 Variable）
- ✅ 新组件先写文档（[组件库](../组件库/组件总览.md)）再建 Figma
- ✅ Token 变更先改 `packages/tokens`，再同步 Figma

---

## 8. 关系
- [Design Token 架构](../工程落地/Design Token 架构.md) — 同源
- [命名规范](命名规范.md) — 命名
