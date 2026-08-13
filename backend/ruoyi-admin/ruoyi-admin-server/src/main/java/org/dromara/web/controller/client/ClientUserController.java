package org.dromara.web.controller.client;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.client.api.admin.domain.AppUserAdminCommand;
import org.dromara.client.api.admin.domain.AppUserAdminQuery;
import org.dromara.client.api.admin.domain.AppUserPasswordCommand;
import org.dromara.client.api.admin.domain.AppUserValidFlagCommand;
import org.dromara.common.core.domain.PageResult;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.utils.MapstructUtils;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.encrypt.annotation.ApiEncrypt;
import org.dromara.common.excel.utils.ExcelBuilder;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.redis.annotation.RepeatSubmit;
import org.dromara.common.web.core.BaseController;
import org.dromara.web.domain.vo.AppUserExportVo;
import org.dromara.web.domain.vo.AppUserManagementVo;
import org.dromara.web.service.ClientManagementService;
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
 * 应用用户运营管理。
 *
 * @author Lion Li
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/client/user")
public class ClientUserController extends BaseController {

    private final ClientManagementService clientManagementService;

    /**
     * 分页查询应用用户。
     */
    @SaCheckPermission("client:user:list")
    @GetMapping("/list")
    public R<PageResult<AppUserManagementVo>> list(AppUserAdminQuery query, PageQuery pageQuery) {
        return R.ok(clientManagementService.queryUserPage(query, pageQuery));
    }

    /**
     * 导出应用用户。
     */
    @SaCheckPermission("client:user:export")
    @Log(title = "应用用户", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(AppUserAdminQuery query, HttpServletResponse response) {
        List<AppUserExportVo> exportList = clientManagementService.queryUserList(query).stream()
            .map(this::toUserExportVo)
            .toList();
        ExcelBuilder.of(exportList, AppUserExportVo.class)
            .sheetName("应用用户")
            .toResponse(response);
    }

    /**
     * 查询应用用户详情。
     */
    @SaCheckPermission("client:user:query")
    @GetMapping("/{userId}")
    public R<AppUserManagementVo> getInfo(@NotNull(message = "用户 ID 不能为空")
                                          @PathVariable Long userId) {
        return R.ok(clientManagementService.queryUserById(userId));
    }

    /**
     * 新增应用用户。
     */
    @SaCheckPermission("client:user:add")
    @Log(title = "应用用户", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody AppUserAdminCommand command) {
        clientManagementService.addUser(command);
        return R.ok();
    }

    /**
     * 修改应用用户。
     */
    @SaCheckPermission("client:user:edit")
    @Log(title = "应用用户", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody AppUserAdminCommand command) {
        clientManagementService.updateUser(command);
        return R.ok();
    }

    /**
     * 重置应用用户密码。
     */
    @ApiEncrypt
    @SaCheckPermission("client:user:resetPwd")
    @Log(title = "应用用户", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping("/resetPwd")
    public R<Void> resetPassword(@Validated @RequestBody AppUserPasswordCommand command) {
        clientManagementService.resetUserPassword(command);
        return R.ok();
    }

    /**
     * 修改应用用户有效标志。
     */
    @SaCheckPermission("client:user:edit")
    @Log(title = "应用用户", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping("/changeValidFlag")
    public R<Void> changeValidFlag(@Validated @RequestBody AppUserValidFlagCommand command) {
        clientManagementService.updateUserValidFlag(command);
        return R.ok();
    }

    /**
     * 删除应用用户。
     */
    @SaCheckPermission("client:user:remove")
    @Log(title = "应用用户", businessType = BusinessType.DELETE)
    @DeleteMapping("/{userIds}")
    public R<Void> remove(@NotEmpty(message = "用户 ID 不能为空")
                          @PathVariable Long[] userIds) {
        clientManagementService.deleteUsers(userIds);
        return R.ok();
    }

    private AppUserExportVo toUserExportVo(AppUserManagementVo source) {
        return MapstructUtils.convert(source, AppUserExportVo.class);
    }

}
