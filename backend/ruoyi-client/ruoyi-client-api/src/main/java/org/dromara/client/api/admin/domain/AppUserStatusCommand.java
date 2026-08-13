package org.dromara.client.api.admin.domain;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * 应用用户状态变更命令。
 *
 * @author Lion Li
 */
@Data
public class AppUserStatusCommand implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 用户 ID。
     */
    @NotNull(message = "用户 ID 不能为空")
    private Long userId;

    /**
     * 账号状态。
     */
    @NotBlank(message = "账号状态不能为空")
    @Pattern(regexp = "[01]", message = "状态值不正确")
    private String status;

}
