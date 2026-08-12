package org.dromara.client.domain.model;

import java.util.Arrays;

/**
 * H5、App、小程序或 HarmonyOS 对应的客户端应用配置。
 */
public record ClientApplication(
    String clientId,
    String clientKey,
    String grantTypes,
    String deviceType,
    long timeout,
    long activeTimeout,
    String status
) {

    public boolean enabled() {
        return "0".equals(status);
    }

    public boolean supports(String grantType) {
        return grantType != null && Arrays.stream(grantTypes.split(","))
            .map(String::trim)
            .anyMatch(grantType::equals);
    }
}
