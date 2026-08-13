package org.dromara.client.api.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.domain.model.LoginBody;
import org.hibernate.validator.constraints.Length;

/**
 * Client 账号密码登录请求。
 *
 * @author Lion Li
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ClientPasswordLoginBody extends LoginBody {

    /**
     * 用户账号；手机号密码登录时传入手机号。
     */
    @NotBlank(message = "{user.username.not.blank}")
    @Length(min = 2, max = 30, message = "{user.username.length.valid}")
    private String username;

    /**
     * 用户密码。
     */
    @NotBlank(message = "{user.password.not.blank}")
    @Length(min = 5, max = 30, message = "{user.password.length.valid}")
    private String password;

}
