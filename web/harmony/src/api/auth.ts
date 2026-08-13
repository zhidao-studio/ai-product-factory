import request, { type R } from '@/api/request';
import { appEnv } from '@/utils/env';

export interface VerifyCodeResult {
  captchaEnabled: boolean;
  uuid?: string;
  img?: string;
}

export interface LoginResult {
  access_token: string;
  expire_in: number;
  client_id: string;
}

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

export function getCodeImg() {
  return request<R<VerifyCodeResult>>({
    url: '/auth/code',
    method: 'get',
    headers: { isToken: false }
  });
}

export function loginByPassword(username: string, password: string, code?: string, uuid?: string) {
  return request<R<LoginResult>>({
    url: '/auth/login',
    method: 'post',
    headers: { isToken: false, isEncrypt: 'true' },
    data: { username, password, code, uuid, clientId: appEnv.clientId, grantType: 'password' }
  });
}

export function getSmsCode(phoneNumber: string) {
  return request<R>({
    url: '/resource/sms/code',
    method: 'get',
    headers: { isToken: false },
    params: { phoneNumber }
  });
}

export function loginBySms(phoneNumber: string, smsCode: string) {
  return request<R<LoginResult>>({
    url: '/auth/login',
    method: 'post',
    headers: { isToken: false, isEncrypt: 'true' },
    data: { phoneNumber, smsCode, clientId: appEnv.clientId, grantType: 'sms' }
  });
}

export function logout() {
  return request<R>({ url: '/auth/logout', method: 'post' });
}

export function getInfo() {
  return request<R<UserInfo>>({ url: '/client/user/info', method: 'get' });
}
