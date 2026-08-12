import { useEffect, useState } from 'react'
import { NavBar, Card, Button, Input, Toast, Divider } from 'antd-mobile'
import { getCodeImg, login, logout, getInfo, type VerifyCodeResult, type UserInfo } from '@/api/auth'
import { setToken, removeToken, getToken } from '@/utils/auth'
import { useThemeMode } from '@/theme/ThemeProvider'

function App() {
  const { resolvedMode, toggle } = useThemeMode()

  const [captcha, setCaptcha] = useState<VerifyCodeResult | null>(null)
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('123456')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)

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
    // 已登录则直接进入用户信息
    if (getToken()) {
      getInfo()
        .then((r) => setUser(r.data))
        .catch(() => removeToken())
    }
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    try {
      const res = await login({ username, password, code, uuid: captcha?.uuid })
      setToken(res.data.access_token)
      Toast.show({ content: '登录成功', position: 'top' })
      const info = await getInfo()
      setUser(info.data)
      await loadCaptcha()
      setCode('')
    } catch {
      // 请求层已提示，刷新验证码
      await loadCaptcha()
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // ignore
    }
    removeToken()
    setUser(null)
    Toast.show({ content: '已退出登录', position: 'top' })
  }

  return (
    <div>
      <NavBar backArrow={false}>RuoYi H5 移动端</NavBar>
      <div style={{ padding: 16 }}>
        <Card title="主题">
          <p>当前模式：{resolvedMode === 'dark' ? '深色' : '浅色'}</p>
          <Button block onClick={toggle}>
            切换 {resolvedMode === 'dark' ? '浅色' : '深色'} 模式
          </Button>
        </Card>

        <Divider />

        {user ? (
          <Card title="已登录（前后端数据对接成功）">
            <p>用户ID：{user.userId}</p>
            <p>用户名：{user.userName}</p>
            <p>昵称：{user.nickName}</p>
            <p>角色：{user.roles?.join('、') || '-'}</p>
            <Button block color="danger" onClick={handleLogout}>
              退出登录
            </Button>
          </Card>
        ) : (
          <Card title="登录（对接后端 /auth/login）">
            <Input
              placeholder="用户名"
              value={username}
              onChange={setUsername}
              style={{ marginBottom: 12 }}
            />
            <Input
              placeholder="密码"
              type="password"
              value={password}
              onChange={setPassword}
              style={{ marginBottom: 12 }}
            />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <Input placeholder="验证码" value={code} onChange={setCode} />
              {captcha?.captchaEnabled && captcha.img ? (
                <img
                  src={captcha.img}
                  alt="captcha"
                  style={{ width: 100, height: 40, border: '1px solid var(--color-border)' }}
                  onClick={loadCaptcha}
                />
              ) : null}
            </div>
            <Button block color="primary" loading={loading} onClick={handleLogin}>
              登录
            </Button>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 8 }}>
              默认账号 admin / 123456（以后端初始化数据为准）
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}

export default App
