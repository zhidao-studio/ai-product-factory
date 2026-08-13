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
  validFlag?: string;
}

export interface ClientUserQuery extends PageQuery {
  userName?: string;
  nickName?: string;
  email?: string;
  phoneNumber?: string;
  validFlag?: string;
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
  validFlag: string;
  loginIp?: string;
  loginDate?: string;
}
