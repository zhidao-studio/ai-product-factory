package org.dromara.client.internal.service;

import cn.hutool.crypto.digest.BCrypt;
import lombok.RequiredArgsConstructor;
import org.dromara.client.api.admin.domain.AppClientAdminCommand;
import org.dromara.client.api.admin.domain.AppClientAdminQuery;
import org.dromara.client.api.admin.domain.AppClientAdminVo;
import org.dromara.client.api.admin.domain.AppClientValidFlagCommand;
import org.dromara.client.api.admin.domain.AppUserAdminCommand;
import org.dromara.client.api.admin.domain.AppUserAdminQuery;
import org.dromara.client.api.admin.domain.AppUserAdminVo;
import org.dromara.client.api.admin.domain.AppUserPasswordCommand;
import org.dromara.client.api.admin.domain.AppUserValidFlagCommand;
import org.dromara.client.um.domain.bo.AppClientBo;
import org.dromara.client.um.domain.bo.AppUserBo;
import org.dromara.client.um.domain.vo.AppClientVo;
import org.dromara.client.um.domain.vo.AppUserVo;
import org.dromara.client.um.service.IAppClientService;
import org.dromara.client.um.service.IAppUserService;
import org.dromara.common.core.domain.PageResult;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;

/**
 * Client 内部运营管理接口业务编排。
 *
 * @author Lion Li
 */
@Service
@RequiredArgsConstructor
public class ClientInternalAdminService {

    private final IAppUserService userService;

    private final IAppClientService clientService;

    /**
     * 分页查询应用用户。
     */
    public PageResult<AppUserAdminVo> queryUserPage(AppUserAdminQuery query, PageQuery pageQuery) {
        PageResult<AppUserVo> result = userService.queryPageList(toUserBo(query), pageQuery);
        return PageResult.build(toUserAdminVoList(result.getRows()), result.getTotal());
    }

    /**
     * 查询全部匹配的应用用户。
     */
    public List<AppUserAdminVo> queryUserList(AppUserAdminQuery query) {
        return userService.queryList(toUserBo(query)).stream().map(this::toUserAdminVo).toList();
    }

    /**
     * 查询应用用户详情。
     */
    public AppUserAdminVo queryUserById(Long userId) {
        return toUserAdminVo(userService.queryById(userId));
    }

    /**
     * 新增应用用户。
     */
    public Boolean addUser(AppUserAdminCommand command) {
        AppUserBo bo = toUserBo(command);
        validateUserUnique(bo, "新增");
        bo.setPassword(BCrypt.hashpw(command.getPassword()));
        return userService.insertByBo(bo);
    }

    /**
     * 修改应用用户。
     */
    public Boolean updateUser(AppUserAdminCommand command) {
        AppUserBo bo = toUserBo(command);
        validateUserUnique(bo, "修改");
        bo.setPassword(null);
        return userService.updateByBo(bo);
    }

    /**
     * 修改应用用户有效标志。
     */
    public Boolean updateUserValidFlag(AppUserValidFlagCommand command) {
        return userService.updateValidFlag(command.getUserId(), command.getValidFlag());
    }

    /**
     * 重置应用用户密码。
     */
    public Boolean resetUserPassword(AppUserPasswordCommand command) {
        return userService.resetPassword(command.getUserId(), BCrypt.hashpw(command.getPassword()));
    }

    /**
     * 删除应用用户。
     */
    public Boolean deleteUsers(Collection<Long> userIds) {
        return userService.deleteWithValidByIds(userIds, true);
    }

    /**
     * 分页查询接入客户端。
     */
    public PageResult<AppClientAdminVo> queryClientPage(AppClientAdminQuery query, PageQuery pageQuery) {
        PageResult<AppClientVo> result = clientService.queryPageList(toClientBo(query), pageQuery);
        return PageResult.build(toClientAdminVoList(result.getRows()), result.getTotal());
    }

    /**
     * 查询全部匹配的接入客户端。
     */
    public List<AppClientAdminVo> queryClientList(AppClientAdminQuery query) {
        return clientService.queryList(toClientBo(query)).stream().map(this::toClientAdminVo).toList();
    }

    /**
     * 查询接入客户端详情。
     */
    public AppClientAdminVo queryClientById(Long id) {
        return toClientAdminVo(clientService.queryById(id));
    }

    /**
     * 新增接入客户端。
     */
    public Boolean addClient(AppClientAdminCommand command) {
        AppClientBo bo = toClientBo(command);
        if (!clientService.checkClientKeyUnique(bo)) {
            throw new ServiceException("新增客户端'{}'失败，客户端 key 已存在", bo.getClientKey());
        }
        return clientService.insertByBo(bo);
    }

    /**
     * 修改接入客户端。
     */
    public Boolean updateClient(AppClientAdminCommand command) {
        return clientService.updateByBo(toClientBo(command));
    }

    /**
     * 修改接入客户端有效标志。
     */
    public Boolean updateClientValidFlag(AppClientValidFlagCommand command) {
        return clientService.updateValidFlag(command.getId(), command.getValidFlag());
    }

