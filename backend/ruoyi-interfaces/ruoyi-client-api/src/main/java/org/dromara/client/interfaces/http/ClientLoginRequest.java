package org.dromara.client.interfaces.http;

/** Client 统一登录请求。各端只提交自己登录方式所需的字段。 */
public record ClientLoginRequest(
    String clientId,
    String grantType,
    String username,
    String phoneNumber,
    String password,
    String smsCode,
    String appid,
    String xcxCode
) {
}
