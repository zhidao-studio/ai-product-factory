package org.dromara.client.api.admin.security;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Locale;

/**
 * Admin 调用 Client 内部管理接口的 HMAC-SHA256 签名工具。
 *
 * @author Lion Li
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class InternalAdminHmacSigner {

    private static final String HMAC_SHA256 = "HmacSHA256";

    private static final String SHA_256 = "SHA-256";

    private static final byte[] EMPTY_BODY = new byte[0];

    /**
     * 生成请求签名。
     *
     * @param secret         服务共享密钥
     * @param method         HTTP 方法
     * @param rawPath        原始请求路径
     * @param rawQuery       原始查询串，无查询参数时传空
     * @param timestamp      毫秒级 Unix 时间戳
     * @param nonce          一次性随机数
     * @param operatorId     操作人 ID
     * @param operatorDeptId 操作人部门 ID
     * @param rawBody        原始请求体字节
     * @return 小写十六进制 HMAC-SHA256 签名
     */
    public static String sign(String secret, String method, String rawPath, String rawQuery,
                              String timestamp, String nonce, String operatorId, String operatorDeptId,
                              byte[] rawBody) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256));
            return HexFormat.of().formatHex(mac.doFinal(canonicalize(method, rawPath, rawQuery, timestamp,
                nonce, operatorId, operatorDeptId, rawBody).getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("无法生成内部服务请求签名", e);
        }
    }

    /**
     * 使用恒定时间算法比较两个十六进制签名。
     *
     * @param expectedSignature 期望签名
     * @param actualSignature   实际签名
     * @return 是否一致
     */
    public static boolean matches(String expectedSignature, String actualSignature) {
        if (expectedSignature == null || actualSignature == null) {
            return false;
        }
        try {
            byte[] expected = HexFormat.of().parseHex(expectedSignature);
            byte[] actual = HexFormat.of().parseHex(actualSignature);
            return MessageDigest.isEqual(expected, actual);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * 构造签名原文。
     */
    private static String canonicalize(String method, String rawPath, String rawQuery,
                                       String timestamp, String nonce, String operatorId,
                                       String operatorDeptId, byte[] rawBody) {
        return String.join("\n",
            value(method).toUpperCase(Locale.ROOT),
            value(rawPath),
            value(rawQuery),
            value(timestamp),
            value(nonce),
            value(operatorId),
            value(operatorDeptId),
            sha256Hex(rawBody));
    }

    /**
     * 计算请求体摘要。
     */
    private static String sha256Hex(byte[] rawBody) {
        try {
            MessageDigest digest = MessageDigest.getInstance(SHA_256);
            return HexFormat.of().formatHex(digest.digest(rawBody == null ? EMPTY_BODY : rawBody));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("无法计算内部服务请求摘要", e);
        }
    }

    private static String value(String value) {
        return value == null ? "" : value;
    }

}
