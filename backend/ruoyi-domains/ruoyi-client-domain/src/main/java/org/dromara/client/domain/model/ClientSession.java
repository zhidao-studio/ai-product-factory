package org.dromara.client.domain.model;

/**
 * Client 登录会话中允许暴露给用户端的最小身份信息。
 */
public record ClientSession(
    Long userId,
    String username,
    String nickname,
    String avatar,
    String clientId,
    String deviceType
) {
}
