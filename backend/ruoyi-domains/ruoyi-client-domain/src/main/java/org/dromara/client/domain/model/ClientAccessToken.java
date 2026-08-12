package org.dromara.client.domain.model;

/**
 * Client 身份域签发的访问令牌。
 */
public record ClientAccessToken(String accessToken, long expireIn, String clientId) {
}
