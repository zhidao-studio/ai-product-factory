package org.dromara.client.domain.port;

import org.dromara.client.domain.model.ClientExternalIdentity;
import org.dromara.client.domain.model.ClientUser;

import java.util.Optional;

/** 产品用户持久化端口。 */
public interface ClientUserRepository {

    Optional<ClientUser> findByUsername(String username);

    Optional<ClientUser> findByPhone(String phone);

    Optional<ClientUser> findByExternalIdentity(String source, String openId);

    ClientUser createFromExternalIdentity(ClientExternalIdentity identity, String nickname);
}
