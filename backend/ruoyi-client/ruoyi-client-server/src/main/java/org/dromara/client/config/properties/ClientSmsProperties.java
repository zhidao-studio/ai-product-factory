package org.dromara.client.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Client 短信配置属性。
 *
 * @author Lion Li
 */
@Data
@Component
@ConfigurationProperties(prefix = "sms")
public class ClientSmsProperties {

    /**
     * 是否启用短信服务。
     */
    private boolean enabled = false;

}
