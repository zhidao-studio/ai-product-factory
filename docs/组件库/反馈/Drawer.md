# Drawer 抽屉

> 抽屉从屏幕边缘滑入，比 Modal 承载更多内容且不阻断全局视野。

---

## 1. 概述

用于：详情查看、复杂表单、筛选面板。适合内容较多、需对照原页面的场景。

---

## 2. 解剖结构

```
┌──────────┬───────────────────────────┐
│          │ 标题                  [×]  │ ← Header
│  原页面   ├───────────────────────────┤
│  (遮罩)   │ 内容区（可长滚动）         │ ← Body
│          │                           │
│          ├───────────────────────────┤
│          │ [取消]        [保存]       │ ← Footer ( sticky )
└──────────┴───────────────────────────┘
```

---

## 3. 方向（position）

| 方向 | 场景 |
|---|---|
| right | 默认，详情/编辑（PC） |
| left | 导航/筛选 |
| top / bottom | 移动端全屏表单常用 bottom |

---

## 4. 状态

- Open：从侧滑入（300ms easeOut）
- Close：滑出（300ms）
- 遮罩半透明，点击关闭
- 内容长时内部滚动，Footer sticky 底部

---

## 5. 尺寸

| 尺寸 | 宽度 | 说明 |
|---|---|---|
| default | 378px | 常规 |
| large | 736px | 宽屏编辑 |
| full | 100vw/vh | 移动端全屏 |

---

## 6. Do / Don't

**Do**
- ✅ 内容多、需对照原页面用 Drawer
- ✅ 移动端用 bottom 全屏抽屉
- ✅ Footer 操作区 sticky

**Don't**
- ❌ 简单确认用 Drawer（用 Modal）
- ❌ Drawer 内再嵌套 Modal（层级混乱）

---

## 7. 代码

```tsx
// PC
<Drawer title="用户详情" placement="right" width={736} open={open}
  onClose={onClose} footer={<>...</>}>
  {/* 详情内容 */}
</Drawer>

// 移动端 (antd-mobile Popup)
<Popup visible={open} position="bottom" bodyStyle={{height:'90vh'}}>
  {/* 全屏表单 */}
</Popup>
```

---

## 8. 无障碍

- 同 Modal：`role="dialog"` + 焦点管理
- 方向切换时 `aria-label` 说明

---

## 9. 关系

- [Modal](Modal.md) — 轻量确认
- [动效系统](../基础规范/动效系统.md) — 滑入曲线
