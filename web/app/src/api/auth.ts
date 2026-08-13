/**
 * 认证相关接口（严格对齐后端 AuthController / CaptchaController）
 */
import request, { type R } from './request';
import { appEnv } from '../utils/env';

/** 登录成功返回（LoginVo） */
export interface LoginResult {
  access_token: string;
  expire_in: number;
  client_id: string;
}

/** 应用用户信息 */
export interface UserInfo {
  userId: number | string;
  userName: string;
  nickName: string;
  avatar: string | null;
  clientId: string;
  deviceType: string;
  roles: string[];
  permissions: string[];
}

/** 退出登录：显式使用点击退出时捕获的 Token，不受本地即时清理影响。 */
export function logout(accessToken: string) {
  return request<R>({
    url: '/auth/logout',
    method: 'post',
    timeout: 5000,
    silent: true,
    headers: {
      isToken: false,
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

/** 获取当前用户信息（需鉴权） */
export function getInfo() {
  return request<R<UserInfo>>({
    url: '/client/user/info',
    method: 'get',
  });
}

/** 获取短信验证码（免鉴权）：GET /resource/sms/code?phoneNumber= */
export function getSmsCode(phoneNumber: string) {
  return request<R>({
    url: '/resource/sms/code',
    method: 'get',
    headers: { isToken: false },
    params: { phoneNumber },
  });
}

/** 手机号 + 短信验证码登录（grantType=sms） */
export function loginBySms(phoneNumber: string, smsCode: string) {
  return request<R<LoginResult>>({
    url: '/auth/login',
    method: 'post',
    headers: { isToken: false, isEncrypt: 'true' },
    data: { phoneNumber, smsCode, clientId: appEnv.clientId, grantType: 'sms' },
  });
}

/** 手机号 + 密码登录（grantType=phonePassword，免图形验证码） */
export function loginByPhone(phoneNumber: string, password: string) {
  return request<R<LoginResult>>({
    url: '/auth/login',
    method: 'post',
    headers: { isToken: false, isEncrypt: 'true' },
    data: {
      username: phoneNumber,
      password,
      clientId: appEnv.clientId,
      grantType: 'phonePassword',
    },
  });
}
