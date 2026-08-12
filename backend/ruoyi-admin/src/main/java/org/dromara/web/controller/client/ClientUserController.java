package org.dromara.web.controller.client;

import cn.dev33.satoken.annotation.SaCheckPermission;
import cn.hutool.crypto.digest.BCrypt;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.client.domain.bo.ClientUserBo;
import org.dromara.client.domain.vo.ClientUserVo;
import org.dromara.client.domain.vo.ClientUserExportVo;
import org.dromara.client.service.IClientUserService;
import org.dromara.common.core.domain.PageResult;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.encrypt.annotation.ApiEncrypt;
import org.dromara.common.excel.utils.ExcelBuilder;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.redis.annotation.RepeatSubmit;
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
 * 产品用户运营管理。
 *
 * @author Lion Li
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/client/user")
public class ClientUserController extends BaseController {

    private final IClientUserService userService;

    /**
     * 分页查询产品用户。
     */
    @SaCheckPermission("client:user:list")
    @GetMapping("/list")
    public R<PageResult<ClientUserVo>> list(ClientUserBo bo, PageQuery pageQuery) {
        return R.ok(userService.queryPageList(bo, pageQuery));
    }

    /**
     * 导出产品用户。
     */
    @SaCheckPermission("client:user:export")
    @Log(title = "产品用户", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(ClientUserBo bo, HttpServletResponse response) {
        ExcelBuilder.of(userService.queryExportList(bo), ClientUserExportVo.class)
            .sheetName("产品用户")
            .toResponse(response);
    }

    /**
     * 查询产品用户详情。
     */
    @SaCheckPermission("client:user:query")
    @GetMapping("/{userId}")
    public R<ClientUserVo> getInfo(@NotNull(message = "用户 ID 不能为空")
                                   @PathVariable Long userId) {
        return R.ok(userService.queryById(userId));
    }

    /**
     * 新增产品用户。
     */
    @SaCheckPermission("client:user:add")
    @Log(title = "产品用户", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody ClientUserBo bo) {
        if (!userService.checkUserNameUnique(bo)) {
            return R.fail("新增用户'" + bo.getUserName() + "'失败，登录账号已存在");
        } else if (StringUtils.isNotBlank(bo.getPhoneNumber()) && !userService.checkPhoneUnique(bo)) {
            return R.fail("新增用户'" + bo.getUserName() + "'失败，手机号码已存在");
        } else if (StringUtils.isNotBlank(bo.getEmail()) && !userService.checkEmailUnique(bo)) {
            return R.fail("新增用户'" + bo.getUserName() + "'失败，邮箱账号已存在");
        }
        bo.setPassword(BCrypt.hashpw(bo.getPassword()));
        return toAjax(userService.insertByBo(bo));
    }

    /**
     * 修改产品用户。
     */
    @SaCheckPermission("client:user:edit")
    @Log(title = "产品用户", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody ClientUserBo bo) {
        if (!userService.checkUserNameUnique(bo)) {
            return R.fail("修改用户'" + bo.getUserName() + "'失败，登录账号已存在");
        } else if (StringUtils.isNotBlank(bo.getPhoneNumber()) && !userService.checkPhoneUnique(bo)) {
            return R.fail("修改用户'" + bo.getUserName() + "'失败，手机号码已存在");
        } else if (StringUtils.isNotBlank(bo.getEmail()) && !userService.checkEmailUnique(bo)) {
            return R.fail("修改用户'" + bo.getUserName() + "'失败，邮箱账号已存在");
        }
        return toAjax(userService.updateByBo(bo));
    }

    /**
     * 重置产品用户密码。
     */
    @ApiEncrypt
    @SaCheckPermission("client:user:resetPwd")
    @Log(title = "产品用户", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping("/resetPwd")
    public R<Void> resetPassword(@RequestBody ClientUserBo bo) {
        if (bo.getUserId() == null || StringUtils.isBlank(bo.getPassword())) {
            return R.fail("用户 ID 和新密码不能为空");
        }
        return toAjax(userService.resetPassword(bo.getUserId(), BCrypt.hashpw(bo.getPassword())));
    }

    /**
     * 修改产品用户状态。
     */
    @SaCheckPermission("client:user:edit")
    @Log(title = "产品用户", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping("/changeStatus")
    public R<Void> changeStatus(@RequestBody ClientUserBo bo) {
        return toAjax(userService.updateStatus(bo.getUserId(), bo.getStatus()));
    }

    /**
     * 删除产品用户。
     */
    @SaCheckPermission("client:user:remove")
    @Log(title = "产品用户", businessType = BusinessType.DELETE)
    @DeleteMapping("/{userIds}")
    public R<Void> remove(@NotEmpty(message = "用户 ID 不能为空")
                          @PathVariable Long[] userIds) {
        return toAjax(userService.deleteWithValidByIds(List.of(userIds), true));
    }

}
