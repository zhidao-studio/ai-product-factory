import { Button, Image, Input, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useRef, useState } from 'react'
import {
  getCodeImg,
  getInfo,
  getSmsCode,
  loginByPassword,
  loginBySms,
  logout,
  type UserInfo,
  type VerifyCodeResult,
} from '../../api/auth'
import { getToken, removeToken, setToken } from '../../utils/auth'
import { useThemeMode } from '../../theme/ThemeProvider'
import { colors } from '../../theme/tokens'
import './index.scss'

type LoginMode = 'password' | 'sms'

const PHONE_PATTERN = /^1[3-9]\d{9}$/
const COUNTDOWN_SECONDS = 60

export default function Index() {
  const { resolvedMode, toggle } = useThemeMode()
  const [mode, setMode] = useState<LoginMode>('password')
  const [username, setUsername] = useState('client')
  const [password, setPassword] = useState('admin123')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [captchaCode, setCaptchaCode] = useState('')
  const [captcha, setCaptcha] = useState<VerifyCodeResult | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadCaptcha = async () => {
    try {
      const response = await getCodeImg()
      setCaptcha(response.data)
    } catch {
      // 请求层已给出用户反馈。
    }
  }

  useEffect(() => {
    loadCaptcha()
    getToken().then((token) => {
      if (token) {
        getInfo()
          .then((response) => setUser(response.data))
          .catch(() => removeToken())
      }
    })
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const handleSendSms = async () => {
    if (!PHONE_PATTERN.test(phoneNumber)) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    if (countdown > 0) return
    try {
      await getSmsCode(phoneNumber)
      setCountdown(COUNTDOWN_SECONDS)
      timerRef.current = setInterval(() => {
        setCountdown((current) => {
          if (current <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            return 0
          }
          return current - 1
        })
      }, 1000)
      Taro.showToast({ title: '验证码已发送', icon: 'success' })
    } catch {
      // 请求层已给出用户反馈。
    }
  }

  const handleLogin = async () => {
    if (mode === 'password' && (!username.trim() || !password)) {
      Taro.showToast({ title: '请填写用户名和密码', icon: 'none' })
      return
    }
    if (mode === 'sms' && (!PHONE_PATTERN.test(phoneNumber) || !smsCode)) {
      Taro.showToast({ title: '请填写正确的手机号和短信验证码', icon: 'none' })
      return
    }
    setLoading(true)
    try {
      const response = mode === 'password'
        ? await loginByPassword(username, password, captchaCode, captcha?.uuid)
        : await loginBySms(phoneNumber, smsCode)
      await setToken(response.data.access_token)
      const info = await getInfo()
      setUser(info.data)
      setCaptchaCode('')
      Taro.showToast({ title: '登录成功', icon: 'success' })
      if (mode === 'password') await loadCaptcha()
    } catch {
      if (mode === 'password') await loadCaptcha()
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const { confirm } = await Taro.showModal({
      title: '退出登录',
      content: '确定退出当前应用用户账号吗？',
      confirmColor: colors.colorError,
    })
    if (!confirm) return
    try {
      await logout()
    } catch {
      // 服务端会话已失效时仍需清理本地 Token。
    }
    await removeToken()
    setUser(null)
    Taro.showToast({ title: '已退出登录', icon: 'none' })
  }

  return (
    <View className={`page page-${resolvedMode}`}>
      <View className='page-content'>
        <View className='page-header'>
          <Text className={`title title-${resolvedMode}`}>HarmonyOS 客户端</Text>
          <Text className={`subtitle subtitle-${resolvedMode}`}>应用用户服务</Text>
        </View>

        <View className='content-grid'>
          <View className={`card card-${resolvedMode} theme-card`}>
            <Text className={`card-title card-title-${resolvedMode}`}>外观</Text>
            <Text className={`secondary-text secondary-text-${resolvedMode}`}>当前模式：{resolvedMode === 'dark' ? '深色' : '浅色'}</Text>
            <Button className={`action-button secondary-button-${resolvedMode}`} onClick={toggle}>切换{resolvedMode === 'dark' ? '浅色' : '深色'}模式</Button>
          </View>

          {user ? (
            <View className={`card card-${resolvedMode} session-card`}>
              <Text className={`card-title card-title-${resolvedMode}`}>当前应用用户</Text>
              <View className={`info-row info-row-${resolvedMode}`}><Text className={`info-label info-label-${resolvedMode}`}>用户 ID</Text><Text className={`body-text-${resolvedMode}`}>{String(user.userId)}</Text></View>
              <View className={`info-row info-row-${resolvedMode}`}><Text className={`info-label info-label-${resolvedMode}`}>用户名</Text><Text className={`body-text-${resolvedMode}`}>{user.userName}</Text></View>
              <View className={`info-row info-row-${resolvedMode}`}><Text className={`info-label info-label-${resolvedMode}`}>昵称</Text><Text className={`body-text-${resolvedMode}`}>{user.nickName}</Text></View>
              <View className={`info-row info-row-${resolvedMode}`}><Text className={`info-label info-label-${resolvedMode}`}>设备类型</Text><Text className={`body-text-${resolvedMode}`}>{user.deviceType}</Text></View>
              <View className={`info-row info-row-${resolvedMode}`}><Text className={`info-label info-label-${resolvedMode}`}>角色</Text><Text className={`body-text-${resolvedMode}`}>{user.roles.join('、') || '-'}</Text></View>
              <Button className='action-button danger-button' type='warn' onClick={handleLogout}>退出登录</Button>
            </View>
          ) : (
            <View className={`card card-${resolvedMode} session-card`}>
              <Text className={`card-title card-title-${resolvedMode}`}>应用用户登录</Text>
              <View className='login-tabs'>
                <View className={`login-tab login-tab-${resolvedMode} ${mode === 'password' ? `login-tab-active-${resolvedMode}` : ''}`} onClick={() => setMode('password')}>
                  <Text className={mode === 'password' ? `primary-text-${resolvedMode}` : `secondary-text-${resolvedMode}`}>账号密码</Text>
                </View>
                <View className={`login-tab login-tab-${resolvedMode} ${mode === 'sms' ? `login-tab-active-${resolvedMode}` : ''}`} onClick={() => setMode('sms')}>
                  <Text className={mode === 'sms' ? `primary-text-${resolvedMode}` : `secondary-text-${resolvedMode}`}>短信验证码</Text>
                </View>
              </View>

              {mode === 'password' ? (
                <View>
                  <View className='field'>
                    <Text className={`field-label field-label-${resolvedMode}`}>用户名</Text>
                    <Input className={`input input-${resolvedMode}`} value={username} placeholder='请输入用户名' onInput={(event) => setUsername(event.detail.value)} />
                  </View>
                  <View className='field'>
                    <Text className={`field-label field-label-${resolvedMode}`}>密码</Text>
                    <Input className={`input input-${resolvedMode}`} password value={password} placeholder='请输入密码' onInput={(event) => setPassword(event.detail.value)} />
                  </View>
                  {captcha?.captchaEnabled ? (
                    <View className='field'>
                      <Text className={`field-label field-label-${resolvedMode}`}>图形验证码</Text>
                      <View className='captcha-row'>
                        <Input className={`input input-${resolvedMode} captcha-input`} value={captchaCode} placeholder='请输入验证码' onInput={(event) => setCaptchaCode(event.detail.value)} />
                        {captcha.img ? <Image className={`captcha-image captcha-image-${resolvedMode}`} src={captcha.img} mode='scaleToFill' onClick={loadCaptcha} /> : null}
                      </View>
                    </View>
                  ) : null}
                  <Text className={`helper-text helper-text-${resolvedMode}`}>开发环境应用用户示例：client / admin123。</Text>
                </View>
              ) : (
                <View>
                  <View className='field'>
                    <Text className={`field-label field-label-${resolvedMode}`}>手机号</Text>
                    <Input className={`input input-${resolvedMode}`} type='number' maxlength={11} value={phoneNumber} placeholder='请输入手机号' onInput={(event) => setPhoneNumber(event.detail.value)} />
                  </View>
                  <View className='field'>
                    <Text className={`field-label field-label-${resolvedMode}`}>短信验证码</Text>
                    <View className='sms-row'>
                      <Input className={`input input-${resolvedMode} sms-input`} type='number' maxlength={6} value={smsCode} placeholder='请输入验证码' onInput={(event) => setSmsCode(event.detail.value)} />
                      <Button className={`sms-button secondary-button-${resolvedMode}`} disabled={countdown > 0} onClick={handleSendSms}>
                        {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                      </Button>
                    </View>
                  </View>
                </View>
              )}

              <Button className={`action-button primary-button primary-button-${resolvedMode}`} type='primary' loading={loading} disabled={loading} onClick={handleLogin}>登录</Button>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}
