package org.dromara.client.web.service;

import cn.dev33.satoken.stp.parameter.SaLoginParameter;
import cn.hutool.core.util.ObjectUtil;
import org.dromara.client.domain.vo.ClientApplicationVo;
import org.dromara.client.domain.vo.ClientUserVo;
import org.dromara.client.web.domain.vo.ClientLoginVo;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.SpringUtils;
import org.dromara.common.satoken.utils.LoginHelper;

import java.util.function.Consumer;

/**
 * 产品用户授权策略。
 *
 * @author Lion Li
 */
public interface IClientAuthStrategy {

    String BASE_NAME = "ClientAuthStrategy";

    String CLIENT_CREDENTIAL_VERSION_KEY = "clientCredentialVersion";

    /**
     * 分派并执行指定授权策略。
     *
     * @param body      原始登录请求
     * @param client    产品端应用配置
     * @param grantType 授权类型
     * @return 登录令牌
     */
    static ClientLoginVo login(String body, ClientApplicationVo client, String grantType) {
        String beanName = grantType + BASE_NAME;
        if (!SpringUtils.containsBean(beanName)) {
            throw new ServiceException("授权类型不正确!");
        }
        IClientAuthStrategy instance = SpringUtils.getBean(beanName);
        return instance.login(body, client);
    }

    /**
     * 按产品端应用配置构建 Sa-Token 登录参数。
     *
     * @param client 产品端应用配置
     * @return 登录参数
     */
    static SaLoginParameter buildLoginParameter(ClientApplicationVo client) {
        return buildLoginParameter(client, (Consumer<SaLoginParameter>) null);
    }

    /**
     * 构建包含产品用户凭证版本的登录参数。
     *
     * @param client 产品端应用配置
     * @param user   产品用户
     * @return 登录参数
     */
    static SaLoginParameter buildLoginParameter(ClientApplicationVo client, ClientUserVo user) {
        return buildLoginParameter(client,
            model -> model.setExtra(CLIENT_CREDENTIAL_VERSION_KEY, user.getCredentialVersion()));
    }

    /**
     * 按产品端应用配置构建 Sa-Token 登录参数。
     *
     * @param client     产品端应用配置
     * @param customizer 自定义扩展
     * @return 登录参数
     */
    static SaLoginParameter buildLoginParameter(ClientApplicationVo client,
                                                Consumer<SaLoginParameter> customizer) {
        SaLoginParameter model = new SaLoginParameter();
        model.setDeviceType(client.getDeviceType());
        model.setTimeout(client.getTimeout());
        model.setActiveTimeout(client.getActiveTimeout());
        model.setExtra(LoginHelper.CLIENT_KEY, client.getClientId());
        model.setExtra(LoginHelper.CLIENT_ACCESS_PATH_KEY, client.getAccessPath());
        model.setExtra(LoginHelper.CLIENT_IP_WHITELIST_KEY, client.getIpWhitelist());
        if (ObjectUtil.isNotNull(customizer)) {
            customizer.accept(model);
        }
        return model;
    }

    /**
     * 执行登录。
     *
     * @param body   原始登录请求
     * @param client 产品端应用配置
     * @return 登录令牌
     */
    ClientLoginVo login(String body, ClientApplicationVo client);

}
