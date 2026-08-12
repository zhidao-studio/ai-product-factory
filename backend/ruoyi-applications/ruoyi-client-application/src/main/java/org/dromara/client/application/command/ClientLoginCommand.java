package org.dromara.client.application.command;

/** Client 统一登录命令，不向领域层暴露 HTTP 请求对象。 */
public record ClientLoginCommand(
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
