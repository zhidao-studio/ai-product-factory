package org.dromara.client.domain.model;

/**
 * 产品用户。它与 Admin 管理员完全不是同一种身份。
 */
public record ClientUser(
    Long id,
    String username,
    String phone,
    String email,
    String password,
    String nickname,
    String avatar,
    String status
) {

    public boolean enabled() {
        return "0".equals(status);
    }
}
