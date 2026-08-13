package org.dromara.common.core.domain.model;

import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * 具备菜单、角色和数据范围能力的登录用户。
 *
 * <p>Client 没有真实权限体系时不实现本接口，避免复用 Admin 权限模型。</p>
 *
 * @author Lion Li
 */
public interface DataPermissionUser extends LoginUserContext {

    /**
     * 获取部门 ID。
     *
     * @return 部门 ID
     */
    Long getDeptId();

    /**
     * 获取部门名称。
     *
     * @return 部门名称
     */
    String getDeptName();

    /**
     * 获取部门类别编码。
     *
     * @return 部门类别编码
     */
    String getDeptCategory();

    /**
     * 获取菜单权限。
     *
     * @return 菜单权限集合
     */
    Collection<String> getMenuPermission();

    /**
     * 获取角色权限。
     *
     * @return 角色权限集合
     */
    Collection<String> getRolePermission();

    /**
     * 获取参与数据权限计算的角色。
     *
     * @return 数据权限角色集合
     */
    Collection<? extends DataScopeRole> getRoles();

    /**
     * 获取接口权限与数据权限角色的映射。
     *
     * @return 权限标识与角色 ID 列表的映射
     */
    Map<String, List<Long>> getDataScopeRoleMap();

    /**
     * 判断当前用户是否为不受数据范围约束的超级管理员。
     *
     * @return 是否为超级管理员
     */
    boolean isSuperAdmin();

}
