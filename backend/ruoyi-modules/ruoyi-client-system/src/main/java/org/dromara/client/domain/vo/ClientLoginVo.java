package org.dromara.client.domain.vo;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * 产品用户登录令牌视图。
 *
 * @author Lion Li
 */
@Data
public class ClientLoginVo {

    /**
     * 访问令牌。
     */
    @JsonProperty("access_token")
    private String accessToken;

    /**
     * 访问令牌有效期，单位为秒。
     */
    @JsonProperty("expire_in")
    private Long expireIn;

    /**
     * 客户端 ID。
     */
    @JsonProperty("client_id")
    private String clientId;

}
