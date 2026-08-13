package org.dromara.client.um.domain.vo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.client.um.domain.AppClient;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 接入客户端视图对象 app_client。
 *
 * @author Lion Li
 */
@Data
@AutoMapper(target = AppClient.class)
public class AppClientVo implements Serializable {

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
     * 客户端密钥，仅供认证模块读取，不写入 JSON。
     */
    @JsonIgnore
    @JsonProperty
    private String clientSecret;

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
     * 是否有效（1 有效、0 无效）。
     */
    private String validFlag;

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
