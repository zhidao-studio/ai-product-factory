# Switch 开关

> 表示二元状态的开/关，即时生效（无需提交）。

---

## 1. 解剖
```
○─────  (关, 灰)      ─────●  (开, 主色)
```
滑块 + 轨道；开态主色填充，关态灰。

## 2. 状态
Default / Disabled / Loading(请求中旋转)。

## 3. 尺寸
PC 宽 44 高 22；移动端 51×31（更大热区）。

## 4. Do / Don't
- ✅ 即时生效操作用 Switch（如"接收通知"）
- ✅ 延迟生效显示 loading
- ❌ 用 Switch 代替 Radio（多选一用 Radio）
- ❌ 开关旁无 Label 说明含义

## 5. 代码
```tsx
<Switch checked={on} loading={loading} onChange={toggle} />
```

## 6. 关系
- [Checkbox](Checkbox.md) — 多选
- [Radio](Radio.md) — 单选
