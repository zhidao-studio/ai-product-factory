import { Button, Text, View } from '@tarojs/components'
import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { getInfo, loginByWechat, logout, type UserInfo } from '../../api/auth'
import { getToken, removeToken, setToken } from '../../utils/auth'
import { useThemeMode } from '../../theme/ThemeProvider'
import { colors } from '../../theme/tokens'
import './index.scss'

export default function Index() {
  const { resolvedMode, toggle } = useThemeMode()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    if (getToken()) {
      getInfo()
        .then((response) => setUser(response.data))
        .catch(() => removeToken())
    }
  }, [])

  const handleWechatLogin = async () => {
    setLoading(true)
    try {
      const { code } = await Taro.login()
      if (!code) throw new Error('未获取到微信授权码')
      const response = await loginByWechat(code)
      setToken(response.data.access_token)
      const info = await getInfo()
      setUser(info.data)
      Taro.showToast({ title: '登录成功', icon: 'success' })
    } catch (error) {
      if (error instanceof Error && error.message === '未获取到微信授权码') {
        Taro.showToast({ title: error.message, icon: 'none' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const { confirm } = await Taro.showModal({
      title: '退出登录',
      content: '确定退出当前产品用户账号吗？',
      confirmColor: colors.colorError,
    })
    if (!confirm) return
    try {
      await logout()
    } catch {
      // 服务端会话已失效时仍需清理本地 Token。
    }
    removeToken()
    setUser(null)
    Taro.showToast({ title: '已退出登录', icon: 'none' })
  }

  return (
    <View className={`index theme-${resolvedMode}`}>
      <View className='page-header'>
        <Text className='title'>产品小程序</Text>
        <Text className='subtitle'>微信用户端</Text>
      </View>

      <View className='card theme-card'>
        <Text className='card-title'>外观</Text>
        <Text className='secondary-text'>当前模式：{resolvedMode === 'dark' ? '深色' : '浅色'}</Text>
        <Button className='action-button' onClick={toggle}>
          切换{resolvedMode === 'dark' ? '浅色' : '深色'}模式
        </Button>
      </View>

      {user ? (
        <View className='card user-card'>
          <Text className='card-title'>当前产品用户</Text>
          <View className='info-row'><Text className='info-label'>用户 ID</Text><Text>{String(user.userId)}</Text></View>
          <View className='info-row'><Text className='info-label'>用户名</Text><Text>{user.userName}</Text></View>
          <View className='info-row'><Text className='info-label'>昵称</Text><Text>{user.nickName}</Text></View>
          <View className='info-row'><Text className='info-label'>设备类型</Text><Text>{user.deviceType}</Text></View>
          <View className='info-row'><Text className='info-label'>角色</Text><Text>{user.roles.join('、') || '-'}</Text></View>
          <Button className='action-button logout-button' type='warn' onClick={handleLogout}>退出登录</Button>
        </View>
      ) : (
        <View className='card login-card'>
          <Text className='card-title'>微信授权登录</Text>
          <Text className='secondary-text'>使用微信授权码完成产品用户身份认证。</Text>
          <Button
            className='action-button primary-button'
            type='primary'
            loading={loading}
            disabled={loading}
            onClick={handleWechatLogin}
          >
            微信快捷登录
          </Button>
        </View>
      )}
    </View>
  )
}
