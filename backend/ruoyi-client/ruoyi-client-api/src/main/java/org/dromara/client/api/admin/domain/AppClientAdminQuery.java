package org.dromara.client.api.admin.domain;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * 接入客户端管理查询条件。
 *
 * @author Lion Li
 */
@Data
public class AppClientAdminQuery implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 客户端 ID。
     */
    private String clientId;

    /**
     * 客户端 key。
     */
    private String clientKey;

    /**
     * 设备类型。
     */
    private String deviceType;

    /**
     * 是否有效（1 有效、0 无效）。
     */
    @Pattern(regexp = "[01]", message = "有效标志值不正确")
    private String validFlag;

}
