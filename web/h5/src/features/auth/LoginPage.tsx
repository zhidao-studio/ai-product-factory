import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Form, Image, Input, Toast } from 'antd-mobile'
import { Navigate } from 'react-router-dom'
import { getCodeImg, type VerifyCodeResult } from '@/api/auth'
import { MobileLayout } from '@/layouts/MobileLayout'
import { useSession } from '@/stores/useSession'

export function LoginPage() {
  const { status, signIn } = useSession()
  const [captcha, setCaptcha] = useState<VerifyCodeResult>()
  const [submitting, setSubmitting] = useState(false)

  const loadCaptcha = useCallback(async () => {
    try {
      const response = await getCodeImg()
      setCaptcha(response.data)
    } catch {
      setCaptcha(undefined)
    }
  }, [])

  useEffect(() => {
    void loadCaptcha()
  }, [loadCaptcha])

  if (status === 'authenticated') return <Navigate to="/home" replace />

  return (
    <MobileLayout title="RuoYi H5">
      <Card title="登录">
        <Form
          layout="horizontal"
          initialValues={{ username: 'client', password: 'admin123' }}
          footer={(
            <Button block color="primary" type="submit" loading={submitting}>
              登录
            </Button>
          )}
          onFinish={async values => {
            setSubmitting(true)
            try {
              await signIn({
                username: String(values.username || ''),
                password: String(values.password || ''),
                code: String(values.code || ''),
                uuid: captcha?.uuid,
              })
              Toast.show({ content: '登录成功', position: 'top' })
            } catch {
              await loadCaptcha()
            } finally {
              setSubmitting(false)
            }
          }}
        >
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" clearable />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
            <Input placeholder="请输入密码" type="password" clearable />
          </Form.Item>
          {captcha?.captchaEnabled ? (
            <Form.Item name="code" label="验证码" rules={[{ required: true, message: '请输入验证码' }]}>
              <Input placeholder="请输入验证码" clearable />
              {captcha.img ? (
                <Image src={captcha.img} width={100} height={40} fit="contain" onClick={() => void loadCaptcha()} />
              ) : null}
            </Form.Item>
          ) : null}
        </Form>
      </Card>
    </MobileLayout>
  )
}
