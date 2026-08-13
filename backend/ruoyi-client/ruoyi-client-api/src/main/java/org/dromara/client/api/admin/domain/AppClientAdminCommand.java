package org.dromara.client.api.admin.domain;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

/**
 * 接入客户端管理写入命令。
 *
 * @author Lion Li
 */
@Data
public class AppClientAdminCommand implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键。
     */
    @NotNull(message = "主键不能为空", groups = EditGroup.class)
    private Long id;

    /**
     * 客户端 ID。
     */
    private String clientId;

    /**
     * 客户端 key。
     */
    @NotBlank(message = "客户端 key 不能为空", groups = AddGroup.class)
    private String clientKey;

    /**
     * 客户端密钥。
     */
    @NotBlank(message = "客户端密钥不能为空", groups = AddGroup.class)
    private String clientSecret;

    /**
     * 允许的授权类型。
     */
    private String grantType;

    /**
     * 允许的授权类型列表。
     */
    @NotNull(message = "授权类型不能为空", groups = {AddGroup.class, EditGroup.class})
    @Size(min = 1, message = "授权类型不能为空", groups = {AddGroup.class, EditGroup.class})
    private List<String> grantTypeList;

    /**
     * 设备类型。
     */
    @NotBlank(message = "设备类型不能为空", groups = {AddGroup.class, EditGroup.class})
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
    @NotNull(message = "乐观锁版本号不能为空", groups = EditGroup.class)
    private Long version;

    /**
     * 备注。
     */
    private String remark;

}
