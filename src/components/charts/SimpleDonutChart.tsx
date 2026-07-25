type DonutChartProps = {
  data: { label: string; value: number; color: string }[]
  size?: number
}

export function SimpleDonutChart({ data, size = 160 }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1
  const radius = 40
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
      <svg width={size} height={size} viewBox="0 0 100 100">
        {data.map((item) => {
          const segment = (item.value / total) * circumference
          const dashArray = `${segment} ${circumference - segment}`
          const dashOffset = -offset
          offset += segment
          return (
            <circle
              key={item.label}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth="12"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 50 50)"
            />
          )
        })}
        <text x="50" y="48" textAnchor="middle" className="fill-on-surface text-[10px] font-bold">
          {total}
        </text>
        <text x="50" y="58" textAnchor="middle" className="fill-secondary text-[6px]">
          Total
        </text>
      </svg>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="font-label-md text-on-surface">{item.label}</span>
            <span className="font-label-sm text-secondary">
              {item.value} ({Math.round((item.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
