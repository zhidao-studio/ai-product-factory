package org.dromara.client.web.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.crypto.digest.BCrypt;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.client.domain.vo.ClientApplicationVo;
import org.dromara.client.domain.vo.ClientLoginVo;
import org.dromara.client.domain.vo.ClientUserVo;
import org.dromara.client.service.IClientUserService;
import org.dromara.client.web.service.ClientLoginService;
import org.dromara.client.web.service.IClientAuthStrategy;
import org.dromara.common.core.constant.SystemConstants;
import org.dromara.common.core.constant.Constants;
import org.dromara.common.core.constant.GlobalConstants;
import org.dromara.common.core.enums.LoginType;
import org.dromara.common.core.exception.user.CaptchaException;
import org.dromara.common.core.exception.user.CaptchaExpireException;
import org.dromara.common.core.exception.user.UserException;
import org.dromara.common.core.utils.MessageUtils;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.core.utils.ValidatorUtils;
import org.dromara.common.json.utils.JsonUtils;
import org.dromara.common.redis.utils.RedisUtils;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.common.web.config.properties.CaptchaProperties;
import org.dromara.system.api.model.LoginUser;
import org.dromara.system.api.model.PasswordLoginBody;
import org.springframework.stereotype.Service;

/**
 * 产品用户账号密码认证策略。
 *
 * @author Lion Li
 */
@Slf4j
@RequiredArgsConstructor
@Service("password" + IClientAuthStrategy.BASE_NAME)
public class ClientPasswordAuthStrategy implements IClientAuthStrategy {

    private final ClientLoginService loginService;
    private final IClientUserService userService;
    private final CaptchaProperties captchaProperties;

    @Override
    public ClientLoginVo login(String body, ClientApplicationVo client) {
        PasswordLoginBody loginBody = JsonUtils.parseObject(body, PasswordLoginBody.class);
        ValidatorUtils.validate(loginBody);
        if (captchaProperties.getEnable()) {
            validateCaptcha(loginBody.getUsername(), loginBody.getCode(), loginBody.getUuid());
        }
        ClientUserVo user = loadUserByUserName(loginBody.getUsername());
        loginService.checkLogin(LoginType.PASSWORD, loginBody.getUsername(),
            () -> !BCrypt.checkpw(loginBody.getPassword(), user.getPassword()));
        return login(user, client);
    }

    private void validateCaptcha(String username, String code, String uuid) {
        String verifyKey = GlobalConstants.CAPTCHA_CODE_KEY + StringUtils.blankToDefault(uuid, StringUtils.EMPTY);
        String captcha = RedisUtils.getCacheObject(verifyKey);
        RedisUtils.deleteObject(verifyKey);
        if (captcha == null) {
            loginService.recordLoginInfo(username, Constants.LOGIN_FAIL,
                MessageUtils.message("user.jcaptcha.expire"));
            throw new CaptchaExpireException();
        }
        if (!StringUtils.equalsIgnoreCase(code, captcha)) {
            loginService.recordLoginInfo(username, Constants.LOGIN_FAIL,
                MessageUtils.message("user.jcaptcha.error"));
            throw new CaptchaException();
        }
    }

    private ClientUserVo loadUserByUserName(String userName) {
        ClientUserVo user = userService.queryByUserName(userName);
        return validateUser(user, userName);
    }

    private ClientUserVo validateUser(ClientUserVo user, String loginName) {
        if (ObjectUtil.isNull(user)) {
            log.info("登录用户：{} 不存在.", loginName);
            throw new UserException("user.not.exists", loginName);
        }
        if (SystemConstants.DISABLE.equals(user.getStatus())) {
            log.info("登录用户：{} 已被停用.", loginName);
            throw new UserException("user.blocked", loginName);
        }
        return user;
    }

    private ClientLoginVo login(ClientUserVo user, ClientApplicationVo client) {
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

}
