package org.dromara.client.security;

import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.stp.StpLogic;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.core.utils.ServletUtils;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Client 专用 Sa-Token 逻辑。
 *
 * <p>它使用 loginType=client，与 Admin 默认 StpUtil 的 loginType=login 完全隔离。</p>
 */
@Configuration
public class ClientSecurityConfiguration implements WebMvcConfigurer {

    public static final String CLIENT_ID_HEADER = "clientid";

    private final StpLogic clientStpLogic;

    public ClientSecurityConfiguration(@Qualifier("clientStpLogic") StpLogic clientStpLogic) {
        this.clientStpLogic = clientStpLogic;
    }

    @Bean("clientStpLogic")
    public static StpLogic clientStpLogic() {
        return new StpLogic("client");
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SaInterceptor(handler -> {
            clientStpLogic.checkLogin();
            String requestClientId = ServletUtils.getRequest().getHeader(CLIENT_ID_HEADER);
            ClientPrincipal principal = clientStpLogic.getTokenSession()
                .getModel(SaTokenClientSessionAdapter.PRINCIPAL_KEY, ClientPrincipal.class);
            if (principal == null || !StringUtils.equals(requestClientId, principal.clientId())) {
                throw NotLoginException.newInstance(
                    clientStpLogic.getLoginType(), "-100", "客户端ID与Token不匹配", clientStpLogic.getTokenValue());
            }
        })).addPathPatterns("/client-api/**", "/client-auth/logout");
    }
}
