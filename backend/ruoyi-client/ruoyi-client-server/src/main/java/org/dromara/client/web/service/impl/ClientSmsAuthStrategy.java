package org.dromara.client.web.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.ObjectUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.client.api.model.ClientLoginUser;
import org.dromara.client.api.model.ClientSmsLoginBody;
import org.dromara.client.config.properties.ClientSmsProperties;
import org.dromara.client.um.constant.AppDataConstants;
import org.dromara.client.um.domain.vo.AppClientVo;
import org.dromara.client.um.domain.vo.AppUserVo;
import org.dromara.client.um.service.IAppUserService;
import org.dromara.client.web.domain.vo.ClientLoginVo;
import org.dromara.client.web.service.ClientLoginService;
import org.dromara.client.web.service.IClientAuthStrategy;
import org.dromara.common.core.constant.Constants;
import org.dromara.common.core.constant.GlobalConstants;
import org.dromara.common.core.enums.LoginType;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.exception.user.CaptchaExpireException;
import org.dromara.common.core.exception.user.UserException;
import org.dromara.common.core.utils.MessageUtils;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.core.utils.ValidatorUtils;
import org.dromara.common.json.utils.JsonUtils;
import org.dromara.common.redis.utils.RedisUtils;
import org.dromara.common.satoken.utils.LoginHelper;
import org.springframework.stereotype.Service;

/**
 * 应用用户短信验证码认证策略。
 *
 * @author Lion Li
 */
@Slf4j
@RequiredArgsConstructor
@Service("sms" + IClientAuthStrategy.BASE_NAME)
public class ClientSmsAuthStrategy implements IClientAuthStrategy {

    private final ClientLoginService loginService;
    private final IAppUserService userService;
    private final ClientSmsProperties smsProperties;

    @Override
    public ClientLoginVo login(String body, AppClientVo client) {
        if (!smsProperties.isEnabled()) {
            throw new ServiceException("短信服务未启用");
        }
        ClientSmsLoginBody loginBody = JsonUtils.parseObject(body, ClientSmsLoginBody.class);
        ValidatorUtils.validate(loginBody);
        AppUserVo user = loadUserByPhoneNumber(loginBody.getPhoneNumber());
        loginService.checkLogin(LoginType.SMS, loginBody.getPhoneNumber(),
            () -> !validateSmsCode(loginBody.getPhoneNumber(), loginBody.getSmsCode()));
        ClientLoginUser loginUser = loginService.buildLoginUser(user);
        loginUser.setClientKey(client.getClientKey());
        loginUser.setDeviceType(client.getDeviceType());
        LoginHelper.login(loginUser, IClientAuthStrategy.buildLoginParameter(client, user));
        RedisUtils.deleteObject(GlobalConstants.CAPTCHA_CODE_KEY + loginBody.getPhoneNumber());
        loginService.recordLoginSuccess(user);
        ClientLoginVo loginVo = new ClientLoginVo();
        loginVo.setAccessToken(StpUtil.getTokenValue());
        loginVo.setExpireIn(StpUtil.getTokenTimeout());
        loginVo.setClientId(client.getClientId());
        return loginVo;
    }

    private boolean validateSmsCode(String phoneNumber, String smsCode) {
        String code = RedisUtils.getCacheObject(GlobalConstants.CAPTCHA_CODE_KEY + phoneNumber);
        if (StringUtils.isBlank(code)) {
            loginService.recordLoginInfo(phoneNumber, Constants.LOGIN_FAIL,
                MessageUtils.message("user.jcaptcha.expire"));
            throw new CaptchaExpireException();
        }
        return StringUtils.equals(code, smsCode);
    }

    private AppUserVo loadUserByPhoneNumber(String phoneNumber) {
        AppUserVo user = userService.queryByPhoneNumber(phoneNumber);
        if (ObjectUtil.isNull(user)) {
            log.info("登录用户：{} 不存在.", phoneNumber);
            throw new UserException("user.not.exists", phoneNumber);
        }
        if (!AppDataConstants.VALID.equals(user.getValidFlag())) {
            log.info("登录用户：{} 已无效.", phoneNumber);
            throw new UserException("user.blocked", phoneNumber);
        }
        return user;
    }

}
