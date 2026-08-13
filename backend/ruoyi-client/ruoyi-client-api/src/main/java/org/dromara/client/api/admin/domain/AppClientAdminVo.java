package org.dromara.client.api.admin.domain;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 接入客户端管理视图。
 *
 * @author Lion Li
 */
@Data
public class AppClientAdminVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键。
     */
    private Long id;

    /**
     * 客户端 ID。
     */
    private String clientId;

    /**
     * 客户端 key。
     */
    private String clientKey;

    /**
     * 允许的授权类型。
     */
    private String grantType;

    /**
     * 允许的授权类型列表。
     */
    private List<String> grantTypeList;

    /**
     * 设备类型。
     */
    private String deviceType;

    /**
     * 允许访问路径。
     */
    private String accessPath;

    /**
     * 允许访问路径列表。
     */
    private List<String> accessPathList;

    /**
     * IP 白名单。
     */
    private String ipWhitelist;

    /**
     * IP 白名单列表。
     */
    private List<String> ipWhitelistList;

    /**
     * Token 活跃超时时间。
     */
    private Long activeTimeout;

    /**
     * Token 固定超时时间。
     */
    private Long timeout;

    /**
     * 状态。
     */
    private String status;

    /**
     * 乐观锁版本号。
     */
    private Long version;

    /**
     * 备注。
     */
    private String remark;

    /**
     * 创建时间。
     */
    private LocalDateTime createTime;

    /**
     * 更新时间。
     */
    private LocalDateTime updateTime;

}
