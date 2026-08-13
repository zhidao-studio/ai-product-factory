package org.dromara.client.um.service;

import org.dromara.client.um.domain.bo.AppUserIdentityBo;
import org.dromara.client.um.domain.vo.AppUserIdentityVo;

import java.util.List;

/**
 * 应用用户第三方身份 Service 接口。
 *
 * @author Lion Li
 */
public interface IAppUserIdentityService {

    /**
     * 查询第三方身份详情。
     */
    AppUserIdentityVo queryById(Long id);

    /**
     * 按来源和 open id 查询第三方身份。
     */
    AppUserIdentityVo queryBySourceAndOpenId(String source, String openId);

    /**
     * 查询第三方身份列表。
     */
    List<AppUserIdentityVo> queryList(AppUserIdentityBo bo);

    /**
     * 新增第三方身份。
     */
    Boolean insertByBo(AppUserIdentityBo bo);

    /**
     * 修改第三方身份。
     */
    Boolean updateByBo(AppUserIdentityBo bo);

    /**
     * 删除第三方身份。
     */
    Boolean deleteById(Long id);

}
