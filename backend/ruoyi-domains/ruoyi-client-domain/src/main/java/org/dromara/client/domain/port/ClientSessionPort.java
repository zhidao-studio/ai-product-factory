package org.dromara.client.domain.port;

import org.dromara.client.domain.model.ClientAccessToken;
import org.dromara.client.domain.model.ClientApplication;
import org.dromara.client.domain.model.ClientSession;
import org.dromara.client.domain.model.ClientUser;

/** 产品用户 Token 与会话端口。 */
public interface ClientSessionPort {

    ClientAccessToken issue(ClientUser user, ClientApplication application);

    ClientSession current();

    void logout();
}
