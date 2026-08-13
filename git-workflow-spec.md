# Git 分支与提交规范（GitHub Flow 官方对齐版）

> 本规范对齐 **GitHub 官方推荐的 GitHub Flow**：单一主干 `main` + 短期特性分支 + PR 协作。
> 面向「人类 + AI 协作」编写，规则明确、可机械执行，AI 据此即可正确完成分支、提交、PR、合并。

---

> **当前落地状态：** 本仓库尚未配置 GitHub Actions 和强制状态检查。本文件中的 CI/分支保护条款是目标治理规则；现阶段按 `CONTRIBUTING.md` 执行本地构建、PR 记录和人工评审门禁。

## 0. 一句话总览（AI 速记）

- **只有一条常驻分支 `main`**，且 `main` 永远是可发布的（生产就绪）。
- 任何改动都从 `main` 拉一个 **短期特性分支**，改完开 **PR 回 `main`**，评审通过即合并。
- **没有** `develop` / `release` / `hotfix` 这类长存分支（紧急修复也走同一套）。
- 人工创建的分支描述、提交信息、PR 标题使用中文；Codex 桌面端任务分支允许工具固定的 `codex/` 命名空间。
- 合并默认用 **Squash**，保持 `main` 历史干净线性。
- 发版 = 给 `main` 上某个 commit 打 `vX.Y.Z` tag 并建 Release。

---

## 1. 分支模型（GitHub Flow）

GitHub Flow 只有「一条主干 + 临时分支」，**不区分测试/生产分支**，靠 `main` 常驻可发布 + 保护规则保证质量。

| 分支类型 | 分支名格式 | 来源 | 合并目标 | 生命周期 | 可直推 |
|---------|-----------|------|---------|---------|-------|
| 主干 | `main` | — | — | 永久 | 否（仅 PR 合入，且受保护） |
| 特性分支 | `feature/xxx` | `main` | `main` | 短期（合即删） | 否 |
| 修复分支 | `fix/xxx` | `main` | `main` | 短期 | 否 |
| 优化分支 | `refactor/xxx` | `main` | `main` | 短期 | 否 |
| 文档分支 | `docs/xxx` | `main` | `main` | 短期 | 否 |
| 治理分支 | `chore/xxx` | `main` | `main` | 短期 | 否 |
| 实验分支 | `experiment/xxx` | `main` | `main` | 短期 | 否 |
| Codex 任务分支 | `codex/xxx` | `main` | `main` | 短期 | 否 |

### 1.1 分支交互图

```
        main  (永远可发布 / 受保护)
          ▲   ▲   ▲   ▲
          │   │   │   └─ experiment/xxx ─┐
          │   │   └───── docs/xxx ───────┤
          │   └──────── fix/xxx ─────────┤
          └──────────── feature/xxx ─────┘
            （全部从 main 拉出，PR 回 main，合完即删）
```

> 图中只列常见分支作为交互示意；`refactor`、`chore` 和 `codex` 的来源、合并目标与生命周期完全相同。

**交互规则：**
1. 想改代码，第一步永远：`git checkout main && git pull`，再 `git checkout -b feature/xxx`。
2. 分支只和 `main` 单向交互：拉出来 → PR 回 `main`。不在分支间互相合并。
3. 开发中途若 `main` 变了，用 `git rebase main` 把本地提交接到最新 `main` 之上（保持线性）。
4. 合入 `main` 即代表可发布；发版时直接在 `main` 上打 tag，不再开 release 分支。
5. 紧急修复、实验性改动，**流程完全一样**，只是优先级更高、分支名不同。

### 1.2 main 保护规则（CI 建成后的目标态）

在仓库 Settings → Branches 给 `main` 设保护（GitHub 官方最佳实践）：
- ✅ Require a pull request before merging（禁止直推）
- ✅ Require approvals（至少 1 名 reviewer，可设 2）
- ✅ Require status checks to pass（CI 构建/lint/测试全绿）
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypass（含 admin 也不绕过）
- ✅ 合并后自动删源分支（Auto-delete head branches）

