import type { PageResult, R } from '@/api/types';
import request from '@/api/request';
import type { ClientApplicationForm, ClientApplicationQuery, ClientApplicationVO } from './types';

export function listClientApplication(query?: ClientApplicationQuery) {
  return request<R<PageResult<ClientApplicationVO>>>({
    url: '/client/application/list',
    method: 'get',
    params: query
  });
}

export function getClientApplication(id: string | number) {
  return request<R<ClientApplicationVO>>({
    url: `/client/application/${id}`,
    method: 'get'
  });
}

export function addClientApplication(data: ClientApplicationForm) {
  return request<R>({
    url: '/client/application',
    method: 'post',
    data
  });
}

export function updateClientApplication(data: ClientApplicationForm) {
  return request<R>({
    url: '/client/application',
    method: 'put',
    data
  });
}

export function changeClientApplicationValidFlag(id: string | number, validFlag: string) {
  return request<R>({
    url: '/client/application/changeValidFlag',
    method: 'put',
    data: {
      id,
      validFlag
    }
  });
}
