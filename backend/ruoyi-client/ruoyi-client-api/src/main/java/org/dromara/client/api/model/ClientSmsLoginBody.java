package org.dromara.client.api.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.domain.model.LoginBody;

/**
 * Client 短信验证码登录请求。
 *
 * @author Lion Li
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ClientSmsLoginBody extends LoginBody {

    /**
     * 手机号。
     */
    @NotBlank(message = "{user.phonenumber.not.blank}")
    private String phoneNumber;

    /**
     * 短信验证码。
     */
    @NotBlank(message = "{sms.code.not.blank}")
    private String smsCode;

}
