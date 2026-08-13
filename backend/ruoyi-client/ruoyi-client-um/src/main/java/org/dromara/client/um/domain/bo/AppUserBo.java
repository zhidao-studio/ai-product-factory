package org.dromara.client.um.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.dromara.client.um.domain.AppUser;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.core.xss.Xss;

import java.io.Serial;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * 应用用户业务对象 app_user。
 *
 * @author Lion Li
 */
@Data
@AutoMapper(target = AppUser.class, reverseConvertGenerate = false)
public class AppUserBo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键。
     */
    @NotNull(message = "主键不能为空", groups = {EditGroup.class})
    private Long id;

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
     * 密码，仅新增或重置密码时传入。
     */
    @NotBlank(message = "用户密码不能为空", groups = {AddGroup.class})
    private String password;

    /**
     * 是否有效（1 有效、0 无效）。
     */
    @Pattern(regexp = "[01]", message = "有效标志值不正确")
    private String validFlag;

    /**
     * 备注。
     */
    private String remark;

    /**
     * 查询参数。
     */
    private Map<String, Object> params = new HashMap<>();

}
