package org.dromara.client.internal.controller;

import io.swagger.v3.oas.annotations.Hidden;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.client.api.admin.domain.AppUserAdminCommand;
import org.dromara.client.api.admin.domain.AppUserAdminQuery;
import org.dromara.client.api.admin.domain.AppUserAdminVo;
import org.dromara.client.api.admin.domain.AppUserPasswordCommand;
import org.dromara.client.api.admin.domain.AppUserValidFlagCommand;
import org.dromara.client.internal.service.ClientInternalAdminService;
import org.dromara.common.core.domain.PageResult;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.web.core.BaseController;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Client 提供给 Admin 的应用用户内部管理接口。
 *
 * @author Lion Li
 */
@Hidden
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/internal/admin/v1/users")
public class InternalAppUserAdminController extends BaseController {

    private final ClientInternalAdminService internalAdminService;

    /**
     * 分页查询应用用户。
     */
    @GetMapping
    public R<PageResult<AppUserAdminVo>> list(AppUserAdminQuery query, PageQuery pageQuery) {
        return R.ok(internalAdminService.queryUserPage(query, pageQuery));
    }

    /**
     * 查询全部匹配的应用用户，供 Admin 导出使用。
     */
    @GetMapping("/all")
    public R<List<AppUserAdminVo>> all(AppUserAdminQuery query) {
        return R.ok(internalAdminService.queryUserList(query));
    }

    /**
     * 查询应用用户详情。
     */
    @GetMapping("/{userId}")
    public R<AppUserAdminVo> getInfo(@NotNull(message = "用户 ID 不能为空") @PathVariable Long userId) {
        return R.ok(internalAdminService.queryUserById(userId));
    }

    /**
     * 新增应用用户。
     */
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody AppUserAdminCommand command) {
        return toAjax(internalAdminService.addUser(command));
    }

    /**
     * 修改应用用户。
     */
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody AppUserAdminCommand command) {
        return toAjax(internalAdminService.updateUser(command));
    }

    /**
     * 修改应用用户有效标志。
     */
    @PutMapping("/validFlag")
    public R<Void> changeValidFlag(@Validated @RequestBody AppUserValidFlagCommand command) {
        return toAjax(internalAdminService.updateUserValidFlag(command));
    }

    /**
     * 重置应用用户密码。
     */
    @PutMapping("/password")
    public R<Void> resetPassword(@Validated @RequestBody AppUserPasswordCommand command) {
        return toAjax(internalAdminService.resetUserPassword(command));
    }

    /**
     * 删除应用用户。
     */
    @DeleteMapping("/{userIds}")
    public R<Void> remove(@NotEmpty(message = "用户 ID 不能为空") @PathVariable Long[] userIds) {
        return toAjax(internalAdminService.deleteUsers(List.of(userIds)));
    }

}
