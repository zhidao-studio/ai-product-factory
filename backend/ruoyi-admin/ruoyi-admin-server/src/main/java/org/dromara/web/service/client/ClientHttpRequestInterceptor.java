package org.dromara.web.service.client;

import lombok.RequiredArgsConstructor;
import org.dromara.client.api.admin.security.InternalAdminAuthConstants;
import org.dromara.client.api.admin.security.InternalAdminHmacSigner;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.satoken.utils.LoginHelper;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpResponse;

import java.io.IOException;
import java.net.URI;
import java.util.UUID;

/**
 * 为 Admin 发往 Client 的内部管理请求补充服务身份和 HMAC 签名。
 *
 * @author Lion Li
 */
@RequiredArgsConstructor
public class ClientHttpRequestInterceptor implements org.springframework.http.client.ClientHttpRequestInterceptor {

    private final String secret;

    /**
     * 使用最终序列化的请求体和实际 URI 生成签名。
     */
    @Override
    public ClientHttpResponse intercept(HttpRequest request, byte[] body,
                                        ClientHttpRequestExecution execution) throws IOException {
        Long currentUserId = LoginHelper.getUserId();
        if (currentUserId == null) {
            throw new ServiceException("无法识别当前 Admin 操作人");
        }
        String timestamp = Long.toString(System.currentTimeMillis());
        String nonce = UUID.randomUUID().toString().replace("-", "");
        String operatorId = currentUserId.toString();
        String operatorDeptId = value(LoginHelper.getDeptId());
        URI uri = request.getURI();
        String signature = InternalAdminHmacSigner.sign(secret, request.getMethod().name(),
            uri.getRawPath(), uri.getRawQuery(), timestamp, nonce, operatorId, operatorDeptId, body);

        request.getHeaders().set(InternalAdminAuthConstants.HEADER_CALLER,
            InternalAdminAuthConstants.ADMIN_CALLER);
        request.getHeaders().set(InternalAdminAuthConstants.HEADER_TIMESTAMP, timestamp);
        request.getHeaders().set(InternalAdminAuthConstants.HEADER_NONCE, nonce);
        request.getHeaders().set(InternalAdminAuthConstants.HEADER_OPERATOR_ID, operatorId);
        request.getHeaders().set(InternalAdminAuthConstants.HEADER_OPERATOR_DEPT_ID, operatorDeptId);
        request.getHeaders().set(InternalAdminAuthConstants.HEADER_SIGNATURE, signature);
        return execution.execute(request, body);
    }

    private String value(Long value) {
        return value == null ? "-1" : value.toString();
    }

}
