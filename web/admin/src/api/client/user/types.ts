import type { BaseEntity, PageQuery } from '@/api/types';

export interface ClientUserForm extends BaseEntity {
  userId?: string | number;
  userName?: string;
  nickName?: string;
  userType?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  avatar?: string | number;
  password?: string;
  status?: string;
}

export interface ClientUserQuery extends PageQuery {
  userName?: string;
  nickName?: string;
  email?: string;
  phoneNumber?: string;
  status?: string;
}

export interface ClientUserVO extends BaseEntity {
  userId: string | number;
  userName: string;
  nickName: string;
  userType?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  avatar?: string | number;
  status: string;
  loginIp?: string;
  loginDate?: string;
}
