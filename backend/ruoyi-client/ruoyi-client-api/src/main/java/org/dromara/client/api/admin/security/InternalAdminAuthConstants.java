package org.dromara.client.api.admin.security;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Admin 调用 Client 内部管理接口的认证协议常量。
 *
 * @author Lion Li
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class InternalAdminAuthConstants {

    /**
     * Admin 服务调用方标识。
     */
    public static final String ADMIN_CALLER = "ruoyi-admin";

    /**
     * 调用方请求头。
     */
    public static final String HEADER_CALLER = "X-Internal-Caller";

    /**
     * 毫秒级 Unix 时间戳请求头。
     */
    public static final String HEADER_TIMESTAMP = "X-Internal-Timestamp";

    /**
     * 一次性随机数请求头。
     */
    public static final String HEADER_NONCE = "X-Internal-Nonce";

    /**
     * 操作人 ID 请求头。
     */
    public static final String HEADER_OPERATOR_ID = "X-Internal-Operator-Id";

    /**
     * 操作人部门 ID 请求头。
     */
    public static final String HEADER_OPERATOR_DEPT_ID = "X-Internal-Operator-Dept-Id";

    /**
     * HMAC-SHA256 签名请求头。
     */
    public static final String HEADER_SIGNATURE = "X-Internal-Signature";

}
