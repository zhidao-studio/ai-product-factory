package org.dromara.client.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.client.domain.ClientIdentity;

import java.io.Serial;
import java.io.Serializable;

/**
 * 产品用户第三方身份业务对象 client_identity。
 *
 * @author Lion Li
 */
@Data
@AutoMapper(target = ClientIdentity.class, reverseConvertGenerate = false)
public class ClientIdentityBo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键。
     */
    private Long id;

    /**
     * 产品用户 ID。
     */
    private Long userId;

    /**
     * 第三方认证唯一 ID。
     */
    private String authId;

    /**
     * 身份来源。
     */
    private String source;

    /**
     * 访问令牌。
     */
    private String accessToken;

    /**
     * 访问令牌有效期。
     */
    private int expireIn;

    /**
     * 刷新令牌。
     */
    private String refreshToken;

    /**
     * 第三方 open id。
     */
    private String openId;

    /**
     * 第三方账号。
     */
    private String userName;

    /**
     * 第三方昵称。
     */
    private String nickName;

    /**
     * 第三方邮箱。
     */
    private String email;

    /**
     * 第三方头像地址。
     */
    private String avatar;

    /**
     * 平台授权信息。
     */
    private String accessCode;

    /**
     * 第三方 union id。
     */
    private String unionId;

    /**
     * 授权范围。
     */
    private String scope;

    /**
     * Token 类型。
     */
    private String tokenType;

    /**
     * ID Token。
     */
    private String idToken;

    /**
     * MAC 算法。
     */
    private String macAlgorithm;

    /**
     * MAC key。
     */
    private String macKey;

    /**
     * 授权 code。
     */
    private String code;

    /**
     * OAuth Token。
     */
    private String oauthToken;

    /**
     * OAuth Token Secret。
     */
    private String oauthTokenSecret;

}
