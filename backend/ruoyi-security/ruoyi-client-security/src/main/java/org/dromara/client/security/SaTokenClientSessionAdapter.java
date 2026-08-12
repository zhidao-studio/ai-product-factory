package org.dromara.client.security;

import cn.dev33.satoken.session.SaSession;
import cn.dev33.satoken.stp.StpLogic;
import cn.dev33.satoken.stp.parameter.SaLoginParameter;
import org.dromara.client.domain.model.ClientAccessToken;
import org.dromara.client.domain.model.ClientApplication;
import org.dromara.client.domain.model.ClientSession;
import org.dromara.client.domain.model.ClientUser;
import org.dromara.client.domain.port.ClientSessionPort;
import org.dromara.common.core.exception.ServiceException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

/** Client 产品用户会话的 Sa-Token 适配器。 */
@Component
public class SaTokenClientSessionAdapter implements ClientSessionPort {

    public static final String PRINCIPAL_KEY = "clientPrincipal";

    private final StpLogic clientStpLogic;

    public SaTokenClientSessionAdapter(@Qualifier("clientStpLogic") StpLogic clientStpLogic) {
        this.clientStpLogic = clientStpLogic;
    }

    @Override
    public ClientAccessToken issue(ClientUser user, ClientApplication application) {
        SaLoginParameter parameter = new SaLoginParameter()
            .setDeviceType(application.deviceType())
            .setTimeout(application.timeout())
            .setActiveTimeout(application.activeTimeout());
        clientStpLogic.login("client:" + user.id(), parameter);
        ClientPrincipal principal = new ClientPrincipal(
            user.id(), user.username(), user.nickname(), user.avatar(),
            application.clientId(), application.deviceType());
        clientStpLogic.getTokenSession().set(PRINCIPAL_KEY, principal);
        return new ClientAccessToken(
            clientStpLogic.getTokenValue(), clientStpLogic.getTokenTimeout(), application.clientId());
    }

    @Override
    public ClientSession current() {
        clientStpLogic.checkLogin();
        SaSession session = clientStpLogic.getTokenSession();
        ClientPrincipal principal = session.getModel(PRINCIPAL_KEY, ClientPrincipal.class);
        if (principal == null) {
            throw new ServiceException("Client 会话主体不存在，请重新登录");
        }
        return new ClientSession(
            principal.userId(), principal.username(), principal.nickname(), principal.avatar(),
            principal.clientId(), principal.deviceType());
    }

    @Override
    public void logout() {
        clientStpLogic.logout();
    }
}
