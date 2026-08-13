package org.dromara.client.um.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.client.um.domain.AppUser;
import org.dromara.client.um.domain.AppUserIdentity;
import org.dromara.client.um.domain.bo.AppUserBo;
import org.dromara.client.um.domain.vo.AppUserVo;
import org.dromara.client.um.mapper.AppUserIdentityMapper;
import org.dromara.client.um.mapper.AppUserMapper;
import org.dromara.client.um.service.IAppUserService;
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
 * 应用用户 Service 业务层处理。
 *
 * @author Lion Li
 */
@RequiredArgsConstructor
@Service
public class AppUserServiceImpl implements IAppUserService {

    private final AppUserMapper userMapper;

    private final AppUserIdentityMapper identityMapper;

    @Override
    public AppUserVo queryById(Long userId) {
        return userMapper.selectVoById(userId);
    }

    @Override
    public AppUserVo queryByUserName(String userName) {
        return userMapper.lambda().eq(AppUser::getUserName, userName).voOne();
    }

    @Override
    public AppUserVo queryByPhoneNumber(String phoneNumber) {
        return userMapper.lambda().eq(AppUser::getPhoneNumber, phoneNumber).voOne();
    }

    @Override
    public PageResult<AppUserVo> queryPageList(AppUserBo bo, PageQuery pageQuery) {
        Page<AppUserVo> result = userMapper.selectVoPage(pageQuery.build(), buildQueryWrapper(bo));
        return PageResult.build(result.getRecords(), result.getTotal());
    }

    @Override
    public List<AppUserVo> queryList(AppUserBo bo) {
        return userMapper.selectVoList(buildQueryWrapper(bo));
    }

    private LambdaQueryWrapper<AppUser> buildQueryWrapper(AppUserBo bo) {
        return QueryBuilder.lambda(AppUser.class)
            .likeIfText(AppUser::getUserName, bo.getUserName())
            .likeIfText(AppUser::getNickName, bo.getNickName())
            .eqIfText(AppUser::getPhoneNumber, bo.getPhoneNumber())
            .eqIfText(AppUser::getEmail, bo.getEmail())
            .eqIfText(AppUser::getStatus, bo.getStatus())
            .betweenParams(AppUser::getCreateTime, bo.getParams(), "beginCreateTime", "endCreateTime")
            .orderByAsc(AppUser::getUserId)
            .build();
    }

    @Override
    public boolean checkUserNameUnique(AppUserBo bo) {
        return !userMapper.lambda()
            .eq(AppUser::getUserName, bo.getUserName())
            .neIfPresent(AppUser::getUserId, bo.getUserId())
            .exists();
    }

    @Override
    public boolean checkPhoneUnique(AppUserBo bo) {
        return !userMapper.lambda()
            .eqIfText(AppUser::getPhoneNumber, bo.getPhoneNumber())
            .neIfPresent(AppUser::getUserId, bo.getUserId())
            .exists();
    }

    @Override
    public boolean checkEmailUnique(AppUserBo bo) {
        return !userMapper.lambda()
            .eqIfText(AppUser::getEmail, bo.getEmail())
            .neIfPresent(AppUser::getUserId, bo.getUserId())
            .exists();
    }

    @Override
    public Boolean insertByBo(AppUserBo bo) {
        AppUser add = MapstructUtils.convert(bo, AppUser.class);
        add.setUserType(UserType.APP_USER.getUserType());
        boolean flag = userMapper.insert(add) > 0;
        if (flag) {
            bo.setUserId(add.getUserId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(AppUserBo bo) {
        AppUser update = MapstructUtils.convert(bo, AppUser.class);
        update.setPassword(null);
        update.setUserType(UserType.APP_USER.getUserType());
        return userMapper.updateById(update) > 0;
    }

    @Override
    public Boolean updateStatus(Long userId, String status) {
        AppUser update = new AppUser();
        update.setUserId(userId);
        update.setStatus(status);
        return userMapper.updateById(update) > 0;
    }

    @Override
    public Boolean resetPassword(Long userId, String password) {
        AppUser update = new AppUser();
        update.setUserId(userId);
        update.setPassword(password);
        return userMapper.update(update, Wrappers.lambdaUpdate(AppUser.class)
            .setSql("credential_version = credential_version + 1")
            .eq(AppUser::getUserId, userId)) > 0;
    }

    @Override
    public Boolean updateLastLoginInfo(Long userId, String ip) {
        AppUser update = new AppUser();
        update.setUserId(userId);
        update.setLoginIp(ip);
        update.setLoginDate(LocalDateTime.now());
        update.setUpdateBy(userId);
        return DataPermissionHelper.ignore(() -> userMapper.updateById(update) > 0);
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if (identityMapper.lambda().in(AppUserIdentity::getUserId, ids).exists()) {
            throw new ServiceException("应用用户已绑定第三方身份，请停用账号而不是删除");
        }
        return userMapper.deleteByIds(ids) > 0;
    }

}
