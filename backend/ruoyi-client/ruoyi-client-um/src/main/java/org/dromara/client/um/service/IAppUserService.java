package org.dromara.client.um.service;

import org.dromara.client.um.domain.bo.AppUserBo;
import org.dromara.client.um.domain.vo.AppUserVo;
import org.dromara.common.core.domain.PageResult;
import org.dromara.common.mybatis.core.page.PageQuery;

import java.util.Collection;
import java.util.List;

/**
 * 应用用户 Service 接口。
 *
 * @author Lion Li
 */
public interface IAppUserService {

    /**
     * 查询应用用户详情。
     *
     * @param userId 用户 ID
     * @return 应用用户
     */
    AppUserVo queryById(Long userId);

    /**
     * 按账号查询应用用户。
     */
    AppUserVo queryByUserName(String userName);

    /**
     * 按手机号查询应用用户。
     */
    AppUserVo queryByPhoneNumber(String phoneNumber);

    /**
     * 分页查询应用用户。
     */
    PageResult<AppUserVo> queryPageList(AppUserBo bo, PageQuery pageQuery);

    /**
     * 查询应用用户列表。
     */
    List<AppUserVo> queryList(AppUserBo bo);

    /**
     * 校验用户账号是否唯一。
     */
    boolean checkUserNameUnique(AppUserBo bo);

    /**
     * 校验手机号是否唯一。
     */
    boolean checkPhoneUnique(AppUserBo bo);

    /**
     * 校验邮箱是否唯一。
     */
    boolean checkEmailUnique(AppUserBo bo);

    /**
     * 新增应用用户。
     */
    Boolean insertByBo(AppUserBo bo);

    /**
     * 修改应用用户。
     */
    Boolean updateByBo(AppUserBo bo);

    /**
     * 修改应用用户状态。
     */
    Boolean updateStatus(Long userId, String status);

    /**
     * 重置应用用户密码。
     */
    Boolean resetPassword(Long userId, String password);

    /**
     * 更新最后登录信息。
     */
    Boolean updateLastLoginInfo(Long userId, String ip);

    /**
     * 批量删除应用用户。
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);

}
