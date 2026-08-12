# 多端 UI/UX 设计系统

> **版本**: v1.2.0 | **更新日期**: 2026-08-11
> **技术栈**: React / React Native + Ant Design 全家桶
> **适用平台**: 移动端（iOS / Android / HarmonyOS）、PC Web、H5、微信小程序
> **定位**: 面向中型及以上项目的生产级设计系统，指导高保真设计与实际开发

---

## 系统定位

本设计系统不是一份「规范概览」，而是一套**可直接指导设计与开发协作的生产级标准**。它解决三件事：

1. **统一语言**：设计师和开发者基于同一套 Token、组件、模板沟通，消除「你说蓝我说浅蓝」的歧义。
2. **可落地**：每个组件都给出解剖结构、交互状态、变体矩阵和 AntD 代码映射，开发拿文档就能实现。
3. **可演进**：包含版本管理、Breaking Change 策略、设计走查与验收清单，保证中大型团队协作不腐化。

---

## 文档导航

```
docs/
├── README.md                   ← 你在这里（系统总览 + 导航）
│
├── 基础规范/                    ← 设计原子（Foundation）
│   ├── 设计原则.md
│   ├── 色彩系统.md
│   ├── 字体排版.md
│   ├── 间距与圆角.md
│   ├── 阴影与层级.md
│   ├── 图标系统.md
│   ├── 动效系统.md
│   ├── 栅格与布局.md
│   ├── 无障碍设计.md
│   └── 声音与触感反馈.md        ← 多通道反馈（震动/声音）
│
├── 组件库/                      ← 组件规格（Components）
│   ├── 组件总览.md             ← 组件分类矩阵 + 命名 + 跨端映射
│   ├── 通用/  Button Icon Typography ...
│   ├── 数据录入/  Input Select Form DatePicker Upload Switch ...
│   ├── 数据展示/  Table List Card Tag Avatar Badge ...
│   ├── 反馈/    Modal Drawer Message Notification ...
│   ├── 导航/    Menu Tabs Breadcrumb ...
│   └── 业务组件/                ← 领域组件（可直接复用）
│       ├── StatCard.md        ← 数据指标卡（KPI）
│       ├── OrderCard.md       ← 订单卡
│       ├── UserCard.md        ← 用户卡
│       ├── ProductCard.md     ← 商品卡
│       ├── NotificationItem.md← 通知项
│       ├── SearchBar.md       ← 搜索栏
│       └── FilterBar.md       ← 筛选栏
│
├── 页面模板/                    ← 页面骨架（Templates）
│   ├── 列表页.md
│   ├── 详情页.md
│   ├── 表单页.md
│   ├── 仪表盘.md
│   ├── 结果页.md
│   └── 设置页.md
│
├── 数据可视化/                  ← 图表规范（Dataviz）
│   ├── 图表色彩与色板.md        ← 分类/连续/发散色板 + 语义映射
│   ├── 图表元素规范.md          ← 坐标轴/网格/图例/tooltip/标签密度
│   └── 图表类型选择.md          ← 比较/构成/趋势/分布/关联选型
│
├── 工程落地/                    ← 工程实现（Engineering）
│   ├── Design Token 架构.md
│   ├── 主题切换实现.md
│   ├── 组件封装策略.md
│   ├── monorepo 与包管理.md
│   ├── 深浅色与多主题.md        ← 暗色/紧凑/品牌主题 + 无闪烁切换
│   └── 响应式与多设备适配.md    ← 断点/折叠屏/平板/横屏/安全区
│
├── 设计协作/                    ← 协作流程（Design Ops）
│   ├── Figma 组件库搭建.md
│   ├── 命名规范.md
│   ├── 设计走查清单.md
│   ├── 无障碍验收表.md
│   └── 版本与变更管理.md
│
├── 平台适配/                    ← 平台差异（Platforms）
│   ├── iOS.md
│   ├── Android.md
│   ├── HarmonyOS.md
│   ├── PC-Web.md
│   ├── H5.md
│   └── 微信小程序.md
│
├── 国际化与RTL.md               ← 文本膨胀/i18n key/RTL 镜像/格式
│
├── AI-设计系统上下文.md          ← AI 可执行摘要（MUST/NEVER + 精确 Token + 反模式 + 自检清单）
├── design-tokens.json            ← 机器可读 Token 单源（DTCG 格式，供 LLM / Style Dictionary）
├── design-tokens.ts             ← 类型化绑定（直接喂 antd ConfigProvider）
│
└── UX交互/                     ← 交互准则（Interaction）
    ├── 交互原则.md
    ├── 导航模式.md
    ├── 表单设计.md
    ├── 反馈机制.md
    ├── 异常与空状态.md
    ├── 加载与骨架屏.md          ← 骨架/shimmer/乐观更新/超时
    ├── 手势规范.md              ← tap/长按/滑动/下拉 + 平台差异
    ├── 引导与空状态插画.md      ← onboarding/coach mark/empty 插画
    └── 错误与文案体系.md        ← 错误分级/文案模板/errorCode 映射
```

