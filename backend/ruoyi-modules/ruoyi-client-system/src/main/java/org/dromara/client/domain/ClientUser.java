package org.dromara.client.domain;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.mybatis.core.domain.BaseEntity;

import java.time.LocalDateTime;

/**
 * 产品用户对象 client_user。
 *
 * @author Lion Li
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("client_user")
public class ClientUser extends BaseEntity {

    /**
     * 用户 ID。
     */
    @TableId(value = "user_id")
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
    private String email;

    /**
     * 手机号码。
     */
    private String phoneNumber;

    /**
     * 用户性别（0 男、1 女、2 未知）。
     */
    private String gender;

    /**
     * 头像 OSS ID。
     */
    private Long avatar;

    /**
     * BCrypt 密码。
     */
    @TableField(
        insertStrategy = FieldStrategy.NOT_EMPTY,
        updateStrategy = FieldStrategy.NOT_EMPTY,
        whereStrategy = FieldStrategy.NOT_EMPTY
    )
    private String password;

    /**
     * 凭证版本；重置密码后递增，使已签发会话失效。
     */
    private Integer credentialVersion;

    /**
     * 账号状态（0 正常、1 停用）。
     */
    private String status;

    /**
     * 删除标志（0 存在、1 删除）。
     */
    @TableLogic
    private String delFlag;

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

}
