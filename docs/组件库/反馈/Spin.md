# Spin 加载

> 局部/全局加载指示，必须有动画（避免"卡死"错觉）。

---

## 1. 变体
- 内联 Spinner（按钮 loading）
- 局部包裹（Spin 包裹内容区）
- 全屏遮罩（全局操作）
- 圆点加载（antd-mobile `DotLoading`，移动端常用）

## 2. 状态
旋转动画持续；文字可选（"加载中..."）。

## 3. Do / Don't
- ✅ 加载 > 300ms 显 Spinner，< 300ms 可忽略
- ✅ 首屏用 Skeleton 而非 Spin（见 [加载状态](../UX交互/反馈机制.md)）
- ❌ 无动画（用户以为卡死）
- ❌ 同时多加载动画堆叠

## 4. 代码
```tsx
<Spin spinning={loading}><Content /></Spin>
<Button loading={submitting}>提交</Button>
```

## 5. 关系
- [加载状态](../UX交互/反馈机制.md) — 加载策略
- [动效系统](../基础规范/动效系统.md) — 持续动画
