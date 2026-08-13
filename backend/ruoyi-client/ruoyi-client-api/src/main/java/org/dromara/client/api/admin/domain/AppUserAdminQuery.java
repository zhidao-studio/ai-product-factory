package org.dromara.client.api.admin.domain;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * 应用用户管理查询条件。
 *
 * @author Lion Li
 */
@Data
public class AppUserAdminQuery implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 用户账号。
     */
    private String userName;

    /**
     * 用户昵称。
     */
    private String nickName;

    /**
     * 用户邮箱。
     */
    private String email;

    /**
     * 手机号码。
     */
    private String phoneNumber;

    /**
     * 账号状态。
     */
    private String status;

    /**
     * 扩展查询参数，例如创建时间范围。
     */
    private Map<String, Object> params = new HashMap<>();

}
