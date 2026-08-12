package org.dromara.client.integration.sms;

import cn.hutool.core.util.RandomUtil;
import org.dromara.client.domain.port.ClientVerificationCodePort;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.redis.utils.RedisUtils;
import org.dromara.sms4j.api.SmsBlend;
import org.dromara.sms4j.api.entity.SmsResponse;
import org.dromara.sms4j.core.factory.SmsFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.LinkedHashMap;

/** 短信服务商发送与 Redis 一次性验证码存储适配。 */
@Component
public class SmsClientVerificationCodeAdapter implements ClientVerificationCodePort {

    private static final String KEY_PREFIX = "client:captcha:sms:";

    @Value("${client.sms.config-id:config1}")
    private String configId;

    @Value("${client.sms.template-id:}")
    private String templateId;

    @Value("${client.sms.expiration-minutes:5}")
    private long expirationMinutes;

    @Override
    public void issue(String phoneNumber) {
        String code = RandomUtil.randomNumbers(6);
        LinkedHashMap<String, String> parameters = new LinkedHashMap<>(1);
        parameters.put("code", code);
        SmsBlend smsBlend = SmsFactory.getSmsBlend(configId);
        SmsResponse response = smsBlend.sendMessage(phoneNumber, templateId, parameters);
        if (!response.isSuccess()) {
            throw new ServiceException("验证码短信发送失败");
        }
        RedisUtils.setCacheObject(KEY_PREFIX + phoneNumber, code, Duration.ofMinutes(expirationMinutes));
    }

    @Override
    public boolean verify(String phoneNumber, String code) {
        String key = KEY_PREFIX + phoneNumber;
        String expected = RedisUtils.getCacheObject(key);
        RedisUtils.deleteObject(key);
        return expected != null && expected.equalsIgnoreCase(code);
    }
}
