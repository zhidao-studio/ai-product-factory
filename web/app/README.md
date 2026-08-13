# iOS / Android 客户端

`web/app` 是由 React Native Community CLI 初始化的独立 React Native + TypeScript 工程，使用 `@ant-design/react-native`。

## 开发与校验

```bash
npm install
npm run lint
npm start
npm run ios
npm run android
```

iOS 首次运行需在 `ios/` 安装 CocoaPods 依赖；Android 需要本地 Android SDK 与模拟器或真机。

## 认证契约

- client id：`428a8310cd442757ae699df5d894f051`
- 手机号密码：`POST /auth/login`，`grantType=phonePassword`
- 短信登录：`GET /resource/sms/code` + `POST /auth/login`，`grantType=sms`
- 当前用户：`GET /client/user/info`
- Token 存储键：`Client-App-Token`

登录加密使用 `react-native-get-random-values` 注入原生安全随机数。Chrome 远程调试无法同步访问原生模块时，工程会拒绝发送加密登录请求，不降级为伪随机数。

开发环境会按运行平台选择 Client API：Android 模拟器使用 `http://10.0.2.2:8082`，iOS 模拟器使用 `http://localhost:8082`。真机联调时应把开发地址配置为局域网可访问的 Client Gateway；复制脚手架创建应用时，必须将 `src/utils/env.ts` 中的生产占位域名替换为该应用的 HTTPS Client Gateway 域名。
