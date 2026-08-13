package org.dromara.client.web.service;

import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.ObjectUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.client.domain.vo.ClientUserVo;
import org.dromara.client.service.IClientUserService;
import org.dromara.common.core.constant.CacheNames;
import org.dromara.common.core.constant.Constants;
import org.dromara.common.core.enums.LoginType;
import org.dromara.common.core.exception.user.UserException;
import org.dromara.common.core.utils.MessageUtils;
import org.dromara.common.core.utils.ServletUtils;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.redis.utils.RedisUtils;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.system.api.model.LoginUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collections;
import java.util.function.Supplier;

/**
 * 产品用户登录校验服务。
 *
 * @author Lion Li
 */
@RequiredArgsConstructor
@Slf4j
@Service
public class ClientLoginService {

    @Value("${user.password.maxRetryCount}")
    private Integer maxRetryCount;

    @Value("${user.password.lockTime}")
    private Integer lockTime;

    private final IClientUserService userService;

    /**
     * 构建产品用户登录上下文。
     *
     * @param user 产品用户
     * @return 登录上下文
     */
    public LoginUser buildLoginUser(ClientUserVo user) {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(user.getUserId());
        loginUser.setUsername(user.getUserName());
        loginUser.setNickname(user.getNickName());
        loginUser.setUserType(user.getUserType());
        loginUser.setMenuPermission(Collections.emptySet());
        loginUser.setRolePermission(Collections.emptySet());
        return loginUser;
    }

    /**
     * 校验登录失败次数，并在成功后清空计数。
     *
     * @param loginType 登录类型
     * @param username  登录标识
     * @param supplier  返回 true 表示认证失败
     */
    public void checkLogin(LoginType loginType, String username, Supplier<Boolean> supplier) {
        String errorKey = CacheNames.PWD_ERR_CNT_KEY + username;
        int errorNumber = ObjectUtil.defaultIfNull(RedisUtils.getCacheObject(errorKey), 0);
        if (errorNumber >= maxRetryCount) {
            recordLoginInfo(username, Constants.LOGIN_FAIL,
                MessageUtils.message(loginType.getRetryLimitExceed(), maxRetryCount, lockTime));
            throw new UserException(loginType.getRetryLimitExceed(), maxRetryCount, lockTime);
        }
        if (supplier.get()) {
            errorNumber++;
            RedisUtils.setCacheObject(errorKey, errorNumber, Duration.ofMinutes(lockTime));
            if (errorNumber >= maxRetryCount) {
                recordLoginInfo(username, Constants.LOGIN_FAIL,
                    MessageUtils.message(loginType.getRetryLimitExceed(), maxRetryCount, lockTime));
                throw new UserException(loginType.getRetryLimitExceed(), maxRetryCount, lockTime);
            }
            recordLoginInfo(username, Constants.LOGIN_FAIL,
                MessageUtils.message(loginType.getRetryLimitCount(), errorNumber));
            throw new UserException(loginType.getRetryLimitCount(), errorNumber);
        }
        RedisUtils.deleteObject(errorKey);
    }

    /**
     * 记录登录事件。
     *
     * @param username 登录标识
     * @param status   状态
     * @param message  信息
     */
    public void recordLoginInfo(String username, String status, String message) {
        HttpServletRequest request = ServletUtils.getRequest();
        String ip = request == null ? StringUtils.EMPTY : ServletUtils.getClientIP(request);
        String clientId = request == null ? StringUtils.EMPTY : request.getHeader(LoginHelper.CLIENT_KEY);
        if (Constants.LOGIN_FAIL.equals(status)) {
            log.warn("产品用户登录事件 => ip: {}, username: {}, status: {}, message: {}, clientId: {}",
                ip, username, status, message, clientId);
        } else {
            log.info("产品用户登录事件 => ip: {}, username: {}, status: {}, message: {}, clientId: {}",
                ip, username, status, message, clientId);
        }
    }

    /**
     * 完成登录后的审计字段更新。
     *
     * @param user 产品用户
     */
    public void recordLoginSuccess(ClientUserVo user) {
        String ip = ServletUtils.getClientIP();
        userService.updateLastLoginInfo(user.getUserId(), ip);
        recordLoginInfo(user.getUserName(), Constants.LOGIN_SUCCESS,
            MessageUtils.message("user.login.success"));
    }

    /**
     * 退出当前登录态。
     */
    public void logout() {
        try {
            LoginUser loginUser = LoginHelper.getLoginUser();
            if (ObjectUtil.isNotNull(loginUser)) {
                recordLoginInfo(loginUser.getUsername(), Constants.LOGOUT,
                    MessageUtils.message("user.logout.success"));
            }
        } catch (NotLoginException ignored) {
        } finally {
            try {
                StpUtil.logout();
            } catch (NotLoginException ignored) {
            }
        }
    }

}
