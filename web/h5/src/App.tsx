import { useEffect, useState } from 'react'
import { NavBar, Card, Button, Input, Toast, Divider, Dialog } from 'antd-mobile'
import { getCodeImg, login, logout, getInfo, type VerifyCodeResult, type UserInfo } from '@/api/auth'
import { setToken, removeToken, getToken } from '@/utils/auth'
import { useThemeMode } from '@/theme/ThemeProvider'
import './App.css'

function App() {
  const { resolvedMode, toggle } = useThemeMode()

  const [captcha, setCaptcha] = useState<VerifyCodeResult | null>(null)
  const [username, setUsername] = useState('client')
  const [password, setPassword] = useState('admin123')
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
    if (!username.trim() || !password) {
      Toast.show({ content: '请填写用户名和密码', position: 'top' })
      return
    }
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
    const confirmed = await new Promise<boolean>((resolve) => {
      Dialog.show({
        title: '退出登录',
        content: '确定退出当前产品用户账号吗？',
        closeOnAction: true,
        actions: [[
          { key: 'cancel', text: '取消', onClick: () => resolve(false) },
          { key: 'confirm', text: '退出', danger: true, bold: true, onClick: () => resolve(true) },
        ]],
      })
    })
    if (!confirmed) return
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
    <div className="app-shell">
      <NavBar backArrow={false} className="app-nav">产品 H5 端</NavBar>
      <main className="page-content">
        <Card title="外观" className="theme-card">
          <p className="theme-status">当前模式：{resolvedMode === 'dark' ? '深色' : '浅色'}</p>
          <Button block onClick={toggle}>
            切换 {resolvedMode === 'dark' ? '浅色' : '深色'} 模式
          </Button>
        </Card>

        <Divider />

        {user ? (
          <Card title="当前产品用户">
            <dl className="user-list">
              <div className="user-row"><dt>用户 ID</dt><dd>{user.userId}</dd></div>
              <div className="user-row"><dt>用户名</dt><dd>{user.userName}</dd></div>
              <div className="user-row"><dt>昵称</dt><dd>{user.nickName}</dd></div>
              <div className="user-row"><dt>设备类型</dt><dd>{user.deviceType}</dd></div>
              <div className="user-row"><dt>角色</dt><dd>{user.roles?.join('、') || '-'}</dd></div>
            </dl>
            <Button block color="danger" onClick={handleLogout}>
              退出登录
            </Button>
          </Card>
        ) : (
          <Card title="产品用户登录" className="login-card">
            <div className="field">
              <label className="field-label" htmlFor="username">用户名</label>
              <Input id="username" placeholder="请输入用户名" value={username} onChange={setUsername} clearable />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="password">密码</label>
              <Input id="password" placeholder="请输入密码" type="password" value={password} onChange={setPassword} clearable />
            </div>
            {captcha?.captchaEnabled ? <div className="field">
              <label className="field-label" htmlFor="captcha">图形验证码</label>
              <div className="captcha-row">
                <Input id="captcha" placeholder="请输入验证码" value={code} onChange={setCode} clearable />
              {captcha?.captchaEnabled && captcha.img ? (
                <img
                  src={captcha.img}
                  alt="点击刷新图形验证码"
                  className="captcha-image"
                  onClick={loadCaptcha}
                />
              ) : null}
              </div>
            </div> : null}
            <Button block color="primary" loading={loading} onClick={handleLogin}>
              登录
            </Button>
            <p className="helper-text">开发环境产品用户示例：client / admin123。</p>
          </Card>
        )}
      </main>
    </div>
  )
}

export default App
