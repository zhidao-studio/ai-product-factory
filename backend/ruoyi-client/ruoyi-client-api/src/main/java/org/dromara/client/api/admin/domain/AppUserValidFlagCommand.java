package org.dromara.client.api.admin.domain;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * 应用用户有效标志变更命令。
 *
 * @author Lion Li
 */
@Data
public class AppUserValidFlagCommand implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 用户 ID。
     */
    @NotNull(message = "用户 ID 不能为空")
    private Long userId;

    /**
     * 是否有效（1 有效、0 无效）。
     */
    @NotBlank(message = "有效标志不能为空")
    @Pattern(regexp = "[01]", message = "有效标志值不正确")
    private String validFlag;

}
