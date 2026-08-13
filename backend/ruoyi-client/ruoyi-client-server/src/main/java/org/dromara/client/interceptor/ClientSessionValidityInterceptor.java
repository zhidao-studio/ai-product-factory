package org.dromara.client.interceptor;

import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.ObjectUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.dromara.client.api.model.ClientLoginUser;
import org.dromara.client.um.constant.AppDataConstants;
import org.dromara.client.um.domain.vo.AppClientVo;
import org.dromara.client.um.domain.vo.AppUserVo;
import org.dromara.client.um.service.IAppClientService;
import org.dromara.client.um.service.IAppUserService;
import org.dromara.client.web.service.IClientAuthStrategy;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.satoken.utils.LoginHelper;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 应用用户会话有效性拦截器。
 * <p>
 * Admin 将应用用户、接入客户端设为无效或删除后，Client 端已有 Token 必须在下一次请求时立即失效。
 *
 * @author Lion Li
 */
@RequiredArgsConstructor
@Component
public class ClientSessionValidityInterceptor implements HandlerInterceptor {

    private final IAppUserService userService;
    private final IAppClientService clientService;

    /**
     * 校验当前 Token 对应的应用用户和接入客户端仍然有效。
     *
     * @param request  当前请求
     * @param response 当前响应
     * @param handler  处理器
     * @return 校验通过返回 true
     */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        StpUtil.checkLogin();
        ClientLoginUser loginUser = LoginHelper.getLoginUser();
        if (ObjectUtil.isNull(loginUser)) {
            invalidateSession("应用用户会话不存在");
        }
        AppUserVo user = userService.queryById(loginUser.getUserId());
        if (ObjectUtil.isNull(user) || !AppDataConstants.VALID.equals(user.getValidFlag())) {
            invalidateSession("应用用户已无效或不存在");
        }
        String tokenCredentialVersion = getTokenExtra(IClientAuthStrategy.CLIENT_CREDENTIAL_VERSION_KEY);
        if (!StringUtils.equals(String.valueOf(user.getCredentialVersion()), tokenCredentialVersion)) {
            invalidateSession("应用用户凭证已变更，请重新登录");
        }

        Object clientId = StpUtil.getExtra(LoginHelper.CLIENT_KEY);
        AppClientVo client = ObjectUtil.isNull(clientId)
            ? null
            : clientService.queryByClientId(clientId.toString());
        if (ObjectUtil.isNull(client) || !AppDataConstants.VALID.equals(client.getValidFlag())) {
            invalidateSession("接入客户端已无效或不存在");
        }
        String tokenAccessPath = getTokenExtra(LoginHelper.CLIENT_ACCESS_PATH_KEY);
        String tokenIpWhitelist = getTokenExtra(LoginHelper.CLIENT_IP_WHITELIST_KEY);
        if (!StringUtils.equals(client.getAccessPath(), tokenAccessPath)
            || !StringUtils.equals(client.getIpWhitelist(), tokenIpWhitelist)) {
            invalidateSession("接入客户端访问规则已变更，请重新登录");
        }
        return true;
    }

    private String getTokenExtra(String key) {
        Object value = StpUtil.getExtra(key);
        return ObjectUtil.isNull(value) ? null : value.toString();
    }

    private void invalidateSession(String message) {
        String loginType = StpUtil.getLoginType();
        StpUtil.logout();
        throw NotLoginException.newInstance(loginType, "-110", message, null);
    }

}
