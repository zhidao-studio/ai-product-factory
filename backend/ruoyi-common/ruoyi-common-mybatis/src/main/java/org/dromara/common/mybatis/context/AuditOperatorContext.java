package org.dromara.common.mybatis.context;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * 跨进程调用时的数据库审计操作者上下文。
 *
 * @author Lion Li
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class AuditOperatorContext {

    private static final ThreadLocal<AuditOperator> CONTEXT = new ThreadLocal<>();

    /**
     * 设置当前线程的审计操作者。
     *
     * @param operatorId 操作人 ID
     */
    public static void set(Long operatorId) {
        CONTEXT.set(new AuditOperator(operatorId));
    }

    /**
     * 获取当前线程的审计操作者。
     *
     * @return 审计操作者，未设置时返回 null
     */
    public static AuditOperator get() {
        return CONTEXT.get();
    }

    /**
     * 清理当前线程的审计操作者。
     */
    public static void clear() {
        CONTEXT.remove();
    }

    /**
     * 审计操作者。
     *
     * @param operatorId 操作人 ID
     */
    public record AuditOperator(Long operatorId) {
    }

}
