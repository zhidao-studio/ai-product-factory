package org.dromara.web.config.properties;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

/**
 * Admin 调用 Client 内部管理接口的配置。
 *
 * @author Lion Li
 */
@Data
@Validated
@ConfigurationProperties(prefix = "client-management")
public class ClientManagementProperties {

    /**
     * Client 服务内部访问地址。
     */
    @NotBlank(message = "Client 管理服务地址不能为空")
    private String baseUrl;

    /**
     * Admin 与 Client 之间的 HMAC 共享密钥。
     */
    @NotBlank(message = "Client 管理服务共享密钥不能为空")
    @Size(min = 32, message = "Client 管理服务共享密钥长度不能少于 32 个字符")
    private String secret;

    /**
     * 建立连接和读取响应的超时时间。
     */
    @NotNull(message = "Client 管理服务超时时间不能为空")
    private Duration timeout = Duration.ofSeconds(5);

    /**
     * 校验 HTTP 超时时间必须为正值。
     *
     * @return 是否为有效超时时间
     */
    @AssertTrue(message = "Client 管理服务超时时间必须大于 0")
    public boolean isTimeoutValid() {
        return timeout != null && !timeout.isZero() && !timeout.isNegative();
    }

}
