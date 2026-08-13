# iOS / Android 客户端

`web/app` 是由 React Native Community CLI 初始化的独立 React Native + TypeScript 工程，使用 `@ant-design/react-native`。

本工程只使用 npm，`package-lock.json` 是唯一锁文件。Ant Design RN 的原生配套依赖使用已验证的固定版本，禁止依赖 peer 自动升级或改用组件库内部导入路径。

运行基线固定为 Node.js 24.19.0 LTS 与 npm 12.0.2。React 使用 19.2.8；React Native 暂固定 0.86.2，因为当前 Reanimated 4.5 稳定版尚不支持 React Native 0.87。TypeScript 7.0.2 负责命令行类型检查，ESLint 通过官方 TypeScript 6 兼容包继续使用编译器 API；待 TypeScript 7.1 提供新 API 后再收敛为单版本。

## 开发与校验

```bash
npm install
npm run lint
npm run typecheck
npm test -- --runInBand
npm start
npm run ios
npm run android
```

iOS 首次运行需在 `ios/` 安装 CocoaPods 依赖；Android 需要本地 Android SDK 与模拟器或真机。

Android 原生 Gradle/NDK 构建固定使用 JDK 21；不要复用后端的 JDK 25 `JAVA_HOME`。当前 React Native 原生工具链在 JDK 25 下会在 CMake/Prefab 配置阶段失败。macOS 可按下面方式执行完整 Debug APK 构建：

```bash
JAVA_HOME="$(/usr/libexec/java_home -v 21)" \
ANDROID_HOME="$HOME/Library/Android/sdk" \
./android/gradlew -p android assembleDebug --no-daemon
```

依赖安装后必须完整重建原生工程，Metro 热更新不能完成原生模块链接。
若更新 Ant Design 图标字体，执行 `npm run link-assets` 后重新安装 Pods 并重建；iOS 与 Android 必须同时包含 `antfill.ttf`、`antoutline.ttf`。

## 认证契约

- client id：`428a8310cd442757ae699df5d894f051`
- 开发账号：手机号 `13800138000`、密码 `admin123`（用户名 `client` 不能用于 App 手机号输入框）
- 手机号密码：`POST /auth/login`，`grantType=phonePassword`
- 短信登录：`GET /resource/sms/code` + `POST /auth/login`，`grantType=sms`
- 当前用户：`GET /client/user/info`
- Token 安全存储服务名：`Client-App-Token`（iOS Keychain / Android Keystore）

应用冷启动会先恢复安全存储中的 Token，再选择登录页或主页；401 会清除安全存储并同步驱动界面回到登录态。普通网络错误不会被误判为退出登录。

主题偏好独立保存在 AsyncStorage 中，按“跟随系统 → 浅色 → 深色”循环；Token 不得写入 AsyncStorage。

登录加密使用 `react-native-get-random-values` 注入原生安全随机数。Chrome 远程调试无法同步访问原生模块时，工程会拒绝发送加密登录请求，不降级为伪随机数。

开发环境会按运行平台选择 Client API：Android 模拟器使用 `http://10.0.2.2:8082`，iOS 模拟器使用 `http://localhost:8082`。真机联调时应把开发地址配置为局域网可访问的 Client Gateway；复制脚手架创建应用时，必须将 `src/utils/env.ts` 中的生产占位域名替换为该应用的 HTTPS Client Gateway 域名。
