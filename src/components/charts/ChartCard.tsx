import type { ReactNode } from 'react'

type ChartCardProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-[0px_4px_20px_rgba(22,163,74,0.05)]">
      <h3 className="font-title-md text-title-md text-on-surface">{title}</h3>
      {subtitle && <p className="mt-1 text-label-sm text-secondary">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  )
}