    private void validateUserUnique(AppUserBo bo, String action) {
        if (!userService.checkUserNameUnique(bo)) {
            throw new ServiceException("{}用户'{}'失败，登录账号已存在", action, bo.getUserName());
        }
        if (StringUtils.isNotBlank(bo.getPhoneNumber()) && !userService.checkPhoneUnique(bo)) {
            throw new ServiceException("{}用户'{}'失败，手机号码已存在", action, bo.getUserName());
        }
        if (StringUtils.isNotBlank(bo.getEmail()) && !userService.checkEmailUnique(bo)) {
            throw new ServiceException("{}用户'{}'失败，邮箱账号已存在", action, bo.getUserName());
        }
    }

    private AppUserBo toUserBo(AppUserAdminQuery query) {
        AppUserBo bo = new AppUserBo();
        bo.setUserName(query.getUserName());
        bo.setNickName(query.getNickName());
        bo.setEmail(query.getEmail());
        bo.setPhoneNumber(query.getPhoneNumber());
        bo.setValidFlag(query.getValidFlag());
        bo.setParams(query.getParams() == null ? new HashMap<>() : query.getParams());
        return bo;
    }

    private AppUserBo toUserBo(AppUserAdminCommand command) {
        AppUserBo bo = new AppUserBo();
        bo.setId(command.getUserId());
        bo.setUserName(command.getUserName());
        bo.setNickName(command.getNickName());
        bo.setUserType(command.getUserType());
        bo.setEmail(command.getEmail());
        bo.setPhoneNumber(command.getPhoneNumber());
        bo.setGender(command.getGender());
        bo.setAvatar(command.getAvatar());
        bo.setPassword(command.getPassword());
        bo.setValidFlag(command.getValidFlag());
        bo.setRemark(command.getRemark());
        return bo;
    }

    private AppClientBo toClientBo(AppClientAdminQuery query) {
        AppClientBo bo = new AppClientBo();
        bo.setClientId(query.getClientId());
        bo.setClientKey(query.getClientKey());
        bo.setDeviceType(query.getDeviceType());
        bo.setValidFlag(query.getValidFlag());
        return bo;
    }

    private AppClientBo toClientBo(AppClientAdminCommand command) {
        AppClientBo bo = new AppClientBo();
        bo.setId(command.getId());
        bo.setClientId(command.getClientId());
        bo.setClientKey(command.getClientKey());
        bo.setClientSecret(command.getClientSecret());
        bo.setGrantType(command.getGrantType());
        bo.setGrantTypeList(command.getGrantTypeList());
        bo.setDeviceType(command.getDeviceType());
        bo.setAccessPath(command.getAccessPath());
        bo.setAccessPathList(command.getAccessPathList());
        bo.setIpWhitelist(command.getIpWhitelist());
        bo.setIpWhitelistList(command.getIpWhitelistList());
        bo.setActiveTimeout(command.getActiveTimeout());
        bo.setTimeout(command.getTimeout());
        bo.setValidFlag(command.getValidFlag());
        bo.setRemark(command.getRemark());
        return bo;
    }

    private List<AppUserAdminVo> toUserAdminVoList(Collection<AppUserVo> source) {
        return source.stream().map(this::toUserAdminVo).toList();
    }

    private AppUserAdminVo toUserAdminVo(AppUserVo source) {
        if (source == null) {
            return null;
        }
        AppUserAdminVo target = new AppUserAdminVo();
        target.setUserId(source.getId());
        target.setUserName(source.getUserName());
        target.setNickName(source.getNickName());
        target.setUserType(source.getUserType());
        target.setEmail(source.getEmail());
        target.setPhoneNumber(source.getPhoneNumber());
        target.setGender(source.getGender());
        target.setAvatar(source.getAvatar());
        target.setValidFlag(source.getValidFlag());
        target.setLoginIp(source.getLoginIp());
        target.setLoginDate(source.getLoginDate());
        target.setRemark(source.getRemark());
        target.setCreateTime(source.getCreateTime());
        target.setUpdateTime(source.getUpdateTime());
        return target;
    }

    private List<AppClientAdminVo> toClientAdminVoList(Collection<AppClientVo> source) {
        return source.stream().map(this::toClientAdminVo).toList();
    }

    private AppClientAdminVo toClientAdminVo(AppClientVo source) {
        if (source == null) {
            return null;
        }
        AppClientAdminVo target = new AppClientAdminVo();
        target.setId(source.getId());
        target.setClientId(source.getClientId());
        target.setClientKey(source.getClientKey());
        target.setGrantType(source.getGrantType());
        target.setGrantTypeList(source.getGrantTypeList());
        target.setDeviceType(source.getDeviceType());
        target.setAccessPath(source.getAccessPath());
        target.setAccessPathList(source.getAccessPathList());
        target.setIpWhitelist(source.getIpWhitelist());
        target.setIpWhitelistList(source.getIpWhitelistList());
        target.setActiveTimeout(source.getActiveTimeout());
        target.setTimeout(source.getTimeout());
        target.setValidFlag(source.getValidFlag());
        target.setRemark(source.getRemark());
        target.setCreateTime(source.getCreateTime());
        target.setUpdateTime(source.getUpdateTime());
        return target;
    }

}
