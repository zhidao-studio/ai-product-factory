package org.dromara.client.interfaces.http;

import org.dromara.client.domain.model.ClientSession;

import java.util.List;

/** 产品用户会话视图，不包含 Admin 角色、菜单或数据权限对象。 */
public record ClientSessionResponse(
    Long userId,
    String userName,
    String nickName,
    String avatar,
    String clientId,
    String deviceType,
    List<String> roles,
    List<String> permissions
) {

    public static ClientSessionResponse from(ClientSession session) {
        return new ClientSessionResponse(
            session.userId(), session.username(), session.nickname(), session.avatar(),
            session.clientId(), session.deviceType(), List.of(), List.of());
    }
}
