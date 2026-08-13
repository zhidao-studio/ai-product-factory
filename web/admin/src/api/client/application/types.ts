import type { BaseEntity, PageQuery } from '@/api/types';

export interface ClientApplicationForm extends BaseEntity {
  id?: string | number;
  clientId?: string;
  clientKey?: string;
  clientSecret?: string;
  grantType?: string;
  grantTypeList?: string[];
  deviceType?: string;
  accessPath?: string;
  accessPathList?: string[];
  ipWhitelist?: string;
  ipWhitelistList?: string[];
  activeTimeout?: number;
  timeout?: number;
  validFlag?: string;
}

export interface ClientApplicationQuery extends PageQuery {
  clientId?: string;
  clientKey?: string;
  deviceType?: string;
  validFlag?: string;
}

export interface ClientApplicationVO extends BaseEntity {
  id: string | number;
  clientId: string;
  clientKey: string;
  grantType?: string;
  grantTypeList?: string[];
  deviceType?: string;
  accessPath?: string;
  accessPathList?: string[];
  ipWhitelist?: string;
  ipWhitelistList?: string[];
  activeTimeout?: number;
  timeout?: number;
  validFlag: string;
}
