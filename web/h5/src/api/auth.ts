/**
 * 认证相关接口（严格对齐后端 AuthController / CaptchaController）
 * 端点前缀 /auth、/system 等，经 /dev-api 代理到后端 8080。
 */
import request, { type R } from '@/api/request';
import { appEnv } from '@/utils/env';

/** 图片验证码返回（CaptchaVo） */
export interface VerifyCodeResult {
  captchaEnabled: boolean;
  uuid: string;
  /** Base64 图片（含 data:image/png;base64, 前缀） */
  img: string;
}

/** 登录成功返回（LoginVo） */
export interface LoginResult {
  access_token: string;
  refresh_token: string;
  expire_in: number;
  refresh_expire_in: number;
  client_id: string;
  scope: string;
  openid: string;
}

/** 登录入参 */
export interface LoginParams {
  username: string;
  password: string;
  code?: string;
  uuid?: string;
  clientId?: string;
  grantType?: string;
}

/** 用户信息（SysUserVo 精简） */
export interface UserInfo {
  userId: number | string;
  userName: string;
  nickName: string;
  avatar: string;
  roles: string[];
  permissions: string[];
}

/** 获取图片验证码 */
export function getCodeImg() {
  return request<R<VerifyCodeResult>>({
    url: '/auth/code',
    method: 'get',
    headers: { isToken: false }
  });
}

/** 登录 */
export function login(data: LoginParams) {
  return request<R<LoginResult>>({
    url: '/auth/login',
    method: 'post',
    headers: {
      isToken: false,
      isEncrypt: 'true',
      repeatSubmit: false
    },
    data: {
      ...data,
      clientId: data.clientId || appEnv.clientId,
      grantType: data.grantType || 'password'
    }
  });
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
    url: '/system/user/getInfo',
    method: 'get'
  });
}
