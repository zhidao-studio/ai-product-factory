package org.dromara.client.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.dromara.common.core.domain.model.LoginUserContext;

import java.io.Serial;

/**
 * Client 登录用户上下文。
 *
 * @author Lion Li
 */
@Data
@NoArgsConstructor
public class ClientLoginUser implements LoginUserContext {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 用户 ID。
     */
    private Long userId;

    /**
     * 用户账号。
     */
    private String username;

    /**
     * 用户昵称。
     */
    private String nickname;

    /**
     * 用户类型。
     */
    private String userType;

    /**
     * 客户端标识。
     */
    private String clientKey;

    /**
     * 设备类型。
     */
    private String deviceType;

    /**
     * 登录 IP 地址。
     */
    private String ipaddr;

    /**
     * 登录地点。
     */
    private String loginLocation;

    /**
     * 浏览器类型。
     */
    private String browser;

    /**
     * 操作系统。
     */
    private String os;

}
