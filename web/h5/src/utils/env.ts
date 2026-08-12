/**
 * 前端运行环境配置（与后端 RuoYi-Vue-Plus 契约对齐）
 * 值来自根目录 .env，详见该文件说明。
 */
const env = import.meta.env;

export const appEnv = {
  /** 后端接口代理前缀 */
  baseApi: env.VITE_APP_BASE_API || '/dev-api',
  /** 默认 Web 客户端 id */
  clientId: env.VITE_APP_CLIENT_ID || '8f6e7d5c4b3a2910fedcba9876543210',
  /** 是否开启登录/注册请求体加密（对应后端 @ApiEncrypt） */
  encryptEnabled: env.VITE_APP_ENCRYPT === 'true',
  /** RSA 公钥：加密请求体 AES 密钥 */
  rsaPublicKey: env.VITE_APP_RSA_PUBLIC_KEY || '',
  /** RSA 私钥：解密响应头 encrypt-key 取回 AES 密钥 */
  rsaPrivateKey: env.VITE_APP_RSA_PRIVATE_KEY || ''
};