---

## 2. 分支命名规范

格式：`<类型>/<简短中文描述-连字符>`

- 人工分支类型：`feature` / `fix` / `refactor` / `docs` / `chore` / `experiment`。
- 描述 **中文**，多词用 **连字符 `-`**，小写，无空格、无下划线。
- 要能一眼看懂做了什么，建议 ≤ 20 字。
- GitHub Flow 本身不强求类型前缀，但为清晰我们保留前缀。
- Codex 桌面端自动管理的任务分支使用 `codex/<简短描述>`，这是工具命名空间例外，不改变分支来源、PR、评审和 Squash 合并规则。

| 正确示例 | 错误示例 |
|---------|---------|
| `feature/登录页表单校验` | `feature_login` ✗（格式错） |
| `fix/支付金额精度丢失` | `fix2` ✗（含糊） |
| `refactor/订单服务拆分` | `refactor/order` ✗（含糊） |
| `docs/接口文档补充` | `doc` ✗（格式错） |
| `chore/后端目录收口` | `chore_backend` ✗（格式错） |
| `codex/admin-modules-governance` | `codex_admin` ✗（格式错） |

---

## 3. 提交信息规范（Commit Message）

采用 **中文版 Conventional Commits**（GitHub 原生兼容此格式）。

格式：`<类型>(<作用域>): <中文主题>` + 空行 + `<正文>`

### 3.1 提交类型

| 类型 | 含义 | 何时用 |
|-----|------|-------|
| `feat` | 新增功能 | 用户可见的新能力、新页面、新接口 |
| `fix` | 修复缺陷 | Bug、崩溃、逻辑错误 |
| `refactor` | 重构 | 不改外部行为，只改内部结构 |
| `perf` | 性能优化 | 提速、降内存、减请求 |
| `docs` | 文档 | README、注释、wiki，不涉及逻辑 |
| `style` | 格式 | 空格、缩进、分号、命名等不影响运行 |
| `test` | 测试 | 增删用例、mock、测试工具 |
| `build` | 构建 | 依赖、打包、CI 脚本 |
| `ci` | 持续集成 | pipeline 配置 |
| `chore` | 杂项 | 其他不归类的琐事 |
| `revert` | 回滚 | 撤销某次提交 |

### 3.2 作用域（scope，可选）

括号里写受影响模块/页面/服务中文名，如 `feat(登录页):`、`fix(订单服务):`。跨多模块可省略。

### 3.3 主题（subject）

- 祈使句中文（「新增」「修复」「优化」），结尾 **不加句号**。
- 说结果不说过程，≤ 30 字。
- ✅ `fix(登录): 修复验证码倒计时不重置` ✗ `fix(登录): 改了下倒计时`

### 3.4 正文（body，可选）

空一行后写：为什么改、怎么改、注意事项。多行用 `-` 列点。复杂/有风险改动必写。

### 3.5 完整模板

```
<类型>(<作用域>): <中文主题>

<正文：为什么改、怎么改、注意事项（可选）>

<尾部：关联 Issue/需求单，如 Closes #123 / 需求单 PRJ-456>
```

### 3.6 示例

```
feat(登录页): 新增手机号一键登录

- 接入运营商本机号码校验 SDK
- 失败降级到短信验证码
- 仅支持国内手机号

需求单 PRJ-789
```

```
fix(订单服务): 修复并发下单库存超卖

改用数据库行锁替代内存计数，避免高并发超卖。

Closes #234
```

### 3.7 提交纪律（AI 必须遵守）

- **一个提交只做一件事**，不混「新功能 + 顺手格式化 + 改注释」。
- 禁止 `git commit -m "update"` / `"fix"` / `"改好了"`。
- 提交前自测通过（能编译/能跑/单测过），不留半成品。
- 属同一逻辑可合并一提交；属不同逻辑拆多提交。

