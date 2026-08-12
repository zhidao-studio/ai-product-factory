package org.dromara.client.interfaces.http;

import lombok.RequiredArgsConstructor;
import org.dromara.client.application.ClientAuthApplicationService;
import org.dromara.common.core.domain.R;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Client 登录所需的公共资源接口。 */
@RestController
@RequestMapping("/client-resource")
@RequiredArgsConstructor
public class ClientResourceController {

    private final ClientAuthApplicationService authService;

    @GetMapping("/sms/code")
    public R<Void> smsCode(@RequestParam String phoneNumber) {
        authService.issueSmsCode(phoneNumber);
        return R.ok();
    }
}
