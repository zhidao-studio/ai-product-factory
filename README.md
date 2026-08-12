# RuoYi-Vue-Plus 多端工程脚手架（Boot 版）

开箱即用的中型项目脚手架：后端 Spring Boot + 多端前端（PC 后台 / H5 / RN App / 小程序），统一 React + Ant Design 体系。

```
ruoyi-plus-boot/
├── README.md                 # 本文件：总览与启动
├── backend/                  # RuoYi-Vue-Plus (6.X) 后端，Spring Boot 4 / JDK 21 / Sa-Token
│   ├── ruoyi-admin/          # 启动模块（端口 8080）
│   ├── ruoyi-modules/        # 业务模块（加功能的地方）
│   ├── ruoyi-common/         # 公共封装
│   └── script/sql/           # 初始化 SQL（ry_vue / ry_job / ry_workflow ...）
├── infra/                    # 基础设施（Docker，不污染本机 macOS）
│   ├── docker-compose.yml    # MySQL 8 + Redis 7
│   └── init/01-init.sql       # 建库 ry-vue + 导入三套表/数据（utf8mb4）
├── web/
│   ├── admin/                # ✅ plus-ui-react (6.X-React) PC 管理后台，React+Ant Design Pro
│   ├── h5/                   # ✅ Vite + React + antd-mobile 移动端 H5
│   ├── app/                  # ✅ React Native 原生 App（iOS/Android），@ant-design/react-native
│   └── miniapp/              # ✅ Taro 小程序（微信/支付宝/... 可编译鸿蒙）
└── docs/                     # 设计规范待另一会话产出
```

## 一、基础设施（Docker）

中间件全部跑在 Docker 容器里，不在 macOS 本机安装。

```bash
# 启动 MySQL(3306) + Redis(6379)
docker compose -f infra/docker-compose.yml up -d

# 停止（保留数据）   docker compose -f infra/docker-compose.yml down
# 停止并清数据        docker compose -f infra/docker-compose.yml down -v
```

- MySQL：`root / root`，库 `ry-vue`（首次启动自动建库并导入 58 张表）
- Redis：`requirepass ruoyi123`（已与后端 `application-dev.yml` 对齐）
- 如需对象存储/全文检索：当前 dev 默认未启用 MinIO / Elasticsearch，按需自行在 compose 追加

## 二、后端（首次启动）

1. 先按上一步把 Docker 中间件跑起来。
2. 后端 `application-dev.yml` 已对齐：MySQL `root/root`、Redis `ruoyi123`，无需改。
3. 启动：
   ```bash
   cd backend
   ./mvnw -pl ruoyi-admin -am spring-boot:run      # 或导入 IDE 跑 RuoYiApplication
   ```
4. 默认账号：`admin / admin123`，接口根 `http://localhost:8080`。

## 三、前端各端

### PC 管理后台（web/admin）
```bash
cd web/admin && pnpm install && pnpm dev      # Vite，端口 8000，/dev-api 代理到 8080
```

### 移动端 H5（web/h5）
```bash
cd web/h5 && pnpm install && pnpm dev         # 端口 8081，含 antd-mobile 示范页
```

### iOS/Android 原生 App（web/app）
官方 RN CLI 已初始化骨架；本机需装 Xcode/CocoaPods 或 Android SDK 才能运行：
```bash
cd web/app && npm install @ant-design/react-native react-native-vector-icons
cd web/app/ios && bundle install && bundle exec pod install && cd ..
npx react-native run-ios      # / run-android
```
详见 `web/app/README.md`。

### 微信小程序 / 鸿蒙（web/miniapp）
官方 Taro CLI 已初始化（React + TS + sass）：
```bash
cd web/miniapp && pnpm dev:weapp     # 微信小程序（需微信开发者工具）
# pnpm dev:h5 / pnpm build:rn / 鸿蒙见 Taro 官方鸿蒙插件
```
详见 `web/miniapp/README.md`。

## 四、加功能

- 后端：在 `backend/ruoyi-modules/` 建模块，或用内置代码生成器（系统工具 → 代码生成）。
- 前端：PC 端用 `web/admin/src/pages` 的 ProComponents 拼页；H5/App/小程序按端封装业务组件。
- 设计规范（设计 token / 主题对齐）由另一会话统一产出，落于 `docs/`。