---

## 4. PR（Pull Request）流程

### 4.1 何时开 PR

- 特性分支开发完成、自测通过、commit 符合规范后，开 PR 回 `main`。
- 一个 PR 聚焦 **一个主题**，不做巨型 PR（>800 行建议拆）。

### 4.2 PR 标题规范

格式：`<类型>: <中文描述>`（与首条 commit 对齐），例如：
- `feat: 登录页新增手机号一键登录`
- `fix: 订单服务修复库存超卖`
- `refactor: 支付模块抽离网关适配层`

### 4.3 PR 描述模板（必填）

```markdown
## 改动说明
<!-- 中文说清楚做了什么、为什么 -->

## 改动类型
<!-- 勾选：feat / fix / refactor / perf / docs / test / build / ci / chore -->

## 自测情况
- [ ] 本地编译/运行通过
- [ ] 相关功能手动验证通过
- [ ] 单元测试通过（如有）
- [ ] 不影响其他模块

## 关联
<!-- 需求单 / Issue：PRJ-789 / Closes #234 -->

## 注意事项 / 风险
<!-- reviewer 需特别关注的点，没有写「无」 -->
```

### 4.4 评审与合并规则

1. 至少 **1 名 reviewer 通过**（团队可设 2）。
2. CI 建成后必须全绿才能合并；当前未配置 CI 时，必须在 PR 中记录受影响范围的本地构建、检查结果和人工评审结论。
3. 合并方式：默认 **Squash and merge**，把多个小提交压成一个干净提交进 `main`，squash 信息按第 3 节规范写。需保留完整历史时用 **Rebase and merge**。
4. 合并后 **自动删除源分支**（开启 Auto-delete）。
5. 冲突先在自己分支 `git rebase main` 解决再重新 push，不在 PR 留冲突。

---

## 5. 发版与版本号（GitHub Releases）

GitHub Flow 不发版分支，直接在 `main` 上打 tag 建 Release。

### 5.1 版本号（SemVer）

格式：`主版本.次版本.修订号`（`1.2.3`）

| 变更 | 规则 | 示例 |
|-----|------|------|
| 主版本 | 不兼容变更 | `1.2.3 → 2.0.0` |
| 次版本 | 向下兼容新功能 | `1.2.3 → 1.3.0` |
| 修订号 | 向下兼容缺陷修复 | `1.2.3 → 1.2.4` |

### 5.2 发版步骤

```bash
git checkout main && git pull
git tag -a v1.3.0 -m "v1.3.0 发布说明"
git push origin main --tags
# 去 GitHub → Releases → Draft a new release，选 v1.3.0，写中文 Release Notes
```

- Tag 必须带 `v` 前缀，与版本号一致。
- Release Notes 中文：本次新增 / 修复 / 已知问题。
- 紧急修复发版：`fix/xxx` 合入 `main` 后打补丁号 tag（如 `v1.2.1`）。

---

## 6. 实际 Git 命令速查

### 6.1 开新分支
```bash
git checkout main
git pull origin main
git checkout -b feature/登录页表单校验
```

### 6.2 中途同步 main（保持线性）
```bash
git fetch origin
git rebase origin/main
# 有冲突 → 解决 → git add <文件> → git rebase --continue
```

### 6.3 暂存与提交
```bash
git add src/login/Form.vue        # 只加相关文件，禁止 git add -A
git commit -m "feat(登录页): 新增表单实时校验"
```

### 6.4 推远端 + 开 PR
```bash
git push -u origin feature/登录页表单校验
# 去平台开 PR 到 main
```

### 6.5 合并后清理（若未自动删）
```bash
git checkout main && git pull
git branch -d feature/登录页表单校验
git push origin --delete feature/登录页表单校验
```

### 6.6 发版
```bash
git checkout main && git pull
git tag -a v1.3.0 -m "v1.3.0"
git push origin main --tags
```

---

