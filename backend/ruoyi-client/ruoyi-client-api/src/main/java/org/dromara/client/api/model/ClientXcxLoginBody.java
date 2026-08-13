package org.dromara.client.api.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.domain.model.LoginBody;

/**
 * Client 微信小程序登录请求。
 *
 * @author Lion Li
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ClientXcxLoginBody extends LoginBody {

    /**
     * 小程序 AppID。
     */
    private String appid;

    /**
     * 微信登录临时凭证。
     */
    @NotBlank(message = "{xcx.code.not.blank}")
    private String xcxCode;

}
