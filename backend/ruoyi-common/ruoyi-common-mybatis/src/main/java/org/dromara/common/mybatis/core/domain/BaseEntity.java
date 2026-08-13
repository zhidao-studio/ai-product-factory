package org.dromara.common.mybatis.core.domain;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * Entity基类
 *
 * @author Lion Li
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class BaseEntity extends BaseAuditEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 创建部门
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createDept;

}
