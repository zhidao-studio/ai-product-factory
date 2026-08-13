package org.dromara.web.service.impl;

import lombok.RequiredArgsConstructor;
import org.dromara.client.api.admin.domain.AppClientAdminCommand;
import org.dromara.client.api.admin.domain.AppClientAdminQuery;
import org.dromara.client.api.admin.domain.AppClientAdminVo;
import org.dromara.client.api.admin.domain.AppClientValidFlagCommand;
import org.dromara.client.api.admin.domain.AppUserAdminCommand;
import org.dromara.client.api.admin.domain.AppUserAdminQuery;
import org.dromara.client.api.admin.domain.AppUserAdminVo;
import org.dromara.client.api.admin.domain.AppUserPasswordCommand;
import org.dromara.client.api.admin.domain.AppUserValidFlagCommand;
import org.dromara.common.core.constant.HttpStatus;
import org.dromara.common.core.domain.PageResult;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.MapstructUtils;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.web.domain.vo.AppClientManagementVo;
import org.dromara.web.domain.vo.AppUserManagementVo;
import org.dromara.web.service.ClientManagementService;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriBuilder;

import java.net.URI;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;
import java.util.stream.Collectors;

/**
 * 通过 Client 私有管理接口实现 Admin 侧运营管理能力。
 *
 * @author Lion Li
 */
@RequiredArgsConstructor
@Service
public class ClientManagementHttpServiceImpl implements ClientManagementService {

    private static final String INTERNAL_ADMIN_PATH = "/internal/admin/v1";

    private static final String USERS_PATH = INTERNAL_ADMIN_PATH + "/users";

    private static final String CLIENTS_PATH = INTERNAL_ADMIN_PATH + "/clients";

    private static final ParameterizedTypeReference<R<PageResult<AppUserAdminVo>>> USER_PAGE_TYPE =
        new ParameterizedTypeReference<>() { };

    private static final ParameterizedTypeReference<R<List<AppUserAdminVo>>> USER_LIST_TYPE =
        new ParameterizedTypeReference<>() { };

    private static final ParameterizedTypeReference<R<AppUserAdminVo>> USER_TYPE =
        new ParameterizedTypeReference<>() { };

    private static final ParameterizedTypeReference<R<PageResult<AppClientAdminVo>>> CLIENT_PAGE_TYPE =
        new ParameterizedTypeReference<>() { };

    private static final ParameterizedTypeReference<R<List<AppClientAdminVo>>> CLIENT_LIST_TYPE =
        new ParameterizedTypeReference<>() { };

    private static final ParameterizedTypeReference<R<AppClientAdminVo>> CLIENT_TYPE =
        new ParameterizedTypeReference<>() { };

    private static final ParameterizedTypeReference<R<Void>> VOID_TYPE = new ParameterizedTypeReference<>() { };

    private final RestClient clientManagementRestClient;

    @Override
    public PageResult<AppUserManagementVo> queryUserPage(AppUserAdminQuery query, PageQuery pageQuery) {
        PageResult<AppUserAdminVo> page = execute(() -> clientManagementRestClient.get()
            .uri(builder -> buildUserQueryUri(builder.path(USERS_PATH), query, pageQuery))
            .retrieve()
            .body(USER_PAGE_TYPE));
        requireData(page);
        return PageResult.build(toUserVoList(page.getRows()), page.getTotal());
    }

    @Override
    public List<AppUserManagementVo> queryUserList(AppUserAdminQuery query) {
        List<AppUserAdminVo> list = execute(() -> clientManagementRestClient.get()
            .uri(builder -> buildUserQueryUri(builder.path(USERS_PATH + "/all"), query, null))
            .retrieve()
            .body(USER_LIST_TYPE));
        requireData(list);
        return toUserVoList(list);
    }

    @Override
    public AppUserManagementVo queryUserById(Long userId) {
        AppUserAdminVo vo = execute(() -> clientManagementRestClient.get()
            .uri(USERS_PATH + "/{userId}", userId)
            .retrieve()
            .body(USER_TYPE));
        requireData(vo);
        return toUserVo(vo);
    }

    @Override
    public void addUser(AppUserAdminCommand command) {
        executeVoid(() -> clientManagementRestClient.post()
            .uri(USERS_PATH)
            .body(command)
            .retrieve()
            .body(VOID_TYPE));
    }

    @Override
    public void updateUser(AppUserAdminCommand command) {
        executeVoid(() -> clientManagementRestClient.put()
            .uri(USERS_PATH)
            .body(command)
            .retrieve()
            .body(VOID_TYPE));
    }

    @Override
    public void resetUserPassword(AppUserPasswordCommand command) {
        executeVoid(() -> clientManagementRestClient.put()
            .uri(USERS_PATH + "/password")
            .body(command)
            .retrieve()
            .body(VOID_TYPE));
    }

    @Override
    public void updateUserValidFlag(AppUserValidFlagCommand command) {
        executeVoid(() -> clientManagementRestClient.put()
            .uri(USERS_PATH + "/validFlag")
            .body(command)
            .retrieve()
            .body(VOID_TYPE));
    }

    @Override
    public void deleteUsers(Long[] userIds) {
        String ids = Arrays.stream(userIds).map(String::valueOf).collect(Collectors.joining(","));
        executeVoid(() -> clientManagementRestClient.delete()
            .uri(USERS_PATH + "/{userIds}", ids)
            .retrieve()
            .body(VOID_TYPE));
    }

    @Override
    public PageResult<AppClientManagementVo> queryClientPage(AppClientAdminQuery query, PageQuery pageQuery) {
        PageResult<AppClientAdminVo> page = execute(() -> clientManagementRestClient.get()
            .uri(builder -> buildClientQueryUri(builder.path(CLIENTS_PATH), query, pageQuery))
            .retrieve()
            .body(CLIENT_PAGE_TYPE));
        requireData(page);
        return PageResult.build(toClientVoList(page.getRows()), page.getTotal());
    }

