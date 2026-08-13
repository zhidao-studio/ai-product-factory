import { Platform } from 'react-native';

/**
 * 前端运行环境配置（与后端 RuoYi-Vue-Plus 契约对齐）
 * RN 无 .env 解析，这里保留原工程的端内配置方式。
 */
const developmentBaseApi = Platform.OS === 'android' ? 'http://10.0.2.2:8082' : 'http://localhost:8082';

/** 复制脚手架后替换为目标应用的 Client Gateway HTTPS 域名。 */
const productionBaseApi = 'https://client-api.example.com';

export const appEnv = {
  /** 开发直连 Client；生产只访问 Client Gateway。 */
  baseApi: __DEV__ ? developmentBaseApi : productionBaseApi,
  /** App 客户端 client id */
  clientId: '428a8310cd442757ae699df5d894f051',
  /** 是否开启登录/注册请求体加密（对应后端 @ApiEncrypt） */
  encryptEnabled: true,
  /** RSA 公钥：加密请求体 AES 密钥 */
  rsaPublicKey:
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDvEDuRIOM3oZPWj9Ukoc5pQklR4PFH6/clnjeFqjDLIgDyQvjxhgqAZQA+E9eD6qu6FsXPmK8djcL+nh3cFHz4pX473jDvO3Sve+8yL3VRQ0n2pRgQ2a01MJsy+WwTZCBYWf0VnLRIvANUoWQgy9vz94q7Va44dg7A1/3ICf+xAwIDAQAB',
  /** RSA 私钥：解密响应头 encrypt-key 取回 AES 密钥 */
  rsaPrivateKey:
    'MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAObq7yrxfvyieZtTjAYyrdvi59tYTXxjO5ajmPCRSXBY9M9wQ1tli297JN6mnY53UJMNyOFNSZVi8WSFoIXjpR87FmvChJlzeN/dZdd3SEs48Ee66XKeSePYqxa8oO5GKDsnajgpsOHKXSeeVSIysiIPS2/WsEqk0In9P4w3RsRFAgMBAAECgYBiMEWwce24SPICnRzuScBpvmsudrbEDIH7BOd0a6LZlcrLJwZNJ7mJlshPsHNQb+WgEf135+BBGEhioPtn0yuTdEuKP4kB9UdYUKiayWCoWhJpesv7sAD4RDClV7dhuV+gcd1AXD+YzyRIPbGm0VC2U+4q8/+UPRpVjqskbLVTgQJBAPRpou7g3S8n4XB527kq0D8I3+ZYwMxZhszwhrCDpJU319+ucmpLVwYIzDmZVeID2QQdUaDfIEViFHu95xDrGiUCQQDx3YOKn3yaEctk/ERVn7hDAyAXUbd8/pv2b24/M/l1ZevlsFem8U4Jk5Mu64t3z3YGJoymEjQmbucwT01iKhehAkEAxlnccsRmfFh/KkqauKE4M4++NTAd9zlInpUsmZ+cN8UEGnF2RTEzRKBrLOt1uWCqBB7PGiE6DVTVjr7FAQPrSQJAT5yeY87DcONSk9cFlzmPqV8p/QME5rvYEnHzVBKDlkUKNPyqnWToTvaoh9U4fyNmsfeWbEOprszqhFhWHG3GgQJAK8+ynmyFhaw63+Hx2KU5zR4hVuQso2IzrEurGxCxybV6mR7VBerb4502+EPx3PmOgxQL+niUFhcMWxcvBFP9+A=='
};
