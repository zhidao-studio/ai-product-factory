# 业务需求工作区

`specs/` 只存放用户提出的真实业务需求。这里不是技术方案示例库，也不为展示 Spec Kit
预建虚构功能。每项需求先把业务说清楚，再逐步进入工程计划和实施。

## 一项需求包含什么

```text
specs/<编号-短名称>/
├── spec.md                    # 业务需求：为什么、谁、场景、规则、验收、范围
├── checklists/
│   └── requirements.md        # 需求质量审查，不代表实现进度
├── plan.md                    # 需求确认后的工程翻译
└── tasks.md                   # 计划确认后的执行任务
```

以下工件都不是必选项：

- `research.md`：仅在存在需要一手证据的真实技术决策时创建。
- `data-model.md`：仅在数据结构或生命周期发生变化时创建。
- `contracts/`：仅在外部或跨工程契约发生变化时创建。
- `quickstart.md`：仅在需要新的可复现运行或验收步骤时创建。

没有真实内容时不要创建空文件或目录。

## 标准流程

1. 用户直接用业务语言描述需求，运行 `$speckit-specify` 生成 `spec.md` 草稿。
2. 只有会改变业务范围、规则或验收结果的歧义才运行 `$speckit-clarify`；不得向用户发起
   框架、数据库、接口或目录问卷。
3. 运行结构检查：

   ```sh
   node .specify/scripts/verify-specs.mjs specs/<编号-短名称>
   ```

4. 用户审阅需求和 `checklists/requirements.md`。问题关闭、清单全部审查通过后，用户明确
   确认需求，将 `spec.md` 状态改为“已确认”，再运行严格门禁：

   ```sh
   node .specify/scripts/verify-specs.mjs specs/<编号-短名称> --ready
   ```

5. 运行 `$speckit-plan`。方案必须从真实代码、`CLAUDE.md`、设计系统与版本基线中取证；
   计划由用户单独确认。
6. 运行 `$speckit-tasks`，按 US/BR/AC 生成带真实路径和验证方式的任务；任务由用户单独确认。
7. 运行 `$speckit-analyze`。所有 CRITICAL/HIGH 问题解决或由用户明确接受后，仍需用户在
   当前任务中明确授权实施，才能运行 `$speckit-implement`。
8. 实施后逐条验证 AC 并保留证据；若代码与工件未收敛，运行 `$speckit-converge` 追加真实
   剩余任务，不静默扩大范围。

不要使用一键 workflow 合并或跳过这些人工确认点。确认需求、确认计划、确认任务和授权实施
是四个不同决定，前一个决定不能自动代表后一个。

进入 Analyze 及后续阶段前，使用完整工件门禁核对三份确认记录：

```sh
node .specify/scripts/verify-specs.mjs specs/<编号-短名称> --artifacts-ready
```

## Spec 怎么写

`spec.md` 只保留以下内容：

- 背景与目标
- 使用者与场景（`US-xxx`）
- 业务规则（`BR-xxx`）
- 验收标准（`AC-xxx`）
- 范围与非目标
- 待确认问题

接口路径、请求字段、表结构、工程目录、框架选择、类名和实现任务属于 `plan.md` 或
`tasks.md`。AI 不能因为“通常这样做”把它们写进需求，也不能根据页面反推不存在的后端契约。

## 依据与冲突处理

- 业务意图以用户当前指令和已确认 `spec.md` 为准；需求变化后必须更新并重新确认。
- 当前实现以真实 Controller、VO、POM、配置、SQL 和源代码为准。
- 工程边界与编码约束以 [`../CLAUDE.md`](../CLAUDE.md) 为准。
- UI 以 [`../docs/AI-设计系统上下文.md`](../docs/AI-设计系统上下文.md)、设计 Token 和对应
  平台适配文档为准。
- 版本与当前完成度分别以 [`../docs/工程版本基线.md`](../docs/工程版本基线.md) 和
  [`../docs/工程现状.md`](../docs/工程现状.md) 为准。

依据冲突时停在当前门禁，向用户说明冲突和影响；不要选择更方便的结论继续实现。

## 并行需求

一个工作区一次只维护一个活动 Feature。并行需求使用独立 Git worktree，或在每次命令中
显式指定对应 Feature 目录；不要依赖机器本地的活动 Feature 指针跨需求操作。
