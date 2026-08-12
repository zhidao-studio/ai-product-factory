# App 独立工程

React Native iOS / Android 工程，包含独立的原生目录、npm 锁文件、请求层、持久化会话和导航。

## 命令

```bash
npm install
npm run type-check
npm run lint
npm run ios
npm run android
```

iOS 首次运行前执行：

```bash
cd ios && bundle install && bundle exec pod install && cd ..
```

## API 环境

- iOS 模拟器开发默认：`http://127.0.0.1:8082`
- Android 模拟器开发默认：`http://10.0.2.2:8082`
- 生产必须在应用启动前注入 `global.__RUOYI_APP_CONFIG__ = { apiBaseUrl, encryptEnabled }`

Token 通过 AsyncStorage 持久化，会话恢复和 401 回收由 `src/stores/SessionContext.tsx` 统一处理。本工程使用 npm，不保留第二套锁文件。
