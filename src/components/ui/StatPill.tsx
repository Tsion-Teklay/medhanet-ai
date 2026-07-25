type StatPillProps = {
  label: string
  value: string | number
  icon?: string
  variant?: 'default' | 'primary' | 'warning' | 'error'
}

const variants = {
  default: 'bg-surface-container-lowest border-outline-variant/30 text-on-surface',
  primary: 'bg-primary-container text-on-primary-container border-primary-container',
  warning: 'bg-[#FEF3C7] text-[#92400E] border-[#FEF3C7]',
  error: 'bg-error-container text-on-error-container border-error-container',
}

export function StatPill({ label, value, variant = 'default' }: StatPillProps) {
  return (
    <div className={`rounded-2xl border p-4 ${variants[variant]}`}>
      <p className="font-label-sm opacity-80">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
