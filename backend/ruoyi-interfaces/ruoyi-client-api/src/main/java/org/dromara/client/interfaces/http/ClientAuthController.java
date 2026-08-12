package org.dromara.client.interfaces.http;

import lombok.RequiredArgsConstructor;
import org.dromara.client.application.ClientAuthApplicationService;
import org.dromara.client.application.command.ClientLoginCommand;
import org.dromara.common.core.domain.R;
import org.dromara.common.encrypt.annotation.ApiEncrypt;
import org.dromara.common.json.utils.JsonUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** H5、App、小程序和 HarmonyOS 共用的产品用户认证入口。 */
@RestController
@RequestMapping("/client-auth")
@RequiredArgsConstructor
public class ClientAuthController {

    private final ClientAuthApplicationService authService;

    @GetMapping("/code")
    public R<ClientCaptchaResponse> code() {
        return R.ok(new ClientCaptchaResponse(false, null, null));
    }

    @ApiEncrypt
    @PostMapping("/login")
    public R<ClientLoginResponse> login(@RequestBody String body) {
        ClientLoginRequest request = JsonUtils.parseObject(body, ClientLoginRequest.class);
        if (request == null) {
            return R.fail("登录请求不能为空");
        }
        ClientLoginCommand command = new ClientLoginCommand(
            request.clientId(), request.grantType(), request.username(), request.phoneNumber(),
            request.password(), request.smsCode(), request.appid(), request.xcxCode());
        return R.ok(ClientLoginResponse.from(authService.login(command)));
    }

    @PostMapping("/logout")
    public R<Void> logout() {
        authService.logout();
        return R.ok("退出成功");
    }
}
