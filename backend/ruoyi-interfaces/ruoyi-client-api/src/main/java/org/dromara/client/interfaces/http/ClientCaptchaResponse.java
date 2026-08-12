package org.dromara.client.interfaces.http;

/** Client 默认关闭图片验证码，网关防刷和短信验证码承担用户端风险控制。 */
public record ClientCaptchaResponse(boolean captchaEnabled, String uuid, String img) {
}
