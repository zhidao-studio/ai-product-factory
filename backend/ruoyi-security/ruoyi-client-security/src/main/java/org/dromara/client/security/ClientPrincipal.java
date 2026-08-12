package org.dromara.client.security;

import java.io.Serializable;

/** Client Token 会话保存的最小产品用户主体。 */
public record ClientPrincipal(
    Long userId,
    String username,
    String nickname,
    String avatar,
    String clientId,
    String deviceType
) implements Serializable {
}
