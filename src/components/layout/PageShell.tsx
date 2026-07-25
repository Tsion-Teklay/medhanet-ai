import type { ReactNode } from 'react'
import { TopAppBar } from '@/components/layout/TopAppBar'
import { Footer } from '@/components/layout/Footer'

type PageShellProps = {
  title: string
  icon?: string
  children: ReactNode
}

export function PageShell({ title, icon, children }: PageShellProps) {
  return (
    <>
      <TopAppBar title={title} icon={icon} />
      <div className="mx-auto w-full max-w-container-max flex-1 p-margin-desktop">{children}</div>
      <Footer />
    </>
  )
}
