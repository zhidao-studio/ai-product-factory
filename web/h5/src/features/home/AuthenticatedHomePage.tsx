import { Button, Card, Divider, Toast } from 'antd-mobile'
import { MobileLayout } from '@/layouts/MobileLayout'
import { useSession } from '@/stores/useSession'
import { useThemeMode } from '@/theme/useThemeMode'

export function AuthenticatedHomePage() {
  const { user, signOut } = useSession()
  const { resolvedMode, toggle } = useThemeMode()

  return (
    <MobileLayout title="RuoYi H5">
      <Card title="当前会话">
        <p>用户ID：{user?.userId}</p>
        <p>用户名：{user?.userName}</p>
        <p>昵称：{user?.nickName}</p>
        <p>渠道：{user?.channel}</p>
        <p>角色：{user?.roles.join('、') || '-'}</p>
      </Card>
      <Divider />
      <Card title="偏好设置">
        <p>当前模式：{resolvedMode === 'dark' ? '深色' : '浅色'}</p>
        <Button block onClick={toggle}>切换主题</Button>
      </Card>
      <Divider />
      <Button
        block
        color="danger"
        onClick={async () => {
          await signOut()
          Toast.show({ content: '已退出登录', position: 'top' })
        }}
      >
        退出登录
      </Button>
    </MobileLayout>
  )
}
