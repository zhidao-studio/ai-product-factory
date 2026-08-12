package org.dromara.client.service;

import org.dromara.client.domain.bo.ClientUserBo;
import org.dromara.client.domain.vo.ClientUserVo;
import org.dromara.client.domain.vo.ClientUserExportVo;
import org.dromara.common.core.domain.PageResult;
import org.dromara.common.mybatis.core.page.PageQuery;

import java.util.Collection;
import java.util.List;

/**
 * 产品用户 Service 接口。
 *
 * @author Lion Li
 */
public interface IClientUserService {

    /**
     * 查询产品用户详情。
     *
     * @param userId 用户 ID
     * @return 产品用户
     */
    ClientUserVo queryById(Long userId);

    /**
     * 按账号查询产品用户。
     */
    ClientUserVo queryByUserName(String userName);

    /**
     * 按手机号查询产品用户。
     */
    ClientUserVo queryByPhoneNumber(String phoneNumber);

    /**
     * 分页查询产品用户。
     */
    PageResult<ClientUserVo> queryPageList(ClientUserBo bo, PageQuery pageQuery);

    /**
     * 查询产品用户列表。
     */
    List<ClientUserVo> queryList(ClientUserBo bo);

    /**
     * 查询产品用户导出列表。
     */
    List<ClientUserExportVo> queryExportList(ClientUserBo bo);

    /**
     * 校验用户账号是否唯一。
     */
    boolean checkUserNameUnique(ClientUserBo bo);

    /**
     * 校验手机号是否唯一。
     */
    boolean checkPhoneUnique(ClientUserBo bo);

    /**
     * 校验邮箱是否唯一。
     */
    boolean checkEmailUnique(ClientUserBo bo);

    /**
     * 新增产品用户。
     */
    Boolean insertByBo(ClientUserBo bo);

    /**
     * 修改产品用户。
     */
    Boolean updateByBo(ClientUserBo bo);

    /**
     * 修改产品用户状态。
     */
    Boolean updateStatus(Long userId, String status);

    /**
     * 重置产品用户密码。
     */
    Boolean resetPassword(Long userId, String password);

    /**
     * 更新最后登录信息。
     */
    Boolean updateLastLoginInfo(Long userId, String ip);

    /**
     * 批量删除产品用户。
     */
    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);

}
