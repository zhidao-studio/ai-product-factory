package org.dromara.client.web.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.crypto.digest.BCrypt;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.client.api.model.ClientLoginUser;
import org.dromara.client.api.model.ClientPasswordLoginBody;
import org.dromara.client.um.domain.vo.AppClientVo;
import org.dromara.client.um.domain.vo.AppUserVo;
import org.dromara.client.um.service.IAppUserService;
import org.dromara.client.web.domain.vo.ClientLoginVo;
import org.dromara.client.web.service.ClientLoginService;
import org.dromara.client.web.service.IClientAuthStrategy;
import org.dromara.common.core.constant.SystemConstants;
import org.dromara.common.core.enums.LoginType;
import org.dromara.common.core.exception.user.UserException;
import org.dromara.common.core.utils.ValidatorUtils;
import org.dromara.common.json.utils.JsonUtils;
import org.dromara.common.satoken.utils.LoginHelper;
import org.springframework.stereotype.Service;

/**
 * 应用用户手机号密码认证策略。
 *
 * @author Lion Li
 */
@Slf4j
@RequiredArgsConstructor
@Service("phonePassword" + IClientAuthStrategy.BASE_NAME)
public class ClientPhonePasswordAuthStrategy implements IClientAuthStrategy {

    private final ClientLoginService loginService;
    private final IAppUserService userService;

    @Override
    public ClientLoginVo login(String body, AppClientVo client) {
        ClientPasswordLoginBody loginBody = JsonUtils.parseObject(body, ClientPasswordLoginBody.class);
        ValidatorUtils.validate(loginBody);
        String phoneNumber = loginBody.getUsername();
        AppUserVo user = loadUserByPhoneNumber(phoneNumber);
        loginService.checkLogin(LoginType.PASSWORD, phoneNumber,
            () -> !BCrypt.checkpw(loginBody.getPassword(), user.getPassword()));
        ClientLoginUser loginUser = loginService.buildLoginUser(user);
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

    private AppUserVo loadUserByPhoneNumber(String phoneNumber) {
        AppUserVo user = userService.queryByPhoneNumber(phoneNumber);
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
