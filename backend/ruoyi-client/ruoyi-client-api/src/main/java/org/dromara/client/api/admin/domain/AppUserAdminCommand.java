package org.dromara.client.api.admin.domain;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.core.xss.Xss;

import java.io.Serial;
import java.io.Serializable;

/**
 * 应用用户管理写入命令。
 *
 * @author Lion Li
 */
@Data
public class AppUserAdminCommand implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 用户 ID。
     */
    @NotNull(message = "用户 ID 不能为空", groups = EditGroup.class)
    private Long userId;

    /**
     * 用户账号。
     */
    @Xss(message = "用户账号不能包含脚本字符")
    @NotBlank(message = "用户账号不能为空", groups = {AddGroup.class, EditGroup.class})
    @Size(min = 2, max = 30, message = "用户账号长度必须在{min}到{max}个字符之间")
    private String userName;

    /**
     * 用户昵称。
     */
    @Xss(message = "用户昵称不能包含脚本字符")
    @NotBlank(message = "用户昵称不能为空", groups = {AddGroup.class, EditGroup.class})
    @Size(max = 30, message = "用户昵称长度不能超过{max}个字符")
    private String nickName;

    /**
     * 用户类型。
     */
    private String userType;

    /**
     * 用户邮箱。
     */
    @Email(message = "邮箱格式不正确")
    @Size(max = 50, message = "邮箱长度不能超过{max}个字符")
    private String email;

    /**
     * 手机号码。
     */
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
     * 初始密码，仅新增时使用。
     */
    @NotBlank(message = "用户密码不能为空", groups = AddGroup.class)
    @Size(min = 5, max = 30, message = "用户密码长度必须在{min}到{max}个字符之间")
    private String password;

    /**
     * 账号状态。
     */
    private String status;

    /**
     * 乐观锁版本号。
     */
    @NotNull(message = "乐观锁版本号不能为空", groups = EditGroup.class)
    private Long version;

    /**
     * 备注。
     */
    private String remark;

}
