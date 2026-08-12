package org.dromara.client.domain.model;

/**
 * 外部身份提供商返回的稳定身份。
 */
public record ClientExternalIdentity(String source, String openId, String unionId) {
}
