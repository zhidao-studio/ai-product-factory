package org.dromara.client.service.impl;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.crypto.SecureUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.client.domain.ClientApplication;
import org.dromara.client.domain.bo.ClientApplicationBo;
import org.dromara.client.domain.vo.ClientApplicationVo;
import org.dromara.client.mapper.ClientApplicationMapper;
import org.dromara.client.service.IClientApplicationService;
import org.dromara.common.core.domain.PageResult;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.MapstructUtils;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.query.QueryBuilder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.UnaryOperator;

/**
 * 产品端应用 Service 业务层处理。
 *
 * @author Lion Li
 */
@RequiredArgsConstructor
@Service
public class ClientApplicationServiceImpl implements IClientApplicationService {

    private static final String CLIENT_RULE_SEPARATOR_REGEX = "[,;\\r\\n]+";

    private static final Map<String, Set<String>> DEVICE_GRANT_TYPE_RULES = Map.of(
        "h5", Set.of("password", "sms"),
        "app", Set.of("phonePassword", "sms"),
        "miniapp", Set.of("xcx"),
        "harmony", Set.of("password", "sms")
    );

    private final ClientApplicationMapper applicationMapper;

    @Override
    public ClientApplicationVo queryById(Long id) {
        ClientApplicationVo vo = applicationMapper.selectVoById(id);
        fillRuleFields(vo);
        return vo;
    }

    @Override
    public ClientApplicationVo queryByClientId(String clientId) {
        ClientApplicationVo vo = applicationMapper.lambda()
            .eq(ClientApplication::getClientId, clientId)
            .voOne();
        fillRuleFields(vo);
        return vo;
    }

    @Override
    public PageResult<ClientApplicationVo> queryPageList(ClientApplicationBo bo, PageQuery pageQuery) {
        Page<ClientApplicationVo> result = applicationMapper.selectVoPage(pageQuery.build(), buildQueryWrapper(bo));
        result.getRecords().forEach(this::fillRuleFields);
        return PageResult.build(result.getRecords(), result.getTotal());
    }

    @Override
    public List<ClientApplicationVo> queryList(ClientApplicationBo bo) {
        List<ClientApplicationVo> list = applicationMapper.selectVoList(buildQueryWrapper(bo));
        list.forEach(this::fillRuleFields);
        return list;
    }

    private LambdaQueryWrapper<ClientApplication> buildQueryWrapper(ClientApplicationBo bo) {
        return QueryBuilder.lambda(ClientApplication.class)
            .eqIfText(ClientApplication::getClientId, bo.getClientId())
            .eqIfText(ClientApplication::getClientKey, bo.getClientKey())
            .eqIfText(ClientApplication::getDeviceType, bo.getDeviceType())
            .eqIfText(ClientApplication::getStatus, bo.getStatus())
            .orderByAsc(ClientApplication::getId)
            .build();
    }

    @Override
    public boolean checkClientKeyUnique(ClientApplicationBo bo) {
        return !applicationMapper.lambda()
            .eq(ClientApplication::getClientKey, bo.getClientKey())
            .neIfPresent(ClientApplication::getId, bo.getId())
            .exists();
    }

    @Override
    public Boolean insertByBo(ClientApplicationBo bo) {
        validateApplicationRules(bo);
        ClientApplication add = MapstructUtils.convert(bo, ClientApplication.class);
        fillEntityRules(add, bo);
        add.setClientId(SecureUtil.md5(bo.getClientKey() + bo.getClientSecret()));
        boolean flag = applicationMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
            bo.setClientId(add.getClientId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(ClientApplicationBo bo) {
        validateApplicationRules(bo);
        ClientApplication update = MapstructUtils.convert(bo, ClientApplication.class);
        update.setClientId(null);
        update.setClientKey(null);
        update.setClientSecret(null);
        fillEntityRules(update, bo);
        return applicationMapper.updateById(update) > 0;
    }

    @Override
    public Boolean updateStatus(Long id, String status) {
        return applicationMapper.lambda()
            .set(ClientApplication::getStatus, status)
            .eq(ClientApplication::getId, id)
            .update();
    }

    private void fillEntityRules(ClientApplication entity, ClientApplicationBo bo) {
        entity.setGrantType(resolveRuleValue(null, bo.getGrantTypeList(), UnaryOperator.identity()));
        entity.setAccessPath(resolveRuleValue(bo.getAccessPath(), bo.getAccessPathList(), this::normalizeAccessPath));
        entity.setIpWhitelist(resolveRuleValue(bo.getIpWhitelist(), bo.getIpWhitelistList(), UnaryOperator.identity()));
    }

    private void validateApplicationRules(ClientApplicationBo bo) {
        Set<String> allowedGrantTypes = DEVICE_GRANT_TYPE_RULES.get(bo.getDeviceType());
        if (allowedGrantTypes == null) {
            throw new ServiceException("设备类型仅支持 h5、app、miniapp、harmony");
        }
        if (CollUtil.isEmpty(bo.getGrantTypeList())) {
            throw new ServiceException("授权类型不能为空");
        }
        List<String> invalidGrantTypes = bo.getGrantTypeList().stream()
            .filter(grantType -> StringUtils.isBlank(grantType) || !allowedGrantTypes.contains(grantType))
            .distinct()
            .toList();
        if (CollUtil.isNotEmpty(invalidGrantTypes)) {
            throw new ServiceException("设备类型'{}'不支持授权类型'{}'",
                bo.getDeviceType(), StringUtils.joinComma(invalidGrantTypes));
        }
        bo.setGrantTypeList(bo.getGrantTypeList().stream().distinct().toList());
    }

    private void fillRuleFields(ClientApplicationVo vo) {
        if (ObjectUtil.isNull(vo)) {
            return;
        }
        vo.setGrantTypeList(parseRuleList(vo.getGrantType(), UnaryOperator.identity()));
        vo.setAccessPathList(parseRuleList(vo.getAccessPath(), this::normalizeAccessPath));
        vo.setIpWhitelistList(parseRuleList(vo.getIpWhitelist(), UnaryOperator.identity()));
    }

    private String resolveRuleValue(String rawValue, List<String> listValue, UnaryOperator<String> normalizer) {
        List<String> rules = rawValue != null
            ? StringUtils.str2List(rawValue, CLIENT_RULE_SEPARATOR_REGEX, true, true)
            : listValue;
        if (CollUtil.isEmpty(rules)) {
            return listValue != null || rawValue != null ? StringUtils.EMPTY : null;
        }
        return CollUtil.join(rules.stream()
            .map(normalizer)
            .filter(StringUtils::isNotBlank)
            .toList(), StringUtils.SEPARATOR);
    }

    private List<String> parseRuleList(String value, UnaryOperator<String> normalizer) {
        return StringUtils.str2List(value, CLIENT_RULE_SEPARATOR_REGEX, true, true).stream()
            .map(normalizer)
            .filter(StringUtils::isNotBlank)
            .toList();
    }

    private String normalizeAccessPath(String path) {
        if (StringUtils.isBlank(path)) {
            return null;
        }
        String accessPath = StringUtils.trim(path);
        return accessPath.startsWith(StringUtils.SLASH) ? accessPath : StringUtils.SLASH + accessPath;
    }

}