## 7. 代码评审清单（Reviewer 与 AI 自检）

**规范性**
- [ ] 分支名、PR 标题、commit 符合第 2、3、4 节
- [ ] 一个 PR 一个主题，无巨型 PR
- [ ] 关联需求单 / Issue

**正确性**
- [ ] 逻辑正确，边界（空值/0/超长/并发）已处理
- [ ] 无硬编码密钥、密码、token
- [ ] 无调试残留（console.log、测试桩、无说明的 TODO）
- [ ] 无不明显的性能问题（N+1、重复渲染、内存泄漏）

**质量**
- [ ] 命名清晰，符合项目风格
- [ ] 必要注释（解释「为什么」）
- [ ] 错误处理合理，不吞异常
- [ ] UI 改动符合多端规范（iOS/Android/HarmonyOS/Web/H5/小程序）

**测试与安全**
- [ ] 关键逻辑有单测或手动验证
- [ ] 用户输入有校验转义（防 XSS/SQL 注入）
- [ ] 权限、鉴权逻辑未弱化

---

## 8. 冲突解决与回滚

### 8.1 冲突解决（PR 不留冲突）
1. 自己分支 `git fetch origin && git rebase origin/main`。
2. 逐文件解决，保留正确逻辑，**不整段删他人代码**。
3. `git add <文件> && git rebase --continue` 直到完成。
4. `git push --force-with-lease`（仅自己分支可强推）。
5. 回 PR 确认 CI 重跑通过。

### 8.2 提交回滚
- **未推远端**：`git reset --soft HEAD~1`（保留改动）或 `git commit --amend`。
- **已推远端需撤销**：`git revert <commit>`，生成新提交、保留历史。**禁止**共享分支用 `git reset --hard` 改历史。
- **合并后出问题**：revert 合并提交，或重新发 `fix/` 分支。

### 8.3 AI 禁止事项（硬性红线）
- ❌ 禁止直推 `main`。
- ❌ 禁止 `git add -A` / `git commit -a -m "update"`。
- ❌ 禁止 `git push --force` 到 `main`（自己分支也只用 `--force-with-lease`）。
- ❌ 禁止提交密钥、token、个人信息。
- ❌ 禁止一个 commit 混多个不相关改动。
- ❌ 禁止无意义提交信息。
- ❌ 禁止绕过已配置的 CI / review 自行合并；CI 建成前不得跳过规定的本地验证和人工评审。

---

## 9. 速查表（机器可读摘要）

```yaml
model: github-flow
trunk:
  - main          # 唯一常驻分支，永远可发布，受保护
branch_prefix:
  feature:    { from: main, to: main }
  fix:        { from: main, to: main }
  refactor:   { from: main, to: main }
  docs:       { from: main, to: main }
  chore:      { from: main, to: main }
  experiment: { from: main, to: main }
  codex:      { from: main, to: main }
naming:
  branch: "<type>/<chinese-dash-separated> | codex/<tool-description>"
  pr_title: "<type>: <chinese-desc>"
commit:
  format: "<type>(<scope>): <chinese-subject>"
  types: [feat, fix, refactor, perf, docs, style, test, build, ci, chore, revert]
  rules:
    - subject 祈使句中文，不加句号，≤30字
    - one commit one thing
    - 禁止无意义 message
merge:
  target: main
  method: squash
  require_current: [local_verification, reviewer_approved]
  require_target: [ci_green, reviewer_approved, branch_protection]
  post: auto_delete_branch
release:
  from: main
  tag_format: "vX.Y.Z"
  notes: 中文 Release Notes
protection:
  main:
    status: planned_until_ci_is_available
    rules:
      - require_pull_request
      - require_approvals(>=1)
      - require_status_checks
      - require_up_to_date
      - no_bypass
      - auto_delete_head
```

---

_本规范对齐 GitHub 官方 GitHub Flow，AI 与人类开发者均须遵守。后续如需调整，修改本文档并同步通知。_
