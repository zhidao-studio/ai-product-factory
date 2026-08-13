package org.dromara.common.core.domain.model;

import java.io.Serializable;

/**
 * 登录会话的中立用户上下文。
 *
 * <p>Admin 与 Client 分别实现本接口，只共享会话框架需要的最小身份和终端信息。</p>
 *
 * @author Lion Li
 */
public interface LoginUserContext extends Serializable {

    /**
     * 获取用户 ID。
     *
     * @return 用户 ID
     */
    Long getUserId();

    /**
     * 获取用户名。
     *
     * @return 用户名
     */
    String getUsername();

    /**
     * 获取用户昵称。
     *
     * @return 用户昵称
     */
    String getNickname();

    /**
     * 获取用户类型。
     *
     * @return 用户类型
     */
    String getUserType();

    /**
     * 获取客户端标识。
     *
     * @return 客户端标识
     */
    String getClientKey();

    /**
     * 获取设备类型。
     *
     * @return 设备类型
     */
    String getDeviceType();

    /**
     * 设置设备类型。
     *
     * @param deviceType 设备类型
     */
    void setDeviceType(String deviceType);

    /**
     * 获取登录 IP 地址。
     *
     * @return 登录 IP 地址
     */
    String getIpaddr();

    /**
     * 设置登录 IP 地址。
     *
     * @param ipaddr 登录 IP 地址
     */
    void setIpaddr(String ipaddr);

    /**
     * 获取登录地点。
     *
     * @return 登录地点
     */
    String getLoginLocation();

    /**
     * 设置登录地点。
     *
     * @param loginLocation 登录地点
     */
    void setLoginLocation(String loginLocation);

    /**
     * 获取浏览器类型。
     *
     * @return 浏览器类型
     */
    String getBrowser();

    /**
     * 设置浏览器类型。
     *
     * @param browser 浏览器类型
     */
    void setBrowser(String browser);

    /**
     * 获取操作系统。
     *
     * @return 操作系统
     */
    String getOs();

    /**
     * 设置操作系统。
     *
     * @param os 操作系统
     */
    void setOs(String os);

    /**
     * 获取 Sa-Token 使用的登录标识。
     *
     * @return 登录标识
     */
    default String getLoginId() {
        if (getUserType() == null) {
            throw new IllegalArgumentException("用户类型不能为空");
        }
        if (getUserId() == null) {
            throw new IllegalArgumentException("用户ID不能为空");
        }
        return getUserType() + ":" + getUserId();
    }

}
