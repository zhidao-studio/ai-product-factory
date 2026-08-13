package org.dromara.client.internal.controller;

import io.swagger.v3.oas.annotations.Hidden;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.client.api.admin.domain.AppClientAdminCommand;
import org.dromara.client.api.admin.domain.AppClientAdminQuery;
import org.dromara.client.api.admin.domain.AppClientAdminVo;
import org.dromara.client.api.admin.domain.AppClientValidFlagCommand;
import org.dromara.client.internal.service.ClientInternalAdminService;
import org.dromara.common.core.domain.PageResult;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.web.core.BaseController;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Client 提供给 Admin 的接入客户端内部管理接口。
 *
 * @author Lion Li
 */
@Hidden
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/internal/admin/v1/clients")
public class InternalAppClientAdminController extends BaseController {

    private final ClientInternalAdminService internalAdminService;

    /**
     * 分页查询接入客户端。
     */
    @GetMapping
    public R<PageResult<AppClientAdminVo>> list(AppClientAdminQuery query, PageQuery pageQuery) {
        return R.ok(internalAdminService.queryClientPage(query, pageQuery));
    }

    /**
     * 查询全部匹配的接入客户端，供 Admin 导出使用。
     */
    @GetMapping("/all")
    public R<List<AppClientAdminVo>> all(AppClientAdminQuery query) {
        return R.ok(internalAdminService.queryClientList(query));
    }

    /**
     * 查询接入客户端详情。
     */
    @GetMapping("/{id}")
    public R<AppClientAdminVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(internalAdminService.queryClientById(id));
    }

    /**
     * 新增接入客户端。
     */
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody AppClientAdminCommand command) {
        return toAjax(internalAdminService.addClient(command));
    }

    /**
     * 修改接入客户端。
     */
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody AppClientAdminCommand command) {
        return toAjax(internalAdminService.updateClient(command));
    }

    /**
     * 修改接入客户端有效标志。
     */
    @PutMapping("/validFlag")
    public R<Void> changeValidFlag(@Validated @RequestBody AppClientValidFlagCommand command) {
        return toAjax(internalAdminService.updateClientValidFlag(command));
    }

}
