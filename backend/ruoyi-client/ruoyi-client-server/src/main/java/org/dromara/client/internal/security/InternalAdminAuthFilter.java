package org.dromara.client.internal.security;

import cn.hutool.core.io.IoUtil;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.client.api.admin.security.InternalAdminAuthConstants;
import org.dromara.client.api.admin.security.InternalAdminHmacSigner;
import org.dromara.client.config.properties.ClientInternalAdminProperties;
import org.dromara.common.core.constant.HttpStatus;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.json.utils.JsonUtils;
import org.dromara.common.mybatis.context.AuditOperatorContext;
import org.dromara.common.redis.utils.RedisUtils;
import org.dromara.common.web.filter.RepeatedlyRequestWrapper;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.regex.Pattern;

/**
 * Client 内部管理接口 HMAC 验签与审计操作者注入过滤器。
 *
 * <p>过滤器在 XSS 清洗前验证原始请求完整性，验证通过后才将可重复读取的请求继续交给
 * 框架原有 XSS 过滤器处理。</p>
 *
 * @author Lion Li
 */
@Slf4j
@RequiredArgsConstructor
public class InternalAdminAuthFilter implements Filter {

    private static final Pattern NONCE_PATTERN = Pattern.compile("^[A-Za-z0-9_-]{16,128}$");

    private static final String NONCE_CACHE_PREFIX = "internal:admin:nonce:";

    private static final byte[] EMPTY_BODY = new byte[0];

    private final ClientInternalAdminProperties properties;

    /**
     * 校验内部服务身份、时间窗口、签名和 nonce，并在当前请求内写入审计操作者上下文。
     */
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain)
        throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        AuditOperatorContext.clear();
        try {
            HttpServletRequest repeatableRequest = wrapRequest(request, response);
            if (!authenticate(repeatableRequest, response)) {
                return;
            }
            chain.doFilter(repeatableRequest, response);
        } finally {
            AuditOperatorContext.clear();
        }
    }

    private boolean authenticate(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            String caller = requiredHeader(request, InternalAdminAuthConstants.HEADER_CALLER);
            String timestamp = requiredHeader(request, InternalAdminAuthConstants.HEADER_TIMESTAMP);
            String nonce = requiredHeader(request, InternalAdminAuthConstants.HEADER_NONCE);
            String operatorIdValue = requiredHeader(request, InternalAdminAuthConstants.HEADER_OPERATOR_ID);
            String actualSignature = requiredHeader(request, InternalAdminAuthConstants.HEADER_SIGNATURE);

            if (!InternalAdminAuthConstants.ADMIN_CALLER.equals(caller)
                || !NONCE_PATTERN.matcher(nonce).matches()
                || StringUtils.isBlank(properties.getSecret())) {
                return reject(request, response);
            }

            Instant requestTime = Instant.ofEpochMilli(Long.parseLong(timestamp));
            Instant currentTime = Instant.now();
            if (requestTime.isBefore(currentTime.minus(properties.getMaxClockSkew()))
                || requestTime.isAfter(currentTime.plus(properties.getMaxClockSkew()))) {
                return reject(request, response);
            }

            long operatorId = Long.parseLong(operatorIdValue);
            if (operatorId <= 0) {
                return reject(request, response);
            }

            byte[] rawBody = readRawBody(request);
            String expectedSignature = InternalAdminHmacSigner.sign(
                properties.getSecret(), request.getMethod(), request.getRequestURI(), request.getQueryString(),
                timestamp, nonce, operatorIdValue, rawBody);
            if (!InternalAdminHmacSigner.matches(expectedSignature, actualSignature)) {
                return reject(request, response);
            }

            String nonceKey = NONCE_CACHE_PREFIX + caller + StringUtils.COLON + nonce;
            if (!RedisUtils.setObjectIfAbsent(nonceKey, StringUtils.EMPTY, properties.getNonceTtl())) {
                return reject(request, response);
            }

            AuditOperatorContext.set(operatorId);
            return true;
        } catch (Exception e) {
            log.warn("Client 内部管理接口认证失败，path={}", request.getRequestURI());
            return reject(request, response);
        }
    }

    private HttpServletRequest wrapRequest(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (StringUtils.startsWithIgnoreCase(request.getContentType(), MediaType.APPLICATION_JSON_VALUE)) {
            return new RepeatedlyRequestWrapper(request, response);
        }
        return request;
    }

    private byte[] readRawBody(HttpServletRequest request) throws IOException {
        if (request instanceof RepeatedlyRequestWrapper repeatableRequest) {
            return IoUtil.readBytes(repeatableRequest.getInputStream(), false);
        }
        if (HttpMethod.POST.matches(request.getMethod())
            || HttpMethod.PUT.matches(request.getMethod())
            || HttpMethod.PATCH.matches(request.getMethod())) {
            throw new IllegalStateException("内部管理写请求缺少 JSON 请求体");
        }
        return EMPTY_BODY;
    }

    private String requiredHeader(HttpServletRequest request, String headerName) {
        String value = request.getHeader(headerName);
        if (StringUtils.isBlank(value) || value.indexOf('\n') >= 0 || value.indexOf('\r') >= 0) {
            throw new IllegalArgumentException("内部服务认证请求头缺失");
        }
        return value;
    }

    private boolean reject(HttpServletRequest request, HttpServletResponse response) throws IOException {
        AuditOperatorContext.clear();
        log.warn("拒绝未通过认证的 Client 内部管理请求，method={}，path={}",
            request.getMethod(), request.getRequestURI());
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(JsonUtils.toJsonString(
            R.fail(HttpStatus.UNAUTHORIZED, "内部服务认证失败")));
        return false;
    }

}
