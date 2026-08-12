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
import org.dromara.common.core.enums.LoginType;
import org.dromara.common.core.exception.user.UserException;
import org.dromara.common.core.utils.ValidatorUtils;
import org.dromara.common.json.utils.JsonUtils;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.system.api.model.LoginUser;
import org.dromara.system.api.model.PasswordLoginBody;
import org.springframework.stereotype.Service;

/**
 * 产品用户手机号密码认证策略。
 *
 * @author Lion Li
 */
@Slf4j
@RequiredArgsConstructor
@Service("phonePassword" + IClientAuthStrategy.BASE_NAME)
public class ClientPhonePasswordAuthStrategy implements IClientAuthStrategy {

    private final ClientLoginService loginService;
    private final IClientUserService userService;

    @Override
    public ClientLoginVo login(String body, ClientApplicationVo client) {
        PasswordLoginBody loginBody = JsonUtils.parseObject(body, PasswordLoginBody.class);
        ValidatorUtils.validate(loginBody);
        String phoneNumber = loginBody.getUsername();
        ClientUserVo user = loadUserByPhoneNumber(phoneNumber);
        loginService.checkLogin(LoginType.PASSWORD, phoneNumber,
            () -> !BCrypt.checkpw(loginBody.getPassword(), user.getPassword()));
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
