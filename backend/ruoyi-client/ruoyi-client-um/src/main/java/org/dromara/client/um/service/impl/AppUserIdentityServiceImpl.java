package org.dromara.client.um.service.impl;

import lombok.RequiredArgsConstructor;
import org.dromara.client.um.domain.AppUserIdentity;
import org.dromara.client.um.domain.bo.AppUserIdentityBo;
import org.dromara.client.um.domain.vo.AppUserIdentityVo;
import org.dromara.client.um.mapper.AppUserIdentityMapper;
import org.dromara.client.um.service.IAppUserIdentityService;
import org.dromara.common.core.utils.MapstructUtils;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 应用用户第三方身份 Service 业务层处理。
 *
 * @author Lion Li
 */
@RequiredArgsConstructor
@Service
public class AppUserIdentityServiceImpl implements IAppUserIdentityService {

    private final AppUserIdentityMapper identityMapper;

    @Override
    public AppUserIdentityVo queryById(Long id) {
        return identityMapper.selectVoById(id);
    }

    @Override
    public AppUserIdentityVo queryBySourceAndOpenId(String source, String openId) {
        return identityMapper.lambda()
            .eq(AppUserIdentity::getSource, source)
            .eq(AppUserIdentity::getOpenId, openId)
            .voOne();
    }

    @Override
    public List<AppUserIdentityVo> queryList(AppUserIdentityBo bo) {
        return identityMapper.lambda()
            .eqIfPresent(AppUserIdentity::getUserId, bo.getUserId())
            .eqIfText(AppUserIdentity::getAuthId, bo.getAuthId())
            .eqIfText(AppUserIdentity::getSource, bo.getSource())
            .eqIfText(AppUserIdentity::getOpenId, bo.getOpenId())
            .voList();
    }

    @Override
    public Boolean insertByBo(AppUserIdentityBo bo) {
        AppUserIdentity add = MapstructUtils.convert(bo, AppUserIdentity.class);
        boolean flag = identityMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(AppUserIdentityBo bo) {
        AppUserIdentity update = MapstructUtils.convert(bo, AppUserIdentity.class);
        return identityMapper.updateById(update) > 0;
    }

    @Override
    public Boolean deleteById(Long id) {
        return identityMapper.deleteById(id) > 0;
    }

}
