package org.dromara.common.mybatis.handler;

import cn.hutool.core.util.ObjectUtil;
import cn.hutool.http.HttpStatus;
import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.reflection.MetaObject;
import org.dromara.common.core.domain.model.DataPermissionUser;
import org.dromara.common.core.domain.model.LoginUserContext;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.ObjectUtils;
import org.dromara.common.mybatis.context.AuditOperatorContext;
import org.dromara.common.mybatis.context.AuditOperatorContext.AuditOperator;
import org.dromara.common.mybatis.core.domain.BaseAuditEntity;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.common.satoken.utils.LoginHelper;

import java.time.LocalDateTime;
import java.util.Date;

/**
 * MP注入处理器
 *
 * @author Lion Li
 * @date 2021/4/25
 */
@Slf4j
public class InjectionMetaObjectHandler implements MetaObjectHandler {

    /**
     * 如果用户不存在默认注入-1代表无用户
     */
    private static final Long DEFAULT_USER_ID = -1L;

    /**
     * 插入填充方法，用于在插入数据时自动填充实体对象中的创建时间、更新时间、创建人、更新人等信息
     *
     * @param metaObject 元对象，用于获取原始对象并进行填充
     */
    @Override
    public void insertFill(MetaObject metaObject) {
        try {
            if (ObjectUtil.isNotNull(metaObject)
                && metaObject.getOriginalObject() instanceof BaseAuditEntity auditEntity) {
                // 获取当前时间作为创建时间和更新时间，如果创建时间不为空，则使用创建时间，否则使用当前时间
                LocalDateTime current = ObjectUtils.notNull(auditEntity.getCreateTime(), LocalDateTime.now());
                auditEntity.setCreateTime(current);
                auditEntity.setUpdateTime(current);

                // 如果创建人为空，则填充当前登录用户的信息
                if (ObjectUtil.isNull(auditEntity.getCreateBy())) {
                    AuditOperator auditOperator = AuditOperatorContext.get();
                    LoginUserContext loginUser = ObjectUtil.isNull(auditOperator) ? getLoginUser() : null;
                    if (ObjectUtil.isNotNull(auditOperator)) {
                        Long operatorId = ObjectUtils.notNull(auditOperator.operatorId(), DEFAULT_USER_ID);
                        auditEntity.setCreateBy(operatorId);
                        auditEntity.setUpdateBy(operatorId);
                    } else if (ObjectUtil.isNotNull(loginUser)) {
                        Long userId = loginUser.getUserId();
                        auditEntity.setCreateBy(userId);
                        auditEntity.setUpdateBy(userId);
                    } else {
                        auditEntity.setCreateBy(DEFAULT_USER_ID);
                        auditEntity.setUpdateBy(DEFAULT_USER_ID);
                    }

                    // Admin 实体继续填充部门；App 实体没有部门字段。
                    if (auditEntity instanceof BaseEntity baseEntity) {
                        Long deptId = loginUser instanceof DataPermissionUser permissionUser
                            ? permissionUser.getDeptId() : DEFAULT_USER_ID;
                        baseEntity.setCreateDept(ObjectUtils.notNull(baseEntity.getCreateDept(), deptId));
                    }
                }
            } else {
                LocalDateTime date = LocalDateTime.now();
                this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, date);
                this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, date);
                Date legacyDate = new Date();
                this.strictInsertFill(metaObject, "createTime", Date.class, legacyDate);
                this.strictInsertFill(metaObject, "updateTime", Date.class, legacyDate);
            }
        } catch (Exception e) {
            throw new ServiceException("自动注入异常 => " + e.getMessage(), HttpStatus.HTTP_INTERNAL_ERROR);
        }
    }

    /**
     * 更新填充方法，用于在更新数据时自动填充实体对象中的更新时间和更新人信息
     *
     * @param metaObject 元对象，用于获取原始对象并进行填充
     */
    @Override
    public void updateFill(MetaObject metaObject) {
        try {
            if (ObjectUtil.isNotNull(metaObject)
                && metaObject.getOriginalObject() instanceof BaseAuditEntity auditEntity) {
                // 获取当前时间作为更新时间，无论原始对象中的更新时间是否为空都填充
                LocalDateTime current = LocalDateTime.now();
                auditEntity.setUpdateTime(current);

                // 获取当前登录用户的ID，并填充更新人信息
                AuditOperator auditOperator = AuditOperatorContext.get();
                LoginUserContext loginUser = ObjectUtil.isNull(auditOperator) ? getLoginUser() : null;
                Long userId = ObjectUtil.isNotNull(auditOperator)
                    ? ObjectUtils.notNull(auditOperator.operatorId(), DEFAULT_USER_ID)
                    : ObjectUtil.isNotNull(loginUser) ? loginUser.getUserId() : DEFAULT_USER_ID;
                auditEntity.setUpdateBy(userId);
            } else {
                this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
                this.strictUpdateFill(metaObject, "updateTime", Date.class, new Date());
            }
        } catch (Exception e) {
            throw new ServiceException("自动注入异常 => " + e.getMessage(), HttpStatus.HTTP_INTERNAL_ERROR);
        }
    }

    /**
     * 获取当前登录用户信息
     *
     * @return 当前登录用户的信息，如果用户未登录则返回 null
     */
    private LoginUserContext getLoginUser() {
        LoginUserContext loginUser;
        try {
            loginUser = LoginHelper.getLoginUser();
        } catch (Exception e) {
            return null;
        }
        return loginUser;
    }

}
