const statusStyles: Record<string, string> = {
  active: 'bg-primary-container/10 text-primary',
  verified: 'bg-primary-container/10 text-primary',
  pending: 'bg-[#FEF3C7] text-[#92400E]',
  under_review: 'bg-[#FEF3C7] text-[#92400E]',
  suspended: 'bg-error-container text-on-error-container',
  deactivated: 'bg-secondary-container text-secondary',
  reported: 'bg-[#FEF3C7] text-[#92400E]',
  inactive: 'bg-secondary-container text-secondary',
  rising: 'bg-primary-container/10 text-primary',
  stable: 'bg-surface-container-high text-on-surface-variant',
  falling: 'bg-error-container/20 text-error',
  info: 'bg-surface-container-high text-on-surface-variant',
  warning: 'bg-[#FEF3C7] text-[#92400E]',
  error: 'bg-error-container text-on-error-container',
  critical: 'bg-error text-on-error',
  open: 'bg-[#FEF3C7] text-[#92400E]',
  investigating: 'bg-primary-container/10 text-primary',
  resolved: 'bg-primary-container/10 text-primary',
  dismissed: 'bg-secondary-container text-secondary',
  low: 'bg-surface-container-high text-on-surface-variant',
  medium: 'bg-[#FEF3C7] text-[#92400E]',
  high: 'bg-error-container/20 text-error',
}

type StatusBadgeProps = {
  status: string
  label?: string
  pulse?: boolean
}

export function StatusBadge({ status, label, pulse }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-label-sm capitalize ${statusStyles[status] ?? 'bg-secondary-container text-secondary'}`}
    >
      {pulse && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D97706]" />}
      {label ?? status.replace(/_/g, ' ')}
    </span>
  )
}
