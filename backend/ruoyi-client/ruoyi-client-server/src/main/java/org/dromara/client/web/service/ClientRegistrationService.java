package org.dromara.client.web.service;

import cn.hutool.core.util.ObjectUtil;
import com.baomidou.lock.annotation.Lock4j;
import lombok.RequiredArgsConstructor;
import me.zhyd.oauth.model.AuthToken;
import me.zhyd.oauth.model.AuthUser;
import org.dromara.client.um.constant.AppDataConstants;
import org.dromara.client.um.domain.bo.AppUserBo;
import org.dromara.client.um.domain.bo.AppUserIdentityBo;
import org.dromara.client.um.domain.vo.AppUserIdentityVo;
import org.dromara.client.um.service.IAppUserIdentityService;
import org.dromara.client.um.service.IAppUserService;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.encrypt.utils.EncryptUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 应用用户首次登录注册服务。
 *
 * @author Lion Li
 */
@RequiredArgsConstructor
@Service
public class ClientRegistrationService {

    private static final String DEFAULT_NICK_NAME = "微信用户";

    private static final String UNKNOWN_GENDER = "2";

    private static final int MAX_ACCOUNT_LENGTH = 30;

    private static final int ACCOUNT_HASH_LENGTH = 24;

    private final IAppUserService userService;
    private final IAppUserIdentityService identityService;

    /**
     * 首次微信小程序登录时创建应用用户及第三方身份。
     *
     * @param authId   第三方认证唯一 ID
     * @param source   身份来源
     * @param authUser 第三方用户信息
     * @param token    第三方令牌
     * @return 第三方身份
     */
    @Lock4j(keys = {"#authId"}, acquireTimeout = 5000)
    @Transactional(rollbackFor = Exception.class)
    public AppUserIdentityVo register(String authId, String source, AuthUser authUser, AuthToken token) {
        AppUserIdentityVo identity = identityService.queryBySourceAndOpenId(source, token.getOpenId());
        if (ObjectUtil.isNotNull(identity)) {
            if (!AppDataConstants.VALID.equals(identity.getValidFlag())) {
                throw new ServiceException("微信用户身份已无效");
            }
            return identity;
        }

        String userName = buildUserName(authId);
        String nickName = limitLength(authUser.getNickname(), DEFAULT_NICK_NAME);
        AppUserBo userBo = new AppUserBo();
        userBo.setUserName(userName);
        userBo.setNickName(nickName);
        userBo.setEmail(StringUtils.EMPTY);
        userBo.setPhoneNumber(StringUtils.EMPTY);
        userBo.setGender(UNKNOWN_GENDER);
        userBo.setPassword(StringUtils.EMPTY);
        userBo.setValidFlag(AppDataConstants.VALID);
        userBo.setRemark("微信小程序首次登录自动创建");
        if (!userService.insertByBo(userBo)) {
            throw new ServiceException("创建应用用户失败");
        }

        AppUserIdentityBo identityBo = buildIdentity(authId, source, authUser, token, userBo.getId(), userName);
        if (!identityService.insertByBo(identityBo)) {
            throw new ServiceException("创建应用用户第三方身份失败");
        }
        AppUserIdentityVo result = identityService.queryById(identityBo.getId());
        if (ObjectUtil.isNull(result)) {
            throw new ServiceException("查询应用用户第三方身份失败");
        }
        return result;
    }

    private AppUserIdentityBo buildIdentity(String authId, String source, AuthUser authUser, AuthToken token,
                                            Long userId, String fallbackUserName) {
        AppUserIdentityBo bo = new AppUserIdentityBo();
        bo.setUserId(userId);
        bo.setValidFlag(AppDataConstants.VALID);
        bo.setAuthId(authId);
        bo.setSource(source);
        bo.setAccessToken(StringUtils.blankToDefault(token.getAccessToken(), StringUtils.EMPTY));
        bo.setExpireIn(token.getExpireIn());
        bo.setRefreshToken(token.getRefreshToken());
        bo.setOpenId(token.getOpenId());
        bo.setUserName(limitLength(authUser.getUsername(), fallbackUserName));
        bo.setNickName(limitLength(authUser.getNickname(), DEFAULT_NICK_NAME));
        bo.setEmail(authUser.getEmail());
        bo.setAvatar(authUser.getAvatar());
        bo.setUnionId(token.getUnionId());
        bo.setScope(token.getScope());
        bo.setTokenType(token.getTokenType());
        return bo;
    }

    private String buildUserName(String authId) {
        String hash = EncryptUtils.encryptBySha256(authId);
        return "wx_" + hash.substring(0, ACCOUNT_HASH_LENGTH);
    }

    private String limitLength(String value, String defaultValue) {
        String result = StringUtils.blankToDefault(value, defaultValue);
        if (result.length() <= MAX_ACCOUNT_LENGTH) {
            return result;
        }
        return result.substring(0, MAX_ACCOUNT_LENGTH);
    }

}
