package org.dromara.client.interfaces.http;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.dromara.client.domain.model.ClientAccessToken;

/** Client 登录成功响应，与五端请求层的令牌字段保持一致。 */
public record ClientLoginResponse(
    @JsonProperty("access_token") String accessToken,
    @JsonProperty("expire_in") long expireIn,
    @JsonProperty("client_id") String clientId
) {

    public static ClientLoginResponse from(ClientAccessToken token) {
        return new ClientLoginResponse(token.accessToken(), token.expireIn(), token.clientId());
    }
}
