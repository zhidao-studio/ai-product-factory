package org.dromara.web.controller.client;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.client.api.admin.domain.AppClientAdminCommand;
import org.dromara.client.api.admin.domain.AppClientAdminQuery;
import org.dromara.client.api.admin.domain.AppClientValidFlagCommand;
import org.dromara.common.core.domain.PageResult;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.utils.MapstructUtils;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.excel.utils.ExcelBuilder;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.redis.annotation.RepeatSubmit;
import org.dromara.common.web.core.BaseController;
import org.dromara.web.domain.vo.AppClientExportVo;
import org.dromara.web.domain.vo.AppClientManagementVo;
import org.dromara.web.service.ClientManagementService;
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
 * 接入客户端运营管理。
 *
 * @author Lion Li
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/client/application")
public class ClientApplicationController extends BaseController {

    private final ClientManagementService clientManagementService;

    /**
     * 分页查询接入客户端。
     */
    @SaCheckPermission("client:application:list")
    @GetMapping("/list")
    public R<PageResult<AppClientManagementVo>> list(AppClientAdminQuery query, PageQuery pageQuery) {
        return R.ok(clientManagementService.queryClientPage(query, pageQuery));
    }

    /**
     * 导出接入客户端。
     */
    @SaCheckPermission("client:application:export")
    @Log(title = "接入客户端", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(AppClientAdminQuery query, HttpServletResponse response) {
        List<AppClientExportVo> exportList = clientManagementService.queryClientList(query).stream()
            .map(this::toClientExportVo)
            .toList();
        ExcelBuilder.of(exportList, AppClientExportVo.class)
            .sheetName("接入客户端")
            .toResponse(response);
    }

    /**
     * 查询接入客户端详情。
     */
    @SaCheckPermission("client:application:query")
    @GetMapping("/{id}")
    public R<AppClientManagementVo> getInfo(@NotNull(message = "主键不能为空")
                                            @PathVariable Long id) {
        return R.ok(clientManagementService.queryClientById(id));
    }

    /**
     * 新增接入客户端。
     */
    @SaCheckPermission("client:application:add")
    @Log(title = "接入客户端", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody AppClientAdminCommand command) {
        clientManagementService.addClient(command);
        return R.ok();
    }

    /**
     * 修改接入客户端。
     */
    @SaCheckPermission("client:application:edit")
    @Log(title = "接入客户端", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody AppClientAdminCommand command) {
        clientManagementService.updateClient(command);
        return R.ok();
    }

    /**
     * 修改接入客户端有效标志。
     */
    @SaCheckPermission("client:application:edit")
    @Log(title = "接入客户端", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping("/changeValidFlag")
    public R<Void> changeValidFlag(@Validated @RequestBody AppClientValidFlagCommand command) {
        clientManagementService.updateClientValidFlag(command);
        return R.ok();
    }

    private AppClientExportVo toClientExportVo(AppClientManagementVo source) {
        return MapstructUtils.convert(source, AppClientExportVo.class);
    }

}
