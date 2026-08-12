# Upload 上传

> 文件/图片上传。移动端优先调用摄像头/相册。

---

## 1. 解剖与变体

| 类型 | 说明 |
|---|---|
| 点击上传 | 按钮触发文件选择 |
| 拖拽上传 | 拖入区域（PC） |
| 图片上传 | 缩略图预览（ImageUploader 移动端） |
| 头像上传 | 圆形裁剪 |

## 2. 状态
Default / Hover / Uploading(进度条) / Done(缩略图) / Error(重试)。

## 3. 约束
- 限制类型/大小（`accept` / `maxCount` / `beforeUpload`）
- 失败显示错误 + 重试
- 图片压缩/WebP（见 [H5 规范](../../平台适配/H5.md)）

## 4. Do / Don't
- ✅ 上传中显进度，失败可重试
- ✅ 移动端用摄像头/相册入口
- ❌ 静默失败无提示

## 5. 代码
```tsx
<Upload maxCount={3} beforeUpload={check} onChange={onChange}>
  <Button icon={<UploadIcon />}>上传文件</Button>
</Upload>

// 移动端
<ImageUploader value={fileList} onChange={setFileList} />
```

## 6. 关系
- [Button](Button.md) — 触发按钮
- [平台适配/H5](../../平台适配/H5.md) — 图片格式优化
