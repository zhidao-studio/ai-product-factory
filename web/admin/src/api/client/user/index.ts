import type { PageResult, R } from '@/api/types';
import request from '@/api/request';
import type { ClientUserForm, ClientUserQuery, ClientUserVO } from './types';

export function listClientUser(query?: ClientUserQuery) {
  return request<R<PageResult<ClientUserVO>>>({
    url: '/client/user/list',
    method: 'get',
    params: query
  });
}

export function getClientUser(userId: string | number) {
  return request<R<ClientUserVO>>({
    url: `/client/user/${userId}`,
    method: 'get'
  });
}

export function addClientUser(data: ClientUserForm) {
  return request<R>({
    url: '/client/user',
    method: 'post',
    data
  });
}

export function updateClientUser(data: ClientUserForm) {
  return request<R>({
    url: '/client/user',
    method: 'put',
    data
  });
}

export function delClientUser(userId: Array<string | number> | string | number) {
  return request<R>({
    url: `/client/user/${userId}`,
    method: 'delete'
  });
}

export function resetClientUserPwd(userId: string | number, password: string) {
  return request<R>({
    url: '/client/user/resetPwd',
    method: 'put',
    headers: {
      isEncrypt: true,
      repeatSubmit: false
    },
    data: {
      userId,
      password
    }
  });
}

export function changeClientUserValidFlag(userId: string | number, validFlag: string) {
  return request<R>({
    url: '/client/user/changeValidFlag',
    method: 'put',
    data: {
      userId,
      validFlag
    }
  });
}
