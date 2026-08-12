/**
 * 前端运行环境配置（与后端 RuoYi-Vue-Plus 契约对齐）
 * 微信小程序拥有独立 Client 应用配置，不与其他前端共享源码或 clientid。
 */
export const appEnv = {
  /** H5 开发走代理；小程序与生产环境必须注入绝对 HTTPS 地址。 */
  baseApi: process.env.TARO_APP_API_BASE_URL || (process.env.TARO_ENV === 'h5' ? '/dev-api' : ''),
  /** 微信小程序产品用户客户端 id（须与 client_application 表一致） */
  clientId: '7f4c1e2d8a9b4c6f9012d3e4f5a6b7c8',
  /** 微信小程序 AppID（非密钥），构建时注入。 */
  wechatAppId: process.env.TARO_APP_WECHAT_APP_ID || '',
  /** 是否开启登录/注册请求体加密（对应后端 @ApiEncrypt） */
  encryptEnabled: true,
  /** RSA 公钥：加密请求体 AES 密钥 */
  rsaPublicKey:
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDvEDuRIOM3oZPWj9Ukoc5pQklR4PFH6/clnjeFqjDLIgDyQvjxhgqAZQA+E9eD6qu6FsXPmK8djcL+nh3cFHz4pX473jDvO3Sve+8yL3VRQ0n2pRgQ2a01MJsy+WwTZCBYWf0VnLRIvANUoWQgy9vz94q7Va44dg7A1/3ICf+xAwIDAQAB',
  /** RSA 私钥：解密响应头 encrypt-key 取回 AES 密钥 */
  rsaPrivateKey:
    'MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAObq7yrxfvyieZtTjAYyrdvi59tYTXxjO5ajmPCRSXBY9M9wQ1tli297JN6mnY53UJMNyOFNSZVi8WSFoIXjpR87FmvChJlzeN/dZdd3SEs48Ee66XKeSePYqxa8oO5GKDsnajgpsOHKXSeeVSIysiIPS2/WsEqk0In9P4w3RsRFAgMBAAECgYBiMEWwce24SPICnRzuScBpvmsudrbEDIH7BOd0a6LZlcrLJwZNJ7mJlshPsHNQb+WgEf135+BBGEhioPtn0yuTdEuKP4kB9UdYUKiayWCoWhJpesv7sAD4RDClV7dhuV+gcd1AXD+YzyRIPbGm0VC2U+4q8/+UPRpVjqskbLVTgQJBAPRpou7g3S8n4XB527kq0D8I3+ZYwMxZhszwhrCDpJU319+ucmpLVwYIzDmZVeID2QQdUaDfIEViFHu95xDrGiUCQQDx3YOKn3yaEctk/ERVn7hDAyAXUbd8/pv2b24/M/l1ZevlsFem8U4Jk5Mu64t3z3YGJoymEjQmbucwT01iKhehAkEAxlnccsRmfFh/KkqauKE4M4++NTAd9zlInpUsmZ+cN8UEGnF2RTEzRKBrLOt1uWCqBB7PGiE6DVTVjr7FAQPrSQJAT5yeY87DcONSk9cFlzmPqV8p/QME5rvYEnHzVBKDlkUKNPyqnWToTvaoh9U4fyNmsfeWbEOprszqhFhWHG3GgQJAK8+ynmyFhaw63+Hx2KU5zR4hVuQso2IzrEurGxCxybV6mR7VBerb4502+EPx3PmOgxQL+niUFhcMWxcvBFP9+A=='
};
