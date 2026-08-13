package org.dromara.client.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import cn.hutool.captcha.generator.CodeGenerator;
import cn.hutool.captcha.generator.MathGenerator;
import cn.hutool.captcha.generator.RandomGenerator;
import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.RandomUtil;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.client.config.properties.ClientSmsProperties;
import org.dromara.common.core.constant.Constants;
import org.dromara.common.core.constant.GlobalConstants;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.utils.SpringUtils;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.core.utils.regex.RegexValidator;
import org.dromara.common.redis.annotation.RateLimiter;
import org.dromara.common.redis.enums.LimitType;
import org.dromara.common.redis.utils.RedisUtils;
import org.dromara.common.web.config.properties.CaptchaProperties;
import org.dromara.common.web.core.WaveAndCircleCaptcha;
import org.dromara.sms4j.api.SmsBlend;
import org.dromara.sms4j.api.entity.SmsResponse;
import org.dromara.sms4j.core.factory.SmsFactory;
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.awt.Font;
import java.time.Duration;
import java.util.LinkedHashMap;

/**
 * 应用用户验证码控制器。
 *
 * @author Lion Li
 */
@SaIgnore
@Slf4j
@Validated
@RequiredArgsConstructor
@RestController
public class ClientCaptchaController {

    private final CaptchaProperties captchaProperties;
    private final ClientSmsProperties smsProperties;

    /**
     * 发送短信验证码。
     *
     * @param phoneNumber 用户手机号
     * @return 操作结果
     */
    @GetMapping("/resource/sms/code")
    public R<Void> smsCode(@NotBlank(message = "{user.phonenumber.not.blank}") String phoneNumber) {
        if (!smsProperties.isEnabled()) {
            return R.fail("短信服务未启用");
        }
        if (!RegexValidator.isMobile(phoneNumber)) {
            return R.fail("请输入正确的手机号！");
        }
        return SpringUtils.getAopProxy(this).smsCodeImpl(phoneNumber);
    }

    /**
     * 实际发送短信验证码，避免服务关闭时仍触发限流。
     *
     * @param phoneNumber 用户手机号
     * @return 操作结果
     */
    @RateLimiter(key = "#phoneNumber", time = 60, count = 1)
    public R<Void> smsCodeImpl(String phoneNumber) {
        String code = RandomUtil.randomNumbers(4);
        LinkedHashMap<String, String> params = new LinkedHashMap<>(1);
        params.put("code", code);
        SmsBlend smsBlend = SmsFactory.getSmsBlend("config1");
        SmsResponse response = smsBlend.sendMessage(phoneNumber, "", params);
        if (!response.isSuccess()) {
            log.error("验证码短信发送异常 => {}", response);
            Object data = response.getData();
            return R.fail(data == null ? "验证码短信发送失败" : data.toString());
        }
        RedisUtils.setCacheObject(GlobalConstants.CAPTCHA_CODE_KEY + phoneNumber, code,
            Duration.ofMinutes(Constants.CAPTCHA_EXPIRATION));
        return R.ok();
    }

    /**
     * 获取图片验证码。
     *
     * @return 验证码信息
     */
    @GetMapping("/auth/code")
    public R<CaptchaVo> getCode() {
        if (!captchaProperties.getEnable()) {
            return R.ok(new CaptchaVo(false, null, null));
        }
        return R.ok(SpringUtils.getAopProxy(this).getCodeImpl());
    }

    /**
     * 实际生成图片验证码并缓存结果。
     *
     * @return 验证码信息
     */
    @RateLimiter(time = 60, count = 10, limitType = LimitType.IP)
    public CaptchaVo getCodeImpl() {
        String uuid = IdUtil.simpleUUID();
        String verifyKey = GlobalConstants.CAPTCHA_CODE_KEY + uuid;
        CodeGenerator codeGenerator;
        if ("math".equals(captchaProperties.getType())) {
            codeGenerator = new MathGenerator(captchaProperties.getNumberLength(), false);
        } else {
            codeGenerator = new RandomGenerator(captchaProperties.getCharLength());
        }
        WaveAndCircleCaptcha captcha = new WaveAndCircleCaptcha(160, 60);
        captcha.setFont(new Font("Arial", Font.BOLD, 45));
        captcha.setGenerator(codeGenerator);
        captcha.createCode();
        String code = captcha.getCode();
        if ("math".equals(captchaProperties.getType())) {
            ExpressionParser parser = new SpelExpressionParser();
            Expression expression = parser.parseExpression(StringUtils.remove(code, "="));
            code = expression.getValue(String.class);
        }
        RedisUtils.setCacheObject(verifyKey, code, Duration.ofMinutes(Constants.CAPTCHA_EXPIRATION));
        return new CaptchaVo(true, uuid, captcha.getImageBase64());
    }

    /**
     * 图片验证码响应对象。
     *
     * @param captchaEnabled 是否启用验证码
     * @param uuid           验证码标识
     * @param img            Base64 图片数据
     */
    public record CaptchaVo(Boolean captchaEnabled, String uuid, String img) {
    }

}
