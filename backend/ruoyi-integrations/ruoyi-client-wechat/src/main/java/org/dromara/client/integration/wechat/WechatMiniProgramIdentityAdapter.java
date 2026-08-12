package org.dromara.client.integration.wechat;

import org.dromara.client.domain.model.ClientExternalIdentity;
import org.dromara.client.domain.port.WechatIdentityProvider;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/** 微信 jscode2session HTTP 适配器。 */
@Component
public class WechatMiniProgramIdentityAdapter implements WechatIdentityProvider {

    private static final String SESSION_URL = "https://api.weixin.qq.com/sns/jscode2session";

    private final WechatClientProperties properties;
    private final RestClient restClient = RestClient.create();

    public WechatMiniProgramIdentityAdapter(WechatClientProperties properties) {
        this.properties = properties;
    }

    @Override
    public ClientExternalIdentity exchange(String appId, String code) {
        if (StringUtils.isAnyBlank(properties.getAppId(), properties.getAppSecret())) {
            throw new ServiceException("微信小程序 Client 身份提供商尚未配置");
        }
        if (!properties.getAppId().equals(appId)) {
            throw new ServiceException("微信小程序 appid 不受信任");
        }
        WechatSessionResponse response = restClient.get()
            .uri(SESSION_URL + "?appid={appId}&secret={secret}&js_code={code}&grant_type=authorization_code",
                appId, properties.getAppSecret(), code)
            .retrieve()
            .body(WechatSessionResponse.class);
        if (response == null || StringUtils.isBlank(response.openid())) {
            String reason = response == null ? "无响应" : response.errmsg();
            throw new ServiceException("微信登录失败：" + StringUtils.blankToDefault(reason, "身份交换失败"));
        }
        return new ClientExternalIdentity("wechat-miniapp", response.openid(), response.unionid());
    }

    private record WechatSessionResponse(String openid, String unionid, Integer errcode, String errmsg) {
    }
}
