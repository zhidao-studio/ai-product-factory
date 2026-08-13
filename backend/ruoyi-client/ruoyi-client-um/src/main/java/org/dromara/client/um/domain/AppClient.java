package org.dromara.client.um.domain;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.mybatis.core.domain.BaseEntity;

/**
 * 接入客户端对象 app_client。
 *
 * @author Lion Li
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("app_client")
public class AppClient extends BaseEntity {

    /**
     * 主键。
     */
    @TableId(value = "id")
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
     * 客户端密钥。
     */
    @TableField(
        insertStrategy = FieldStrategy.NOT_EMPTY,
        updateStrategy = FieldStrategy.NOT_EMPTY,
        whereStrategy = FieldStrategy.NOT_EMPTY
    )
    private String clientSecret;

    /**
     * 允许的授权类型。
     */
    private String grantType;

    /**
     * 设备类型。
     */
    private String deviceType;

    /**
     * 允许访问路径。
     */
    private String accessPath;

    /**
     * IP 白名单。
     */
    private String ipWhitelist;

    /**
     * Token 活跃超时时间。
     */
    private Long activeTimeout;

    /**
     * Token 固定超时时间。
     */
    private Long timeout;

    /**
     * 状态（0 正常、1 停用）。
     */
    private String status;

    /**
     * 乐观锁版本号。
     */
    @Version
    private Long version;

    /**
     * 删除标志（0 存在、1 删除）。
     */
    @TableLogic
    private String delFlag;

    /**
     * 备注。
     */
    private String remark;

}
