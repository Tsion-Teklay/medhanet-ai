import type { ReactNode } from 'react'
import { MaterialIcon } from '@/components/ui/MaterialIcon'

type StatCardProps = {
  icon: string
  iconClassName: string
  label: string
  value: string
  badge?: ReactNode
  subtitle?: string
  footer?: ReactNode
}

export function StatCard({
  icon,
  iconClassName,
  label,
  value,
  badge,
  subtitle,
  footer,
}: StatCardProps) {
  return (
    <div className="card-soft-shadow ethiopian-border relative overflow-hidden rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6">
      <div className="mb-4 flex items-start justify-between">
        <span className={`rounded-xl p-2 ${iconClassName}`}>
          <MaterialIcon icon={icon} />
        </span>
        {badge}
      </div>
      <p className="font-label-md text-label-md text-secondary">{label}</p>
      <h3 className="font-display-lg mt-1 text-headline-lg text-on-surface">{value}</h3>
      {subtitle && <p className="mt-2 text-label-sm text-secondary-fixed-dim">{subtitle}</p>}
      {footer}
    </div>
  )
}
