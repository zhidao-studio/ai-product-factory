package org.dromara.common.satoken.core.service;

import cn.dev33.satoken.stp.StpInterface;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.ObjectUtil;
import org.dromara.common.core.domain.model.DataPermissionUser;
import org.dromara.common.core.domain.model.LoginUserContext;
import org.dromara.common.core.enums.UserType;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.service.PermissionService;
import org.dromara.common.core.utils.SpringUtils;
import org.dromara.common.satoken.utils.LoginHelper;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.function.BiFunction;

/**
 * sa-token 权限管理实现类
 *
 * @author Lion Li
 */
public class SaPermissionImpl implements StpInterface {

    /**
     * 获取指定登录对象的菜单权限列表。
     *
     * @param loginId   登录ID
     * @param loginType 登录类型
     * @return 菜单权限列表
     */
    @Override
    public List<String> getPermissionList(Object loginId, String loginType) {
        return resolvePermissionList(
            loginId, loginType, DataPermissionUser::getMenuPermission, PermissionService::getMenuPermission);
    }

    /**
     * 获取指定登录对象的角色权限列表。
     *
     * @param loginId   登录ID
     * @param loginType 登录类型
     * @return 角色权限列表
     */
    @Override
    public List<String> getRoleList(Object loginId, String loginType) {
        return resolvePermissionList(
            loginId, loginType, DataPermissionUser::getRolePermission, PermissionService::getRolePermission);
    }

    /**
     * 解析当前登录对象的权限列表。
     *
     * @param loginId                   登录ID
     * @param localPermissionExtractor  当前登录用户权限提取器
     * @param remotePermissionExtractor 远程权限提取器
     * @return 权限列表
     */
    private List<String> resolvePermissionList(Object loginId,
                                               String loginType,
                                               java.util.function.Function<DataPermissionUser, Collection<String>> localPermissionExtractor,
                                               BiFunction<PermissionService, Long, Collection<String>> remotePermissionExtractor) {
        LoginUserContext loginUser = LoginHelper.getLoginUser();
        if (ObjectUtil.isNotNull(loginUser) && loginUser.getLoginId().equals(loginId)) {
            if (!(loginUser instanceof DataPermissionUser permissionUser)) {
                return new ArrayList<>();
            }
            Collection<String> permissionList = localPermissionExtractor.apply(permissionUser);
            if (CollUtil.isNotEmpty(permissionList)) {
                return new ArrayList<>(permissionList);
            }
            return new ArrayList<>();
        }
        PermissionService permissionService = getPermissionService();
        if (ObjectUtil.isNotNull(permissionService) && isAdminLoginId(loginId, loginType)) {
            return new ArrayList<>(remotePermissionExtractor.apply(permissionService, resolveUserId(loginId)));
        }
        return new ArrayList<>();
    }

    /**
     * 判断指定登录标识是否属于 Admin 管理身份。
     *
     * @param loginId   登录标识
     * @param loginType Sa-Token 登录类型
     * @return 是否属于 Admin 管理身份
     */
    private boolean isAdminLoginId(Object loginId, String loginType) {
        if (loginId == null) {
            return false;
        }
        String loginIdStr = loginId.toString();
        String appUserType = UserType.APP_USER.getUserType();
        return !loginIdStr.startsWith(appUserType + ":") && !appUserType.equals(loginType);
    }

    /**
     * 获取权限服务实现。
     *
     * @return 权限服务
     */
    private PermissionService getPermissionService() {
        try {
            return SpringUtils.getBean(PermissionService.class);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 从登录ID中提取用户ID。
     *
     * @param loginId 登录ID
     * @return 用户ID
     */
    private Long resolveUserId(Object loginId) {
        String loginIdStr = loginId.toString();
        int separatorIndex = loginIdStr.indexOf(':');
        if (separatorIndex < 0 || separatorIndex == loginIdStr.length() - 1) {
            throw new ServiceException("登录ID格式错误");
        }
        return Long.parseLong(loginIdStr.substring(separatorIndex + 1));
    }

}
