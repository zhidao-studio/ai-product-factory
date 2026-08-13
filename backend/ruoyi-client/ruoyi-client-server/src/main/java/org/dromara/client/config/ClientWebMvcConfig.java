package org.dromara.client.config;

import lombok.RequiredArgsConstructor;
import org.dromara.client.interceptor.ClientSessionStatusInterceptor;
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
public class ClientWebMvcConfig implements WebMvcConfigurer {

    private final ClientSessionStatusInterceptor sessionStatusInterceptor;

    /**
     * 对应用用户受保护接口增加实时状态校验。
     *
     * @param registry 拦截器注册器
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(sessionStatusInterceptor)
            .addPathPatterns("/client/**");
    }

}
