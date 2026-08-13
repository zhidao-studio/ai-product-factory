package org.dromara.web.service;

import org.dromara.client.api.admin.domain.AppClientAdminCommand;
import org.dromara.client.api.admin.domain.AppClientAdminQuery;
import org.dromara.client.api.admin.domain.AppClientStatusCommand;
import org.dromara.client.api.admin.domain.AppUserAdminCommand;
import org.dromara.client.api.admin.domain.AppUserAdminQuery;
import org.dromara.client.api.admin.domain.AppUserPasswordCommand;
import org.dromara.client.api.admin.domain.AppUserStatusCommand;
import org.dromara.common.core.domain.PageResult;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.web.domain.vo.AppClientManagementVo;
import org.dromara.web.domain.vo.AppUserManagementVo;

import java.util.List;

/**
 * Admin 侧 Client 运营管理服务。
 *
 * @author Lion Li
 */
public interface ClientManagementService {

    /**
     * 分页查询应用用户。
     */
    PageResult<AppUserManagementVo> queryUserPage(AppUserAdminQuery query, PageQuery pageQuery);

    /**
     * 查询应用用户列表。
     */
    List<AppUserManagementVo> queryUserList(AppUserAdminQuery query);

    /**
     * 查询应用用户详情。
     */
    AppUserManagementVo queryUserById(Long userId);

    /**
     * 新增应用用户。
     */
    void addUser(AppUserAdminCommand command);

    /**
     * 修改应用用户。
     */
    void updateUser(AppUserAdminCommand command);

    /**
     * 重置应用用户密码。
     */
    void resetUserPassword(AppUserPasswordCommand command);

    /**
     * 修改应用用户状态。
     */
    void updateUserStatus(AppUserStatusCommand command);

    /**
     * 删除应用用户。
     */
    void deleteUsers(Long[] userIds);

    /**
     * 分页查询接入客户端。
     */
    PageResult<AppClientManagementVo> queryClientPage(AppClientAdminQuery query, PageQuery pageQuery);

    /**
     * 查询接入客户端列表。
     */
    List<AppClientManagementVo> queryClientList(AppClientAdminQuery query);

    /**
     * 查询接入客户端详情。
     */
    AppClientManagementVo queryClientById(Long id);

    /**
     * 新增接入客户端。
     */
    void addClient(AppClientAdminCommand command);

    /**
     * 修改接入客户端。
     */
    void updateClient(AppClientAdminCommand command);

    /**
     * 修改接入客户端状态。
     */
    void updateClientStatus(AppClientStatusCommand command);

}
