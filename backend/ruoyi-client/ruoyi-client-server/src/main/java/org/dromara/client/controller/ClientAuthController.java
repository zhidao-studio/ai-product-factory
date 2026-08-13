package org.dromara.client.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.ObjectUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.client.domain.vo.ClientApplicationVo;
import org.dromara.client.domain.vo.ClientLoginVo;
import org.dromara.client.service.IClientApplicationService;
import org.dromara.client.web.service.ClientLoginService;
import org.dromara.client.web.service.IClientAuthStrategy;
import org.dromara.common.core.constant.SystemConstants;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.domain.model.LoginBody;
import org.dromara.common.core.utils.MessageUtils;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.core.utils.ValidatorUtils;
import org.dromara.common.encrypt.annotation.ApiEncrypt;
import org.dromara.common.json.utils.JsonUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 产品用户认证控制器。
 *
 * @author Lion Li
 */
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/auth")
public class ClientAuthController {

    private final IClientApplicationService applicationService;
    private final ClientLoginService loginService;

    /**
     * 产品用户登录。
     *
     * @param body 加密登录请求
     * @return 登录令牌
     */
    @SaIgnore
    @ApiEncrypt
    @PostMapping("/login")
    public R<ClientLoginVo> login(@RequestBody String body) {
        LoginBody loginBody = JsonUtils.parseObject(body, LoginBody.class);
        ValidatorUtils.validate(loginBody);
        ClientApplicationVo client = applicationService.queryByClientId(loginBody.getClientId());
        if (ObjectUtil.isNull(client)
            || !CollUtil.contains(StringUtils.splitList(client.getGrantType()), loginBody.getGrantType())) {
            log.info("客户端 ID: {} 认证类型: {} 异常.", loginBody.getClientId(), loginBody.getGrantType());
            return R.fail(MessageUtils.message("auth.grant.type.error"));
        }
        if (!SystemConstants.NORMAL.equals(client.getStatus())) {
            return R.fail(MessageUtils.message("auth.grant.type.blocked"));
        }
        return R.ok(IClientAuthStrategy.login(body, client, loginBody.getGrantType()));
    }

    /**
     * 退出当前产品用户登录态。
     *
     * @return 操作结果
     */
    @PostMapping("/logout")
    public R<Void> logout() {
        loginService.logout();
        return R.ok("退出成功");
    }

}
