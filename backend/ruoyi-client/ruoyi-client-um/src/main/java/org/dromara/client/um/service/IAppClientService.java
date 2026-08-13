package org.dromara.client.um.service;

import org.dromara.client.um.domain.bo.AppClientBo;
import org.dromara.client.um.domain.vo.AppClientVo;
import org.dromara.common.core.domain.PageResult;
import org.dromara.common.mybatis.core.page.PageQuery;

import java.util.List;

/**
 * 接入客户端 Service 接口。
 *
 * @author Lion Li
 */
public interface IAppClientService {

    /**
     * 查询接入客户端详情。
     */
    AppClientVo queryById(Long id);

    /**
     * 按客户端 ID 查询接入客户端。
     */
    AppClientVo queryByClientId(String clientId);

    /**
     * 分页查询接入客户端。
     */
    PageResult<AppClientVo> queryPageList(AppClientBo bo, PageQuery pageQuery);

    /**
     * 查询接入客户端列表。
     */
    List<AppClientVo> queryList(AppClientBo bo);

    /**
     * 校验客户端 key 是否唯一。
     */
    boolean checkClientKeyUnique(AppClientBo bo);

    /**
     * 新增接入客户端。
     */
    Boolean insertByBo(AppClientBo bo);

    /**
     * 修改接入客户端。
     */
    Boolean updateByBo(AppClientBo bo);

    /**
     * 修改接入客户端状态。
     */
    Boolean updateStatus(Long id, String status);

}
