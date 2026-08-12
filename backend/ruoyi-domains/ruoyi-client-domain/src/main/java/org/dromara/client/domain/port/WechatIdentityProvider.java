package org.dromara.client.domain.port;

import org.dromara.client.domain.model.ClientExternalIdentity;

/** 微信登录码交换端口，领域层不依赖微信 SDK 或 HTTP 实现。 */
public interface WechatIdentityProvider {

    ClientExternalIdentity exchange(String appId, String code);
}
