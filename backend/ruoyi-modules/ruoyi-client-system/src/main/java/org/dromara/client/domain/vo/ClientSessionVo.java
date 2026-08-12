package org.dromara.client.domain.vo;

import lombok.Data;

import java.util.List;

/**
 * 当前产品用户会话视图。
 *
 * @author Lion Li
 */
@Data
public class ClientSessionVo {

    /**
     * 用户 ID。
     */
    private Long userId;

    /**
     * 用户账号。
     */
    private String userName;

    /**
     * 用户昵称。
     */
    private String nickName;

    /**
     * 头像地址；未接入 OSS 翻译时为空。
     */
    private String avatar;

    /**
     * 当前客户端 ID。
     */
    private String clientId;

    /**
     * 当前设备类型。
     */
    private String deviceType;

    /**
     * 产品端角色。脚手架默认无角色体系。
     */
    private List<String> roles;

    /**
     * 产品端权限。脚手架默认无权限体系。
     */
    private List<String> permissions;

}
