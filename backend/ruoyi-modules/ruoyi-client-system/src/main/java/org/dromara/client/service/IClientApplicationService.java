package org.dromara.client.service;

import org.dromara.client.domain.bo.ClientApplicationBo;
import org.dromara.client.domain.vo.ClientApplicationVo;
import org.dromara.common.core.domain.PageResult;
import org.dromara.common.mybatis.core.page.PageQuery;

import java.util.List;

/**
 * 产品端应用 Service 接口。
 *
 * @author Lion Li
 */
public interface IClientApplicationService {

    /**
     * 查询产品端应用详情。
     */
    ClientApplicationVo queryById(Long id);

    /**
     * 按客户端 ID 查询产品端应用。
     */
    ClientApplicationVo queryByClientId(String clientId);

    /**
     * 分页查询产品端应用。
     */
    PageResult<ClientApplicationVo> queryPageList(ClientApplicationBo bo, PageQuery pageQuery);

    /**
     * 查询产品端应用列表。
     */
    List<ClientApplicationVo> queryList(ClientApplicationBo bo);

    /**
     * 校验客户端 key 是否唯一。
     */
    boolean checkClientKeyUnique(ClientApplicationBo bo);

    /**
     * 新增产品端应用。
     */
    Boolean insertByBo(ClientApplicationBo bo);

    /**
     * 修改产品端应用。
     */
    Boolean updateByBo(ClientApplicationBo bo);

    /**
     * 修改产品端应用状态。
     */
    Boolean updateStatus(Long id, String status);

}
