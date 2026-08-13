package org.dromara.web.config;

import org.dromara.common.core.domain.R;
import org.dromara.common.core.constant.HttpStatus;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.json.utils.JsonUtils;
import org.dromara.web.config.properties.ClientManagementProperties;
import org.dromara.web.service.client.ClientHttpRequestInterceptor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

/**
 * Client 内部管理接口客户端配置。
 *
 * @author Lion Li
 */
@Configuration
@EnableConfigurationProperties(ClientManagementProperties.class)
public class ClientManagementConfig {

    /**
     * 创建只用于 Admin 调用 Client 内部管理接口的 HTTP 客户端。
     *
     * @param builder    Spring 管理的客户端构建器
     * @param properties Client 管理接口配置
     * @return RestClient
     */
    @Bean
    public RestClient clientManagementRestClient(RestClient.Builder builder,
                                                 ClientManagementProperties properties) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(properties.getTimeout());
        requestFactory.setReadTimeout(properties.getTimeout());
        return builder.clone()
            .baseUrl(properties.getBaseUrl())
            .requestFactory(requestFactory)
            .requestInterceptor(new ClientHttpRequestInterceptor(properties.getSecret()))
            .defaultStatusHandler(HttpStatusCode::isError, (request, response) -> {
                R<?> result = readErrorResponse(response.getBody().readAllBytes());
                if (result != null && result.getMsg() != null) {
                    throw new ServiceException(result.getMsg(), HttpStatus.ERROR);
                }
                throw new ServiceException("Client 管理服务响应异常", HttpStatus.ERROR);
            })
            .build();
    }

    /**
     * 读取 Client 返回的标准错误响应，非标准响应由上层按服务异常处理。
     */
    private R<?> readErrorResponse(byte[] body) {
        try {
            return JsonUtils.parseObject(body, R.class);
        } catch (RuntimeException e) {
            return null;
        }
    }

}
