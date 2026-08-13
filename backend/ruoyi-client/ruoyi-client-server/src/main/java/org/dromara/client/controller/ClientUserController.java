package org.dromara.client.controller;

import cn.dev33.satoken.stp.StpUtil;
import lombok.RequiredArgsConstructor;
import org.dromara.client.api.model.ClientLoginUser;
import org.dromara.client.um.domain.vo.AppUserVo;
import org.dromara.client.um.service.IAppUserService;
import org.dromara.client.web.domain.vo.ClientSessionVo;
import org.dromara.common.core.domain.R;
import org.dromara.common.satoken.utils.LoginHelper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;

/**
 * 当前应用用户控制器。
 *
 * @author Lion Li
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("/client/user")
public class ClientUserController {

    private final IAppUserService userService;

    /**
     * 获取当前应用用户会话信息。
     *
     * @return 当前会话
     */
    @GetMapping("/info")
    public R<ClientSessionVo> getInfo() {
        ClientLoginUser loginUser = LoginHelper.getLoginUser();
        AppUserVo user = userService.queryById(loginUser.getUserId());
        if (user == null) {
            return R.fail("没有权限访问用户数据!");
        }
        ClientSessionVo session = new ClientSessionVo();
        session.setUserId(user.getId());
        session.setUserName(user.getUserName());
        session.setNickName(user.getNickName());
        session.setAvatar(null);
        session.setClientId(String.valueOf(StpUtil.getExtra(LoginHelper.CLIENT_KEY)));
        session.setDeviceType(loginUser.getDeviceType());
        session.setRoles(Collections.emptyList());
        session.setPermissions(Collections.emptyList());
        return R.ok(session);
    }

}
