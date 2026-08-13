package org.dromara.common.core.domain.model;

import java.io.Serializable;

/**
 * 数据权限计算需要的最小角色信息。
 *
 * @author Lion Li
 */
public interface DataScopeRole extends Serializable {

    /**
     * 获取角色 ID。
     *
     * @return 角色 ID
     */
    Long getRoleId();

    /**
     * 获取角色权限标识。
     *
     * @return 角色权限标识
     */
    String getRoleKey();

    /**
     * 获取数据范围编码。
     *
     * @return 数据范围编码
     */
    String getDataScope();

}
