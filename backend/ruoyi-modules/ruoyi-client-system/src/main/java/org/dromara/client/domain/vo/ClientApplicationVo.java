package org.dromara.client.domain.vo;

import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.apache.fesod.sheet.annotation.ExcelIgnoreUnannotated;
import org.apache.fesod.sheet.annotation.ExcelProperty;
import org.dromara.client.domain.ClientApplication;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 产品端应用视图对象 client_application。
 *
 * @author Lion Li
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = ClientApplication.class)
public class ClientApplicationVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键。
     */
    @ExcelProperty(value = "主键")
    private Long id;

    /**
     * 客户端 ID。
     */
    @ExcelProperty(value = "客户端 ID")
    private String clientId;

    /**
     * 客户端 key。
     */
    @ExcelProperty(value = "客户端 key")
    private String clientKey;

    /**
     * 客户端密钥。
     */
    private String clientSecret;

    /**
     * 允许的授权类型。
     */
    @ExcelProperty(value = "授权类型")
    private String grantType;

    /**
     * 允许的授权类型列表。
     */
    private List<String> grantTypeList;

    /**
     * 设备类型。
     */
    @ExcelProperty(value = "设备类型")
    private String deviceType;

    /**
     * 允许访问路径。
     */
    @ExcelProperty(value = "允许访问路径")
    private String accessPath;

    /**
     * 允许访问路径列表。
     */
    private List<String> accessPathList;

    /**
     * IP 白名单。
     */
    @ExcelProperty(value = "IP 白名单")
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
    @ExcelProperty(value = "状态")
    private String status;

    /**
     * 备注。
     */
    private String remark;

    /**
     * 创建时间。
     */
    @ExcelProperty(value = "创建时间")
    private LocalDateTime createTime;

    /**
     * 更新时间。
     */
    private LocalDateTime updateTime;

}
