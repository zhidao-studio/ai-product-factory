package org.dromara.client.service;

import org.dromara.client.domain.bo.ClientIdentityBo;
import org.dromara.client.domain.vo.ClientIdentityVo;

import java.util.List;

/**
 * 产品用户第三方身份 Service 接口。
 *
 * @author Lion Li
 */
public interface IClientIdentityService {

    /**
     * 查询第三方身份详情。
     */
    ClientIdentityVo queryById(Long id);

    /**
     * 按来源和 open id 查询第三方身份。
     */
    ClientIdentityVo queryBySourceAndOpenId(String source, String openId);

    /**
     * 查询第三方身份列表。
     */
    List<ClientIdentityVo> queryList(ClientIdentityBo bo);

    /**
     * 新增第三方身份。
     */
    Boolean insertByBo(ClientIdentityBo bo);

    /**
     * 修改第三方身份。
     */
    Boolean updateByBo(ClientIdentityBo bo);

    /**
     * 删除第三方身份。
     */
    Boolean deleteById(Long id);

}
