import { View, Text, Input, Image, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { getCodeImg, type VerifyCodeResult } from '../../api/auth'
import { useThemeMode } from '../../theme/ThemeProvider'
import { useSession } from '../../stores/SessionContext'
import './index.scss'

export default function Index() {
  const { resolvedMode, toggle } = useThemeMode()
  const { user, signIn, signOut } = useSession()
  const [captcha, setCaptcha] = useState<VerifyCodeResult | null>(null)
  const [username, setUsername] = useState('client')
  const [password, setPassword] = useState('admin123')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const loadCaptcha = async () => {
    try {
      const res = await getCodeImg()
      setCaptcha(res.data)
    } catch {
      // 错误已在请求层提示
    }
  }

  useEffect(() => {
    loadCaptcha()
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    try {
      await signIn({ username, password, code, uuid: captcha?.uuid })
      Taro.showToast({ title: '登录成功', icon: 'success' })
      await loadCaptcha()
      setCode('')
    } catch {
      await loadCaptcha()
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch {}
    Taro.showToast({ title: '已退出登录', icon: 'none' })
  }

  return (
    <View className='index'>
      <Text className='title'>RuoYi 鸿蒙首页</Text>
      <Text className='theme-tip'>当前主题：{resolvedMode === 'dark' ? '深色' : '浅色'}</Text>
      <Button onClick={toggle}>切换{resolvedMode === 'dark' ? '浅色' : '深色'}模式</Button>

      {user ? (
        <View className='user-card'>
          <Text>用户ID：{user.userId}</Text>
          <Text>用户名：{user.userName}</Text>
          <Text>昵称：{user.nickName}</Text>
          <Text>角色：{(user.roles || []).join('、') || '-'}</Text>
          <Button onClick={handleLogout}>退出登录</Button>
        </View>
      ) : (
        <View className='login-card'>
          <Input placeholder='用户名' value={username} onInput={(e) => setUsername(e.detail.value)} />
          <Input placeholder='密码' password value={password} onInput={(e) => setPassword(e.detail.value)} />
          <View className='captcha-row'>
            <Input placeholder='验证码' value={code} onInput={(e) => setCode(e.detail.value)} />
            {captcha?.captchaEnabled && captcha.img ? (
              <Image src={captcha.img} className='captcha-img' onClick={() => loadCaptcha()} />
            ) : null}
          </View>
          <Button loading={loading} onClick={handleLogin}>登录</Button>
          <Text className='tip'>默认产品用户 client / admin123</Text>
        </View>
      )}
    </View>
  )
}
