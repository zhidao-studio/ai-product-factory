package org.dromara.client.config;

import jakarta.servlet.DispatcherType;
import lombok.RequiredArgsConstructor;
import org.dromara.client.config.properties.ClientInternalAdminProperties;
import org.dromara.client.internal.security.InternalAdminAuthFilter;
import org.dromara.client.interceptor.ClientSessionValidityInterceptor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistration;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Client Web 配置。
 *
 * @author Lion Li
 */
@RequiredArgsConstructor
@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(ClientInternalAdminProperties.class)
public class ClientWebMvcConfig implements WebMvcConfigurer {

    private final ClientSessionValidityInterceptor sessionValidityInterceptor;

    /**
     * 内部管理接口必须先按原始请求验签，再进入框架 XSS 清洗链。
     *
     * @param properties 内部管理接口认证配置
     * @return 内部管理接口认证过滤器
     */
    @Bean
    @FilterRegistration(
        name = "internalAdminAuthFilter",
        urlPatterns = "/internal/admin/*",
        order = FilterRegistrationBean.HIGHEST_PRECEDENCE + 1,
        dispatcherTypes = DispatcherType.REQUEST
    )
    public InternalAdminAuthFilter internalAdminAuthFilter(ClientInternalAdminProperties properties) {
        return new InternalAdminAuthFilter(properties);
    }

    /**
     * 对应用用户受保护接口增加实时有效性校验。
     *
     * @param registry 拦截器注册器
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(sessionValidityInterceptor)
            .addPathPatterns("/client/**");
    }

}
