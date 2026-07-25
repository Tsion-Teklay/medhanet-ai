type BarChartProps = {
  data: { label: string; value: number }[]
  color?: string
  height?: number
}

export function SimpleBarChart({ data, color = '#006b2c', height = 200 }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const barWidth = Math.min(48, 400 / data.length - 8)

  return (
    <div className="flex h-full items-end justify-center gap-2" style={{ minHeight: height }}>
      {data.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-2">
          <span className="font-label-sm font-semibold text-on-surface">{item.value}</span>
          <div
            className="rounded-t-lg transition-all"
            style={{
              width: barWidth,
              height: `${(item.value / max) * (height - 40)}px`,
              backgroundColor: color,
              minHeight: 4,
            }}
          />
          <span className="max-w-[56px] truncate text-center text-label-sm text-secondary">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}
