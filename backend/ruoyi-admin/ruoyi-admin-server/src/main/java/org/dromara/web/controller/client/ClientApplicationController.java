package org.dromara.web.controller.client;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.client.um.domain.bo.AppClientBo;
import org.dromara.client.um.domain.vo.AppClientVo;
import org.dromara.client.um.service.IAppClientService;
import org.dromara.common.core.domain.PageResult;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.excel.utils.ExcelBuilder;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.redis.annotation.RepeatSubmit;
import org.dromara.common.web.core.BaseController;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    private final IAppClientService clientService;

    /**
     * 分页查询接入客户端。
     */
    @SaCheckPermission("client:application:list")
    @GetMapping("/list")
    public R<PageResult<AppClientVo>> list(AppClientBo bo, PageQuery pageQuery) {
        return R.ok(clientService.queryPageList(bo, pageQuery));
    }

    /**
     * 导出接入客户端。
     */
    @SaCheckPermission("client:application:export")
    @Log(title = "接入客户端", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(AppClientBo bo, HttpServletResponse response) {
        ExcelBuilder.of(clientService.queryList(bo), AppClientVo.class)
            .sheetName("接入客户端")
            .toResponse(response);
    }

    /**
     * 查询接入客户端详情。
     */
    @SaCheckPermission("client:application:query")
    @GetMapping("/{id}")
    public R<AppClientVo> getInfo(@NotNull(message = "主键不能为空")
                                          @PathVariable Long id) {
        return R.ok(clientService.queryById(id));
    }

    /**
     * 新增接入客户端。
     */
    @SaCheckPermission("client:application:add")
    @Log(title = "接入客户端", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody AppClientBo bo) {
        if (!clientService.checkClientKeyUnique(bo)) {
            return R.fail("新增客户端'" + bo.getClientKey() + "'失败，客户端 key 已存在");
        }
        return toAjax(clientService.insertByBo(bo));
    }

    /**
     * 修改接入客户端。
     */
    @SaCheckPermission("client:application:edit")
    @Log(title = "接入客户端", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody AppClientBo bo) {
        return toAjax(clientService.updateByBo(bo));
    }

    /**
     * 修改接入客户端状态。
     */
    @SaCheckPermission("client:application:edit")
    @Log(title = "接入客户端", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping("/changeStatus")
    public R<Void> changeStatus(@RequestBody AppClientBo bo) {
        return toAjax(clientService.updateStatus(bo.getId(), bo.getStatus()));
    }

}
