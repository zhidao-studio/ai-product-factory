# web/app —— iOS / Android 原生 App（React Native + @ant-design/react-native）

由官方 `@react-native-community/cli init` 真实初始化的 React Native 工程。

- 技术栈：React Native + TypeScript
- UI 规范：`@ant-design/react-native`（Ant Design 官方 RN 实现，iOS/Android/Web 同源）
- 工程已生成原生 `ios/`、`android/` 目录与 JS 入口

## 已完成

- `npx @react-native-community/cli init` 已生成项目骨架（位于 `web/app`）
- 基础 JS 依赖已 `npm install`

## 接入 Ant Design RN（待你本地执行）

```bash
cd web/app
npm install @ant-design/react-native react-native-vector-icons
# RN 0.60+ 自动 link；若未自动，按官方文档手动 link
```

## 运行（需要本机原生工具链）

> 当前容器/CI 环境未安装 Xcode 与 CocoaPods，故 iOS 原生依赖未安装，需你在本机完成：

iOS：
```bash
cd web/app/ios && bundle install && bundle exec pod install && cd ..
npx react-native run-ios
```
Android：
```bash
# 需 Android SDK + 模拟器/真机
npx react-native run-android
```

## 对接后端

在 `App.tsx` 中通过 `axios` 调用 `http://localhost:8080`（或 App 内网地址），建议封装到 `src/api/` 并复用与 h5 一致的拦截器逻辑。
