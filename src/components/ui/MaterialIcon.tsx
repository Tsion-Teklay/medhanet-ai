type MaterialIconProps = {
  icon: string
  className?: string
  filled?: boolean
}

export function MaterialIcon({ icon, className = '', filled = false }: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined inline-block align-middle ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
    >
      {icon}
    </span>
  )
}
