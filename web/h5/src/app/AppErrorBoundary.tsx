import { Button, ErrorBlock } from 'antd-mobile'
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State {
  hasError: boolean
}

export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('H5 application error', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <ErrorBlock
        status="default"
        title="页面暂时不可用"
        description="请刷新页面后重试"
      >
        <Button color="primary" onClick={() => window.location.reload()}>
          刷新页面
        </Button>
      </ErrorBlock>
    )
  }
}
