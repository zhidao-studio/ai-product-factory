package org.dromara.client.config.properties;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

/**
 * Admin 调用 Client 内部管理接口的认证配置。
 *
 * @author Lion Li
 */
@Data
@Validated
@ConfigurationProperties(prefix = "client.internal-admin")
public class ClientInternalAdminProperties {

    /**
     * Admin 与 Client 共享的 HMAC 密钥。
     */
    @NotBlank(message = "Client 内部管理接口共享密钥不能为空")
    @Size(min = 32, message = "Client 内部管理接口共享密钥长度不能少于 32 个字符")
    private String secret;

    /**
     * 允许的最大时钟偏差。
     */
    @NotNull(message = "Client 内部管理接口最大时钟偏差不能为空")
    private Duration maxClockSkew = Duration.ofMinutes(5);

    /**
     * 请求 nonce 的防重放有效期。
     */
    @NotNull(message = "Client 内部管理接口 nonce 有效期不能为空")
    private Duration nonceTtl = Duration.ofMinutes(10);

    /**
     * 校验时间配置必须为正值。
     *
     * @return 是否为有效时间配置
     */
    @AssertTrue(message = "Client 内部管理接口时间配置必须大于 0")
    public boolean isDurationConfigValid() {
        return isPositive(maxClockSkew) && isPositive(nonceTtl);
    }

    /**
     * nonce 必须覆盖请求时间戳前后两个方向的完整有效窗口。
     *
     * @return nonce 有效期是否足以阻止窗口内重放
     */
    @AssertTrue(message = "Client 内部管理接口 nonce 有效期不能小于最大时钟偏差的两倍")
    public boolean isReplayWindowValid() {
        if (!isPositive(maxClockSkew) || !isPositive(nonceTtl)) {
            return true;
        }
        try {
            return nonceTtl.compareTo(maxClockSkew.multipliedBy(2)) >= 0;
        } catch (ArithmeticException e) {
            return false;
        }
    }

    private boolean isPositive(Duration duration) {
        return duration != null && !duration.isZero() && !duration.isNegative();
    }

}
