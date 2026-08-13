package org.dromara.web.domain.vo;

import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.client.api.admin.domain.AppUserAdminVo;
import org.dromara.common.sensitive.annotation.Sensitive;
import org.dromara.common.sensitive.core.SensitiveStrategy;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Admin 应用用户管理视图对象。
 *
 * @author Lion Li
 */
@Data
@AutoMapper(target = AppUserAdminVo.class)
public class AppUserManagementVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 用户 ID。
     */
    private Long userId;

    /**
     * 用户账号。
     */
    private String userName;

    /**
     * 用户昵称。
     */
    private String nickName;

    /**
     * 用户类型。
     */
    private String userType;

    /**
     * 用户邮箱。
     */
    @Sensitive(strategy = SensitiveStrategy.EMAIL, perms = "client:user:edit")
    private String email;

    /**
     * 手机号码。
     */
    @Sensitive(strategy = SensitiveStrategy.PHONE, perms = "client:user:edit")
    private String phoneNumber;

    /**
     * 用户性别。
     */
    private String gender;

    /**
     * 头像 OSS ID。
     */
    private Long avatar;

    /**
     * 账号状态。
     */
    private String status;

    /**
     * 乐观锁版本号。
     */
    private Long version;

    /**
     * 最后登录 IP。
     */
    private String loginIp;

    /**
     * 最后登录时间。
     */
    private LocalDateTime loginDate;

    /**
     * 备注。
     */
    private String remark;

    /**
     * 创建时间。
     */
    private LocalDateTime createTime;

    /**
     * 更新时间。
     */
    private LocalDateTime updateTime;

}
