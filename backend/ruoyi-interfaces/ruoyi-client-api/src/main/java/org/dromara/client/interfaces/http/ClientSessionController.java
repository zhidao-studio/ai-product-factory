package org.dromara.client.interfaces.http;

import lombok.RequiredArgsConstructor;
import org.dromara.client.application.ClientAuthApplicationService;
import org.dromara.common.core.domain.R;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 四个用户端统一使用的会话接口，不再按前端技术栈复制 Channel。 */
@RestController
@RequestMapping("/client-api/v1")
@RequiredArgsConstructor
public class ClientSessionController {

    private final ClientAuthApplicationService authService;

    @GetMapping("/session")
    public R<ClientSessionResponse> session() {
        return R.ok(ClientSessionResponse.from(authService.currentSession()));
    }
}
