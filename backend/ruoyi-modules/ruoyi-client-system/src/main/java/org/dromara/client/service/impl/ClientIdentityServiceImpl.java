package org.dromara.client.service.impl;

import lombok.RequiredArgsConstructor;
import org.dromara.client.domain.ClientIdentity;
import org.dromara.client.domain.bo.ClientIdentityBo;
import org.dromara.client.domain.vo.ClientIdentityVo;
import org.dromara.client.mapper.ClientIdentityMapper;
import org.dromara.client.service.IClientIdentityService;
import org.dromara.common.core.utils.MapstructUtils;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 产品用户第三方身份 Service 业务层处理。
 *
 * @author Lion Li
 */
@RequiredArgsConstructor
@Service
public class ClientIdentityServiceImpl implements IClientIdentityService {

    private final ClientIdentityMapper identityMapper;

    @Override
    public ClientIdentityVo queryById(Long id) {
        return identityMapper.selectVoById(id);
    }

    @Override
    public ClientIdentityVo queryBySourceAndOpenId(String source, String openId) {
        return identityMapper.lambda()
            .eq(ClientIdentity::getSource, source)
            .eq(ClientIdentity::getOpenId, openId)
            .voOne();
    }

    @Override
    public List<ClientIdentityVo> queryList(ClientIdentityBo bo) {
        return identityMapper.lambda()
            .eqIfPresent(ClientIdentity::getUserId, bo.getUserId())
            .eqIfText(ClientIdentity::getAuthId, bo.getAuthId())
            .eqIfText(ClientIdentity::getSource, bo.getSource())
            .eqIfText(ClientIdentity::getOpenId, bo.getOpenId())
            .voList();
    }

    @Override
    public Boolean insertByBo(ClientIdentityBo bo) {
        ClientIdentity add = MapstructUtils.convert(bo, ClientIdentity.class);
        boolean flag = identityMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(ClientIdentityBo bo) {
        ClientIdentity update = MapstructUtils.convert(bo, ClientIdentity.class);
        return identityMapper.updateById(update) > 0;
    }

    @Override
    public Boolean deleteById(Long id) {
        return identityMapper.deleteById(id) > 0;
    }

}
