package org.dromara.client.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.client.domain.ClientIdentity;
import org.dromara.client.domain.ClientUser;
import org.dromara.client.domain.bo.ClientUserBo;
import org.dromara.client.domain.vo.ClientUserVo;
import org.dromara.client.domain.vo.ClientUserExportVo;
import org.dromara.client.mapper.ClientIdentityMapper;
import org.dromara.client.mapper.ClientUserMapper;
import org.dromara.client.service.IClientUserService;
import org.dromara.common.core.domain.PageResult;
import org.dromara.common.core.enums.UserType;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.MapstructUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.query.QueryBuilder;
import org.dromara.common.mybatis.helper.DataPermissionHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * 产品用户 Service 业务层处理。
 *
 * @author Lion Li
 */
@RequiredArgsConstructor
@Service
public class ClientUserServiceImpl implements IClientUserService {

    private final ClientUserMapper userMapper;

    private final ClientIdentityMapper identityMapper;

    @Override
    public ClientUserVo queryById(Long userId) {
        return userMapper.selectVoById(userId);
    }

    @Override
    public ClientUserVo queryByUserName(String userName) {
        return userMapper.lambda().eq(ClientUser::getUserName, userName).voOne();
    }

    @Override
    public ClientUserVo queryByPhoneNumber(String phoneNumber) {
        return userMapper.lambda().eq(ClientUser::getPhoneNumber, phoneNumber).voOne();
    }

    @Override
    public PageResult<ClientUserVo> queryPageList(ClientUserBo bo, PageQuery pageQuery) {
        Page<ClientUserVo> result = userMapper.selectVoPage(pageQuery.build(), buildQueryWrapper(bo));
        return PageResult.build(result.getRecords(), result.getTotal());
    }

    @Override
    public List<ClientUserVo> queryList(ClientUserBo bo) {
        return userMapper.selectVoList(buildQueryWrapper(bo));
    }

    @Override
    public List<ClientUserExportVo> queryExportList(ClientUserBo bo) {
        List<ClientUser> list = userMapper.selectList(buildQueryWrapper(bo));
        return MapstructUtils.convert(list, ClientUserExportVo.class);
    }

    private LambdaQueryWrapper<ClientUser> buildQueryWrapper(ClientUserBo bo) {
        return QueryBuilder.lambda(ClientUser.class)
            .likeIfText(ClientUser::getUserName, bo.getUserName())
            .likeIfText(ClientUser::getNickName, bo.getNickName())
            .eqIfText(ClientUser::getPhoneNumber, bo.getPhoneNumber())
            .eqIfText(ClientUser::getEmail, bo.getEmail())
            .eqIfText(ClientUser::getStatus, bo.getStatus())
            .betweenParams(ClientUser::getCreateTime, bo.getParams(), "beginCreateTime", "endCreateTime")
            .orderByAsc(ClientUser::getUserId)
            .build();
    }

    @Override
    public boolean checkUserNameUnique(ClientUserBo bo) {
        return !userMapper.lambda()
            .eq(ClientUser::getUserName, bo.getUserName())
            .neIfPresent(ClientUser::getUserId, bo.getUserId())
            .exists();
    }

    @Override
    public boolean checkPhoneUnique(ClientUserBo bo) {
        return !userMapper.lambda()
            .eqIfText(ClientUser::getPhoneNumber, bo.getPhoneNumber())
            .neIfPresent(ClientUser::getUserId, bo.getUserId())
            .exists();
    }

    @Override
    public boolean checkEmailUnique(ClientUserBo bo) {
        return !userMapper.lambda()
            .eqIfText(ClientUser::getEmail, bo.getEmail())
            .neIfPresent(ClientUser::getUserId, bo.getUserId())
            .exists();
    }

    @Override
    public Boolean insertByBo(ClientUserBo bo) {
        ClientUser add = MapstructUtils.convert(bo, ClientUser.class);
        add.setUserType(UserType.APP_USER.getUserType());
        boolean flag = userMapper.insert(add) > 0;
        if (flag) {
            bo.setUserId(add.getUserId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(ClientUserBo bo) {
        ClientUser update = MapstructUtils.convert(bo, ClientUser.class);
        update.setPassword(null);
        update.setUserType(UserType.APP_USER.getUserType());
        return userMapper.updateById(update) > 0;
    }

    @Override
    public Boolean updateStatus(Long userId, String status) {
        return userMapper.lambda()
            .set(ClientUser::getStatus, status)
            .eq(ClientUser::getUserId, userId)
            .update();
    }

    @Override
    public Boolean resetPassword(Long userId, String password) {
        return userMapper.lambda()
            .set(ClientUser::getPassword, password)
            .setSql("credential_version = credential_version + 1")
            .eq(ClientUser::getUserId, userId)
            .update();
    }

    @Override
    public Boolean updateLastLoginInfo(Long userId, String ip) {
        ClientUser update = new ClientUser();
        update.setUserId(userId);
        update.setLoginIp(ip);
        update.setLoginDate(LocalDateTime.now());
        update.setUpdateBy(userId);
        return DataPermissionHelper.ignore(() -> userMapper.updateById(update) > 0);
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (identityMapper.lambda().in(ClientIdentity::getUserId, ids).exists()) {
            throw new ServiceException("产品用户已绑定第三方身份，请停用账号而不是删除");
        }
        return userMapper.deleteByIds(ids) > 0;
    }

}
