package org.dromara.client.application;

import cn.hutool.crypto.digest.BCrypt;
import lombok.RequiredArgsConstructor;
import org.dromara.client.application.command.ClientLoginCommand;
import org.dromara.client.domain.model.ClientAccessToken;
import org.dromara.client.domain.model.ClientApplication;
import org.dromara.client.domain.model.ClientExternalIdentity;
import org.dromara.client.domain.model.ClientSession;
import org.dromara.client.domain.model.ClientUser;
import org.dromara.client.domain.port.ClientApplicationRepository;
import org.dromara.client.domain.port.ClientSessionPort;
import org.dromara.client.domain.port.ClientUserRepository;
import org.dromara.client.domain.port.ClientVerificationCodePort;
import org.dromara.client.domain.port.WechatIdentityProvider;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.springframework.stereotype.Service;

/**
 * Client 身份应用服务。
 *
 * <p>这里编排客户端应用、产品用户、外部身份和会话，完全不访问 Admin 的 sys_user。</p>
 */
@Service
@RequiredArgsConstructor
public class ClientAuthApplicationService {

    private final ClientUserRepository userRepository;
    private final ClientApplicationRepository applicationRepository;
    private final ClientSessionPort sessionPort;
    private final ClientVerificationCodePort verificationCodePort;
    private final WechatIdentityProvider wechatIdentityProvider;

    public ClientAccessToken login(ClientLoginCommand command) {
        if (StringUtils.isAnyBlank(command.clientId(), command.grantType())) {
            throw new ServiceException("clientId 和 grantType 不能为空");
        }
        ClientApplication application = applicationRepository.findByClientId(command.clientId())
            .orElseThrow(() -> new ServiceException("客户端应用不存在"));
        if (!application.enabled()) {
            throw new ServiceException("客户端应用已停用");
        }
        if (!application.supports(command.grantType())) {
            throw new ServiceException("当前客户端不支持该登录方式");
        }

        ClientUser user = switch (command.grantType()) {
            case "password" -> passwordLogin(command.username(), command.password(), false);
            case "phonePassword" -> passwordLogin(command.username(), command.password(), true);
            case "sms" -> smsLogin(command.phoneNumber(), command.smsCode());
            case "xcx" -> miniProgramLogin(command.appid(), command.xcxCode());
            default -> throw new ServiceException("不支持的 Client 登录方式");
        };
        if (!user.enabled()) {
            throw new ServiceException("产品用户已停用");
        }
        return sessionPort.issue(user, application);
    }

    public void issueSmsCode(String phoneNumber) {
        if (StringUtils.isBlank(phoneNumber)) {
            throw new ServiceException("手机号不能为空");
        }
        verificationCodePort.issue(phoneNumber);
    }

    public ClientSession currentSession() {
        return sessionPort.current();
    }

    public void logout() {
        sessionPort.logout();
    }

    private ClientUser passwordLogin(String account, String password, boolean byPhone) {
        if (StringUtils.isAnyBlank(account, password)) {
            throw new ServiceException("账号和密码不能为空");
        }
        ClientUser user = (byPhone ? userRepository.findByPhone(account) : userRepository.findByUsername(account))
            .orElseThrow(() -> new ServiceException("产品用户不存在"));
        if (StringUtils.isBlank(user.password()) || !BCrypt.checkpw(password, user.password())) {
            throw new ServiceException("账号或密码错误");
        }
        return user;
    }

    private ClientUser smsLogin(String phoneNumber, String smsCode) {
        if (StringUtils.isAnyBlank(phoneNumber, smsCode)) {
            throw new ServiceException("手机号和短信验证码不能为空");
        }
        if (!verificationCodePort.verify(phoneNumber, smsCode)) {
            throw new ServiceException("短信验证码错误或已过期");
        }
        return userRepository.findByPhone(phoneNumber)
            .orElseThrow(() -> new ServiceException("手机号尚未绑定产品用户"));
    }

    private ClientUser miniProgramLogin(String appId, String code) {
        if (StringUtils.isAnyBlank(appId, code)) {
            throw new ServiceException("微信 appid 和临时登录码不能为空");
        }
        ClientExternalIdentity identity = wechatIdentityProvider.exchange(appId, code);
        return userRepository.findByExternalIdentity(identity.source(), identity.openId())
            .orElseGet(() -> userRepository.createFromExternalIdentity(identity, "微信用户"));
    }
}