    @Override
    public List<AppClientManagementVo> queryClientList(AppClientAdminQuery query) {
        List<AppClientAdminVo> list = execute(() -> clientManagementRestClient.get()
            .uri(builder -> buildClientQueryUri(builder.path(CLIENTS_PATH + "/all"), query, null))
            .retrieve()
            .body(CLIENT_LIST_TYPE));
        requireData(list);
        return toClientVoList(list);
    }

    @Override
    public AppClientManagementVo queryClientById(Long id) {
        AppClientAdminVo vo = execute(() -> clientManagementRestClient.get()
            .uri(CLIENTS_PATH + "/{id}", id)
            .retrieve()
            .body(CLIENT_TYPE));
        requireData(vo);
        return toClientVo(vo);
    }

    @Override
    public void addClient(AppClientAdminCommand command) {
        executeVoid(() -> clientManagementRestClient.post()
            .uri(CLIENTS_PATH)
            .body(command)
            .retrieve()
            .body(VOID_TYPE));
    }

    @Override
    public void updateClient(AppClientAdminCommand command) {
        executeVoid(() -> clientManagementRestClient.put()
            .uri(CLIENTS_PATH)
            .body(command)
            .retrieve()
            .body(VOID_TYPE));
    }

    @Override
    public void updateClientValidFlag(AppClientValidFlagCommand command) {
        executeVoid(() -> clientManagementRestClient.put()
            .uri(CLIENTS_PATH + "/validFlag")
            .body(command)
            .retrieve()
            .body(VOID_TYPE));
    }

    /**
     * 执行内部调用并统一处理 Client 标准响应与连接异常。
     */
    private <T> T execute(Supplier<R<T>> request) {
        try {
            R<T> result = request.get();
            if (result == null) {
                throw new ServiceException("Client 管理服务响应为空");
            }
            if (R.isError(result)) {
                String message = StringUtils.isBlank(result.getMsg())
                    ? "Client 管理服务操作失败" : result.getMsg();
                throw new ServiceException(message, normalizeErrorCode(result.getCode()));
            }
            return result.getData();
        } catch (ServiceException e) {
            throw e;
        } catch (ResourceAccessException e) {
            throw new ServiceException("Client 管理服务暂不可用", e);
        } catch (RestClientException e) {
            throw new ServiceException("Client 管理服务调用失败", e);
        }
    }

    private void executeVoid(Supplier<R<Void>> request) {
        execute(request);
    }

    /**
     * 内部服务身份错误不能透传为 Admin 登录态错误，避免前端误触发管理员退出。
     */
    private int normalizeErrorCode(int code) {
        if (code == HttpStatus.UNAUTHORIZED || code == HttpStatus.FORBIDDEN) {
            return HttpStatus.ERROR;
        }
        return code;
    }

    private URI buildUserQueryUri(UriBuilder builder, AppUserAdminQuery query, PageQuery pageQuery) {
        addQueryParam(builder, "userName", query.getUserName());
        addQueryParam(builder, "nickName", query.getNickName());
        addQueryParam(builder, "email", query.getEmail());
        addQueryParam(builder, "phoneNumber", query.getPhoneNumber());
        addQueryParam(builder, "validFlag", query.getValidFlag());
        if (query.getParams() != null) {
            for (Map.Entry<String, Object> entry : query.getParams().entrySet()) {
                addQueryParam(builder, "params[" + entry.getKey() + "]", entry.getValue());
            }
        }
        addPageQuery(builder, pageQuery);
        return builder.build();
    }

    private URI buildClientQueryUri(UriBuilder builder, AppClientAdminQuery query, PageQuery pageQuery) {
        addQueryParam(builder, "clientId", query.getClientId());
        addQueryParam(builder, "clientKey", query.getClientKey());
        addQueryParam(builder, "deviceType", query.getDeviceType());
        addQueryParam(builder, "validFlag", query.getValidFlag());
        addPageQuery(builder, pageQuery);
        return builder.build();
    }

    private void addPageQuery(UriBuilder builder, PageQuery pageQuery) {
        if (pageQuery == null) {
            return;
        }
        addQueryParam(builder, "pageNum", pageQuery.getPageNum());
        addQueryParam(builder, "pageSize", pageQuery.getPageSize());
        addQueryParam(builder, "orderByColumn", pageQuery.getOrderByColumn());
        addQueryParam(builder, "isAsc", pageQuery.getIsAsc());
    }

    private void addQueryParam(UriBuilder builder, String name, Object value) {
        if (value != null && (!(value instanceof String stringValue) || StringUtils.isNotBlank(stringValue))) {
            builder.queryParam(name, value);
        }
    }

    private void requireData(Object data) {
        if (data == null) {
            throw new ServiceException("Client 管理服务响应数据为空");
        }
    }

    private List<AppUserManagementVo> toUserVoList(Collection<AppUserAdminVo> list) {
        if (list == null) {
            return Collections.emptyList();
        }
        return list.stream().map(this::toUserVo).toList();
    }

    private AppUserManagementVo toUserVo(AppUserAdminVo source) {
        return MapstructUtils.convert(source, AppUserManagementVo.class);
    }

    private List<AppClientManagementVo> toClientVoList(Collection<AppClientAdminVo> list) {
        if (list == null) {
            return Collections.emptyList();
        }
        return list.stream().map(this::toClientVo).toList();
    }

    private AppClientManagementVo toClientVo(AppClientAdminVo source) {
        return MapstructUtils.convert(source, AppClientManagementVo.class);
    }

}
