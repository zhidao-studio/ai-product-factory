package org.dromara.client.web.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.ObjectUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.zhyd.oauth.config.AuthConfig;
import me.zhyd.oauth.model.AuthCallback;
import me.zhyd.oauth.model.AuthResponse;
import me.zhyd.oauth.model.AuthToken;
import me.zhyd.oauth.model.AuthUser;
import me.zhyd.oauth.request.AuthRequest;
import me.zhyd.oauth.request.AuthWechatMiniProgramRequest;
import org.dromara.client.domain.bo.ClientIdentityBo;
import org.dromara.client.domain.vo.ClientApplicationVo;
import org.dromara.client.domain.vo.ClientIdentityVo;
import org.dromara.client.domain.vo.ClientLoginVo;
import org.dromara.client.domain.vo.ClientUserVo;
import org.dromara.client.service.IClientIdentityService;
import org.dromara.client.service.IClientUserService;
import org.dromara.client.web.service.ClientLoginService;
import org.dromara.client.web.service.ClientRegistrationService;
import org.dromara.client.web.service.IClientAuthStrategy;
import org.dromara.common.core.constant.SystemConstants;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.exception.user.UserException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.core.utils.ValidatorUtils;
import org.dromara.common.json.utils.JsonUtils;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.system.api.model.LoginUser;
import org.dromara.system.api.model.XcxLoginBody;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

/**
 * 产品用户微信小程序认证策略。
 *
 * @author Lion Li
 */
@Slf4j
@RequiredArgsConstructor
@Service("xcx" + IClientAuthStrategy.BASE_NAME)
public class ClientXcxAuthStrategy implements IClientAuthStrategy {

    private static final String WECHAT_MINIAPP_SOURCE = "wechat_miniapp";

    private static final String DEFAULT_NICK_NAME = "微信用户";

    private static final int MAX_ACCOUNT_LENGTH = 30;

    @Value("${client.wechat.miniapp.app-id:}")
    private String configuredAppId;

    @Value("${client.wechat.miniapp.app-secret:}")
    private String appSecret;

    private final ClientLoginService loginService;
    private final ClientRegistrationService registrationService;
    private final IClientUserService userService;
    private final IClientIdentityService identityService;

    @Override
    public ClientLoginVo login(String body, ClientApplicationVo client) {
        XcxLoginBody loginBody = JsonUtils.parseObject(body, XcxLoginBody.class);
        ValidatorUtils.validate(loginBody);
        if (StringUtils.isAnyBlank(configuredAppId, appSecret)) {
            throw new ServiceException("微信小程序 app-id 或 app-secret 未配置");
        }
        if (StringUtils.isNotBlank(loginBody.getAppid())
            && !StringUtils.equals(configuredAppId, loginBody.getAppid())) {
            throw new ServiceException("微信小程序 app-id 与服务端配置不一致");
        }
        AuthRequest request = new AuthWechatMiniProgramRequest(AuthConfig.builder()
            .clientId(configuredAppId)
            .clientSecret(appSecret)
            .ignoreCheckRedirectUri(true)
            .ignoreCheckState(true)
            .build());
        AuthCallback callback = new AuthCallback();
        callback.setCode(loginBody.getXcxCode());
        AuthResponse<AuthUser> response = request.login(callback);
        if (!response.ok()) {
            throw new ServiceException(StringUtils.blankToDefault(response.getMsg(), "微信小程序登录凭证校验失败"));
        }
        AuthUser authUser = response.getData();
        if (ObjectUtil.isNull(authUser) || ObjectUtil.isNull(authUser.getToken())
            || StringUtils.isBlank(authUser.getToken().getOpenId())) {
            throw new ServiceException("微信小程序登录凭证校验失败");
        }
        AuthToken token = authUser.getToken();
        ClientIdentityVo identity = loadOrRegisterIdentity(authUser, token);
        ClientUserVo user = userService.queryById(identity.getUserId());
        validateUser(user, token.getOpenId());
        refreshIdentity(identity, authUser, token);

        LoginUser loginUser = loginService.buildLoginUser(user);
        loginUser.setClientKey(client.getClientKey());
        loginUser.setDeviceType(client.getDeviceType());
        LoginHelper.login(loginUser, IClientAuthStrategy.buildLoginParameter(client, user));
        loginService.recordLoginSuccess(user);

        ClientLoginVo loginVo = new ClientLoginVo();
        loginVo.setAccessToken(StpUtil.getTokenValue());
        loginVo.setExpireIn(StpUtil.getTokenTimeout());
        loginVo.setClientId(client.getClientId());
        return loginVo;
    }

    private ClientIdentityVo loadOrRegisterIdentity(AuthUser authUser, AuthToken token) {
        ClientIdentityVo identity = identityService.queryBySourceAndOpenId(WECHAT_MINIAPP_SOURCE, token.getOpenId());
        if (ObjectUtil.isNotNull(identity)) {
            return identity;
        }
        String authId = WECHAT_MINIAPP_SOURCE + token.getOpenId();
        try {
            return registrationService.register(authId, WECHAT_MINIAPP_SOURCE, authUser, token);
        } catch (DuplicateKeyException ex) {
            identity = identityService.queryBySourceAndOpenId(WECHAT_MINIAPP_SOURCE, token.getOpenId());
            if (ObjectUtil.isNotNull(identity)) {
                return identity;
            }
            throw ex;
        }
    }

    private void validateUser(ClientUserVo user, String openId) {
        if (ObjectUtil.isNull(user)) {
            log.info("微信用户：{} 未关联有效产品用户.", openId);
            throw new UserException("user.not.exists", openId);
        }
        if (SystemConstants.DISABLE.equals(user.getStatus())) {
            throw new UserException("user.blocked", user.getUserName());
        }
    }

    private void refreshIdentity(ClientIdentityVo identity, AuthUser authUser, AuthToken token) {
        ClientIdentityBo bo = new ClientIdentityBo();
        bo.setId(identity.getId());
        bo.setUserId(identity.getUserId());
        bo.setAuthId(WECHAT_MINIAPP_SOURCE + token.getOpenId());
        bo.setSource(WECHAT_MINIAPP_SOURCE);
        bo.setAccessToken(StringUtils.blankToDefault(token.getAccessToken(), identity.getAccessToken()));
        bo.setExpireIn(token.getExpireIn());
        bo.setRefreshToken(token.getRefreshToken());
        bo.setOpenId(token.getOpenId());
        bo.setUnionId(token.getUnionId());
        bo.setUserName(limitLength(authUser.getUsername(), identity.getUserName()));
        bo.setNickName(limitLength(authUser.getNickname(),
            StringUtils.blankToDefault(identity.getNickName(), DEFAULT_NICK_NAME)));
        bo.setAvatar(authUser.getAvatar());
        bo.setScope(token.getScope());
        bo.setTokenType(token.getTokenType());
        identityService.updateByBo(bo);
    }

    private String limitLength(String value, String defaultValue) {
        String result = StringUtils.blankToDefault(value, defaultValue);
        if (StringUtils.length(result) <= MAX_ACCOUNT_LENGTH) {
            return result;
        }
        return result.substring(0, MAX_ACCOUNT_LENGTH);
    }

}
