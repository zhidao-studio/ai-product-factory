package org.dromara.client.api.admin.domain;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

/**
 * 接入客户端状态变更命令。
 *
 * @author Lion Li
 */
@Data
public class AppClientStatusCommand implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键。
     */
    @NotNull(message = "主键不能为空")
    private Long id;

    /**
     * 状态。
     */
    @NotBlank(message = "状态不能为空")
    @Pattern(regexp = "[01]", message = "状态值不正确")
    private String status;

}
