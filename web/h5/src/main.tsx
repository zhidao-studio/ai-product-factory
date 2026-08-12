import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { unstableSetRender } from 'antd-mobile'
import './index.css'
import './theme/variables.css'
import { ThemeProvider } from './theme/ThemeProvider'
import App from './App.tsx'

// antd-mobile 的 Dialog/Toast 等命令式组件需要显式接入 React 19 createRoot。
const imperativeRoots = new WeakMap<Element | DocumentFragment, Root>()
unstableSetRender((node, container) => {
  let root = imperativeRoots.get(container)
  if (!root) {
    root = createRoot(container)
    imperativeRoots.set(container, root)
  }
  root.render(node)
  return async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 0))
    root.unmount()
    imperativeRoots.delete(container)
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
