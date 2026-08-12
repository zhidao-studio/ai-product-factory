package org.dromara.client.domain.port;

import org.dromara.client.domain.model.ClientApplication;

import java.util.Optional;

/** 客户端应用配置持久化端口。 */
public interface ClientApplicationRepository {

    Optional<ClientApplication> findByClientId(String clientId);
}