---

## AI 消费入口（给 LLM / 编码 Agent）

本系统为 AI 生成器提供 **三层上下文**，按"从抽象到可执行"排列：

| 文件 | 用途 | 谁用 |
|---|---|---|
| `AI-设计系统上下文.md` | 角色约束 + 硬约束 + 精确 Token + 组件范式 + 反模式 + 自检清单 | 直接作为 system context 注入 |
| `design-tokens.json` | 单源 Token（DTCG 格式，含 color/font/space/radius/size/shadow/motion/z-index/breakpoint/platform） | LLM 直接 import；Style Dictionary / Tokens Studio 同步 |
| `design-tokens.ts` | 上面的类型化镜像，导出 `antdTokens`、`lightTheme`/`darkTheme`/`compactTheme` | 直接喂 `ConfigProvider` |

**AI 生成前必读**：`AI-设计系统上下文.md` 第 1 节（硬约束）+ 第 7 节（自检清单）。任何业务需求与本文档冲突时，**以文档为准**。

**工程接入示例**：
```tsx
import { ConfigProvider, App as AntdApp } from 'antd';
import { lightTheme } from './design-tokens';

export default () => (
  <ConfigProvider theme={lightTheme}>
    <AntdApp>{/* 业务 */}</AntdApp>
  </ConfigProvider>
);
```

---

## 文档分层模型（先读这段，避免"到底通不通用"的困惑）

本系统的所有内容严格分为**两层**。判断一条规范"多端能不能直接用"，先看它在哪层：

### ① 通用层（Common）—— 全端共用，写一次
> 与"端"无关的设计决策：Token、设计原则、交互准则、组件积木的定义、图表规范、错误文案、国际化基线。
> **这些端到端一致**，任何平台都直接套用，不存在"换个端就要改"。

| 目录 | 性质 | 说明 |
|---|---|---|
| `基础规范/` | 通用 | 色彩/字体/间距/圆角/阴影/图标/动效/栅格/无障碍/触感 —— 全端同一套 Token |
| `组件库/`（通用/数据录入/数据展示/反馈/导航 + 业务组件） | 通用定义 + 跨端映射 | 每个组件定义"是什么/状态/变体"，并标明在 antd/antd-mobile/antd-mini 各自的实现 |
| `UX交互/` | 通用 | 交互原则/导航/表单/反馈/加载/手势/引导/错误 —— 准则全端一致 |
| `数据可视化/` | 通用 | 色板/元素/选型全端一致（仅落地尺寸按端微调） |
| `国际化与RTL.md` | 通用 | 文本膨胀/i18n/RTL 基线全端一致 |
| `设计协作/` | 通用 | Figma/命名/走查/验收/版本 —— 协作流程与端无关 |

### ② 平台层（Platform）—— 各端独有，单独看
> 只在某端成立、或各端差异大到必须分写的规则：导航范式、手势预期、安全区、胶囊菜单、断点、组件落地差异。

| 目录 | 性质 | 说明 |
|---|---|---|
| `平台适配/`（iOS/Android/HarmonyOS/PC-Web/H5/微信小程序） | 平台专有 | 每端独立篇章，深度讲该端独有规则 |
| `工程落地/响应式与多设备适配.md` | 平台专有 | 折叠屏/平板/横屏/安全区/断点 |
| `页面模板/`（6 个） | **通用骨架 + 各端实例化** | 见下方说明 |

