package org.dromara.client.web.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.ObjectUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.client.config.properties.ClientSmsProperties;
import org.dromara.client.domain.vo.ClientApplicationVo;
import org.dromara.client.domain.vo.ClientLoginVo;
import org.dromara.client.domain.vo.ClientUserVo;
import org.dromara.client.service.IClientUserService;
import org.dromara.client.web.service.ClientLoginService;
import org.dromara.client.web.service.IClientAuthStrategy;
import org.dromara.common.core.constant.Constants;
import org.dromara.common.core.constant.GlobalConstants;
import org.dromara.common.core.constant.SystemConstants;
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
import org.dromara.system.api.model.LoginUser;
import org.dromara.system.api.model.SmsLoginBody;
import org.springframework.stereotype.Service;

/**
 * 产品用户短信验证码认证策略。
 *
 * @author Lion Li
 */
@Slf4j
@RequiredArgsConstructor
@Service("sms" + IClientAuthStrategy.BASE_NAME)
public class ClientSmsAuthStrategy implements IClientAuthStrategy {

    private final ClientLoginService loginService;
    private final IClientUserService userService;
    private final ClientSmsProperties smsProperties;

    @Override
    public ClientLoginVo login(String body, ClientApplicationVo client) {
        if (!smsProperties.isEnabled()) {
            throw new ServiceException("短信服务未启用");
        }
        SmsLoginBody loginBody = JsonUtils.parseObject(body, SmsLoginBody.class);
        ValidatorUtils.validate(loginBody);
        ClientUserVo user = loadUserByPhoneNumber(loginBody.getPhoneNumber());
        loginService.checkLogin(LoginType.SMS, loginBody.getPhoneNumber(),
            () -> !validateSmsCode(loginBody.getPhoneNumber(), loginBody.getSmsCode()));
        LoginUser loginUser = loginService.buildLoginUser(user);
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

    private ClientUserVo loadUserByPhoneNumber(String phoneNumber) {
        ClientUserVo user = userService.queryByPhoneNumber(phoneNumber);
        if (ObjectUtil.isNull(user)) {
            log.info("登录用户：{} 不存在.", phoneNumber);
            throw new UserException("user.not.exists", phoneNumber);
        }
        if (SystemConstants.DISABLE.equals(user.getStatus())) {
            log.info("登录用户：{} 已被停用.", phoneNumber);
            throw new UserException("user.blocked", phoneNumber);
        }
        return user;
    }

}
