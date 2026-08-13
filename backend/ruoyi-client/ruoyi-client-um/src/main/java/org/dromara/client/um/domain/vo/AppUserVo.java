package org.dromara.client.um.domain.vo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.client.um.domain.AppUser;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 应用用户视图对象 app_user。
 *
 * @author Lion Li
 */
@Data
@AutoMapper(target = AppUser.class)
public class AppUserVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键。
     */
    private Long id;

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
     * 密码，仅供认证模块读取，不写入 JSON。
     */
    @JsonIgnore
    @JsonProperty
    private String password;

    /**
     * 凭证版本，仅用于 Client 会话有效性校验。
     */
    @JsonIgnore
    private Integer credentialVersion;

    /**
     * 是否有效（1 有效、0 无效）。
     */
    private String validFlag;

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
