package org.dromara.client.api.admin.domain;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * 接入客户端有效标志变更命令。
 *
 * @author Lion Li
 */
@Data
public class AppClientValidFlagCommand implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键。
     */
    @NotNull(message = "主键不能为空")
    private Long id;

    /**
     * 是否有效（1 有效、0 无效）。
     */
    @NotBlank(message = "有效标志不能为空")
    @Pattern(regexp = "[01]", message = "有效标志值不正确")
    private String validFlag;

}
