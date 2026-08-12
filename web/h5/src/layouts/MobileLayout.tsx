import { NavBar } from 'antd-mobile'
import type { ReactNode } from 'react'

export function MobileLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main>
      <NavBar backArrow={false}>{title}</NavBar>
      <section style={{ padding: 16 }}>{children}</section>
    </main>
  )
}
