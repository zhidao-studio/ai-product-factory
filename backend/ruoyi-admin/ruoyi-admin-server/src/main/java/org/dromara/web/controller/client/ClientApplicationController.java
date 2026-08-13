package org.dromara.web.controller.client;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.client.domain.bo.ClientApplicationBo;
import org.dromara.client.domain.vo.ClientApplicationVo;
import org.dromara.client.service.IClientApplicationService;
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
 * 产品端应用运营管理。
 *
 * @author Lion Li
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/client/application")
public class ClientApplicationController extends BaseController {

    private final IClientApplicationService applicationService;

    /**
     * 分页查询产品端应用。
     */
    @SaCheckPermission("client:application:list")
    @GetMapping("/list")
    public R<PageResult<ClientApplicationVo>> list(ClientApplicationBo bo, PageQuery pageQuery) {
        return R.ok(applicationService.queryPageList(bo, pageQuery));
    }

    /**
     * 导出产品端应用。
     */
    @SaCheckPermission("client:application:export")
    @Log(title = "产品端应用", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(ClientApplicationBo bo, HttpServletResponse response) {
        ExcelBuilder.of(applicationService.queryList(bo), ClientApplicationVo.class)
            .sheetName("产品端应用")
            .toResponse(response);
    }

    /**
     * 查询产品端应用详情。
     */
    @SaCheckPermission("client:application:query")
    @GetMapping("/{id}")
    public R<ClientApplicationVo> getInfo(@NotNull(message = "主键不能为空")
                                          @PathVariable Long id) {
        return R.ok(applicationService.queryById(id));
    }

    /**
     * 新增产品端应用。
     */
    @SaCheckPermission("client:application:add")
    @Log(title = "产品端应用", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody ClientApplicationBo bo) {
        if (!applicationService.checkClientKeyUnique(bo)) {
            return R.fail("新增客户端'" + bo.getClientKey() + "'失败，客户端 key 已存在");
        }
        return toAjax(applicationService.insertByBo(bo));
    }

    /**
     * 修改产品端应用。
     */
    @SaCheckPermission("client:application:edit")
    @Log(title = "产品端应用", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody ClientApplicationBo bo) {
        return toAjax(applicationService.updateByBo(bo));
    }

    /**
     * 修改产品端应用状态。
     */
    @SaCheckPermission("client:application:edit")
    @Log(title = "产品端应用", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping("/changeStatus")
    public R<Void> changeStatus(@RequestBody ClientApplicationBo bo) {
        return toAjax(applicationService.updateStatus(bo.getId(), bo.getStatus()));
    }

}