### ③ 页面模板的特殊定位：通用骨架，各端实例化
页面模板**不是"一个能直接跑全端的页面"**，而是**通用信息架构骨架**——它定义"这页该有什么区块、什么状态、什么 Do/Don't"，这些全端一致；但**具体落地组件因端而异**：

| 模板区块 | PC Web 落地 | 移动端 / H5 / 小程序 落地 |
|---|---|---|
| 列表数据区 | `Table` + `Pagination` | `List` + 触底加载（**禁用 Table**） |
| 顶部导航 | `Menu`（侧边/顶部） | `NavBar` + 底部 `TabBar` |
| 详情/编辑 | 右侧 `Drawer` / 同页 | 全屏 `Drawer`(bottom) / 新页 |
| 筛选 | 行内 `Form` + `Select` | 底部筛选 `Drawer` |

→ 所以：**模板结构通用，组件选型看端**。写某端页面时，先读模板骨架，再对照 `平台适配/<对应端>.md` 与组件库的"跨端映射"。

### 一句话判断法
> 凡是 Token / 原则 / 组件定义 / 交互准则 → **通用层，全端直接用**。
> 凡是导航范式 / 手势 / 安全区 / 胶囊 / 断点 / 组件落地选型 → **平台层，去 `平台适配/` 看对应端**。

---

## 阅读路径建议

| 角色 | 建议阅读顺序 |
|---|---|
| **设计师（新成员）** | 基础规范 → 组件总览 → 组件库 → 页面模板 → Figma 组件库搭建 → 命名规范 |
| **前端开发（新成员）** | 基础规范 → Design Token 架构 → 主题切换实现 → 组件库 → 组件封装策略 |
| **技术负责人 / Leader** | README → 工程落地（全部） → 设计协作 → 版本与变更管理 |
| **产品经理** | 设计原则 → UX交互 → 页面模板 → 异常与空状态 |
| **QA / 走查** | 设计走查清单 → 无障碍验收表 → 组件库（状态与变体） |

---

## 核心约定速览

| 维度 | 约定 |
|---|---|
| 主色 | `#1677FF`（AntD Daybreak Blue） |
| 基础字号 | 14px（PC）/ 16px（移动端） |
| 基础间距 | 8px 基数（y = 8 + 8n） |
| 基础圆角 | 6px（PC）/ 8px（移动端） |
| 栅格 | PC 24 列 / 移动端 4 列 |
| 深色模式 | `theme.darkAlgorithm` 自动派生 |
| 组件库 | antd（PC）/ antd-mobile（H5·RN）/ antd-mini（小程序） |
| 断点 | 480 / 576 / 768 / 992 / 1200 / 1600 / 1920 |

---

## 如何使用本系统

1. **设计阶段**：在 Figma 中只使用本系统组件库中的组件与 Token，禁止手绘临时样式。
2. **开发阶段**：通过 `ConfigProvider` 消费统一 Token，禁止在业务代码里写死颜色/间距魔法值。
3. **评审阶段**：对照「设计走查清单」与「无障碍验收表」逐项验收。
4. **变更阶段**：任何 Token / 组件 API 修改走「版本与变更管理」流程，发版须升级版本号。

---

## 版本号规范

采用语义化版本 `MAJOR.MINOR.PATCH`：

- **MAJOR**：破坏性变更（Token 改名、组件 API 移除、栅格重构）
- **MINOR**：新增组件/变体/平台支持，向后兼容
- **PATCH**：文案修正、示例补充、非破坏性微调

> 完整变更记录见 [版本与变更管理.md](设计协作/版本与变更管理.md)。

---

## 参考文档

| 文档 | 链接 |
|---|---|
| Ant Design 设计规范 | https://ant.design/docs/spec/overview |
| Ant Design 主题定制 | https://ant.design/docs/react/customize-theme |
| Ant Design Mobile | https://mobile.ant.design |
| Apple HIG | https://developer.apple.com/cn/design/human-interface-guidelines |
| Material Design 3 | https://m3.material.io |
| HarmonyOS 设计指南 | https://developer.huawei.com/consumer/cn/doc/design-guides |
| 微信小程序设计指南 | https://developers.weixin.qq.com/miniprogram/design/ |
| WCAG 2.1 | https://www.w3.org/TR/WCAG21/ |
