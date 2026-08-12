/**
 * 认证相关接口（严格对齐后端 AuthController / CaptchaController）
 * 端点前缀 /auth、/client 等，对接 Client 后端 8082。
 */
import request, { type R } from '@/api/request';
import { appEnv } from '@/utils/env';

/** 登录成功返回（LoginVo） */
export interface LoginResult {
  access_token: string;
  expire_in: number;
  client_id: string;
}

/** 产品用户信息 */
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

/** 退出登录 */
export function logout() {
  return request<R>({
    url: '/auth/logout',
    method: 'post'
  });
}

/** 获取当前用户信息（需鉴权） */
export function getInfo() {
  return request<R<UserInfo>>({
    url: '/client/user/info',
    method: 'get'
  });
}

/** 微信授权码登录（wx.login / Taro.login） */
export function loginByWechat(xcxCode: string) {
  return request<R<LoginResult>>({
    url: '/auth/login',
    method: 'post',
    headers: { isToken: false, isEncrypt: 'true' },
    data: { xcxCode, clientId: appEnv.clientId, grantType: 'xcx' }
  });
}
