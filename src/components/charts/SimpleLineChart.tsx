type LineChartProps = {
  data: { label: string; reports: number; resolved: number }[]
  height?: number
}

export function SimpleLineChart({ data, height = 200 }: LineChartProps) {
  const width = 100
  const padding = 8
  const chartHeight = height - 40
  const max = Math.max(...data.flatMap((d) => [d.reports, d.resolved]), 1)

  const toPoints = (key: 'reports' | 'resolved') =>
    data
      .map((d, i) => {
        const x = padding + (i / (data.length - 1)) * (width - padding * 2)
        const y = chartHeight - (d[key] / max) * (chartHeight - padding) + padding
        return `${x},${y}`
      })
      .join(' ')

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" preserveAspectRatio="none">
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <line
            key={tick}
            x1={padding}
            y1={padding + tick * (chartHeight - padding)}
            x2={width - padding}
            y2={padding + tick * (chartHeight - padding)}
            stroke="#bdcaba"
            strokeWidth="0.3"
            strokeDasharray="1,1"
          />
        ))}
        <polyline
          fill="none"
          stroke="#006b2c"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={toPoints('reports')}
        />
        <polyline
          fill="none"
          stroke="#7ffc97"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={toPoints('resolved')}
        />
        {data.map((d, i) => {
          const x = padding + (i / (data.length - 1)) * (width - padding * 2)
          const y = chartHeight - (d.reports / max) * (chartHeight - padding) + padding
          return <circle key={d.label} cx={x} cy={y} r="1.5" fill="#006b2c" />
        })}
      </svg>
      <div className="mt-2 flex justify-between px-1">
        {data.map((d) => (
          <span key={d.label} className="text-label-sm text-secondary">
            {d.label}
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-4">
        <span className="flex items-center gap-1.5 text-label-sm text-secondary">
          <span className="h-2 w-4 rounded-full bg-primary" /> New Reports
        </span>
        <span className="flex items-center gap-1.5 text-label-sm text-secondary">
          <span className="h-2 w-4 rounded-full bg-primary-fixed" /> Resolved
        </span>
      </div>
    </div>
  )
}
