import type { ReactNode } from 'react'

type SectionHeaderProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: ReactNode
}

export function SectionHeader({ eyebrow, title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        {eyebrow && (
          <p className="font-label-sm uppercase tracking-widest text-primary">{eyebrow}</p>
        )}
        <h2 className="font-title-md text-title-md text-on-surface">{title}</h2>
        {subtitle && <p className="mt-1 text-label-sm text-secondary">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
