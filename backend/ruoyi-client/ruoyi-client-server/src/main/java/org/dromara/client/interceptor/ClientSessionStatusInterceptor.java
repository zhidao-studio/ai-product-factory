package org.dromara.client.interceptor;

import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.ObjectUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.dromara.client.domain.vo.ClientApplicationVo;
import org.dromara.client.domain.vo.ClientUserVo;
import org.dromara.client.service.IClientApplicationService;
import org.dromara.client.service.IClientUserService;
import org.dromara.client.web.service.IClientAuthStrategy;
import org.dromara.common.core.constant.SystemConstants;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.system.api.model.LoginUser;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 产品用户会话状态拦截器。
 * <p>
 * Admin 停用或删除产品用户、产品应用后，Client 端已有 Token 必须在下一次请求时立即失效。
 *
 * @author Lion Li
 */
@RequiredArgsConstructor
@Component
public class ClientSessionStatusInterceptor implements HandlerInterceptor {

    private final IClientUserService userService;
    private final IClientApplicationService applicationService;

    /**
     * 校验当前 Token 对应的产品用户和产品应用仍然有效。
     *
     * @param request  当前请求
     * @param response 当前响应
     * @param handler  处理器
     * @return 校验通过返回 true
     */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        StpUtil.checkLogin();
        LoginUser loginUser = LoginHelper.getLoginUser();
        if (ObjectUtil.isNull(loginUser)) {
            invalidateSession("产品用户会话不存在");
        }
        ClientUserVo user = userService.queryById(loginUser.getUserId());
        if (ObjectUtil.isNull(user) || !SystemConstants.NORMAL.equals(user.getStatus())) {
            invalidateSession("产品用户已停用或不存在");
        }
        String tokenCredentialVersion = getTokenExtra(IClientAuthStrategy.CLIENT_CREDENTIAL_VERSION_KEY);
        if (!StringUtils.equals(String.valueOf(user.getCredentialVersion()), tokenCredentialVersion)) {
            invalidateSession("产品用户凭证已变更，请重新登录");
        }

        Object clientId = StpUtil.getExtra(LoginHelper.CLIENT_KEY);
        ClientApplicationVo application = ObjectUtil.isNull(clientId)
            ? null
            : applicationService.queryByClientId(clientId.toString());
        if (ObjectUtil.isNull(application) || !SystemConstants.NORMAL.equals(application.getStatus())) {
            invalidateSession("产品应用已停用或不存在");
        }
        String tokenAccessPath = getTokenExtra(LoginHelper.CLIENT_ACCESS_PATH_KEY);
        String tokenIpWhitelist = getTokenExtra(LoginHelper.CLIENT_IP_WHITELIST_KEY);
        if (!StringUtils.equals(application.getAccessPath(), tokenAccessPath)
            || !StringUtils.equals(application.getIpWhitelist(), tokenIpWhitelist)) {
            invalidateSession("产品应用访问规则已变更，请重新登录");
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
