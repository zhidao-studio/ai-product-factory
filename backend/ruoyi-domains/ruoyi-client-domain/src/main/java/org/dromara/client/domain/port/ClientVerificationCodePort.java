package org.dromara.client.domain.port;

/** Client 短信验证码存储与校验端口。 */
public interface ClientVerificationCodePort {

    void issue(String phoneNumber);

    boolean verify(String phoneNumber, String code);
}
