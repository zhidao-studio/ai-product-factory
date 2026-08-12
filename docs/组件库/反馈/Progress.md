# Progress 进度条

> 展示确定时长的任务进度。

---

## 1. 变体
- 线型（默认，带百分比）
- 圆形（下载/上传，中心显百分比）
-  Steps 型（分阶段）
- 环形（仪表盘）

## 2. 状态
progress(进行中,主色) / success(完成,成功色) / exception(错误,错误色,可重试)。

## 3. Do / Don't
- ✅ 已知时长用 Progress，未知用 Spin
- ✅ 异常态提供重试
- ❌ 进度不更新（假进度降低信任）

## 4. 代码
```tsx
<Progress percent={70} status="active" />
<Progress type="circle" percent={50} />
```

## 5. 关系
- [Spin](Spin.md) — 未知时长
- [色彩系统](../基础规范/色彩系统.md) — 状态色
