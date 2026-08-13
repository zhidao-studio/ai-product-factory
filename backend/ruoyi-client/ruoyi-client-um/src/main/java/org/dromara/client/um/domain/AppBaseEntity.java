package org.dromara.client.um.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.mybatis.core.domain.BaseAuditEntity;

import java.io.Serial;

/**
 * App 数据实体基类。
 *
 * @author Lion Li
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class AppBaseEntity extends BaseAuditEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键。
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 是否有效（1 有效、0 无效）。
     */
    private String validFlag;

    /**
     * 删除标志（0 存在、1 删除）。
     */
    @TableLogic
    private String delFlag;

}
