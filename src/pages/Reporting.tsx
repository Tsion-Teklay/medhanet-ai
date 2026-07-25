import { PageShell } from '@/components/layout/PageShell'
import { StatPill } from '@/components/ui/StatPill'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ChartCard } from '@/components/charts/ChartCard'
import { SimpleBarChart } from '@/components/charts/SimpleBarChart'
import { SimpleLineChart } from '@/components/charts/SimpleLineChart'
import { SimpleDonutChart } from '@/components/charts/SimpleDonutChart'
import { reportStats } from '@/data/reports'
import {
  weeklyReportTrend,
  reportsByCategory,
  reportsByStatus,
  reportsByRegion,
  recentReports,
} from '@/data/reportCharts'

export function Reporting() {
  useDocumentTitle('Reporting | MedhaNet AI Admin')

  return (
    <PageShell title="Reporting" icon="assessment">
      <div className="space-y-gutter">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatPill label="Open Reports" value={reportStats.open} variant="warning" />
          <StatPill label="Investigating" value={reportStats.investigating} variant="primary" />
          <StatPill label="Resolved This Week" value={reportStats.resolvedThisWeek} />
          <StatPill label="Suspicious Activity" value={reportStats.suspiciousActivity} variant="error" />
        </div>

        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
          <ChartCard title="Weekly Trend" subtitle="New reports vs resolved — last 7 days">
            <SimpleLineChart data={weeklyReportTrend} />
          </ChartCard>

          <ChartCard title="Report Status" subtitle="Current breakdown of all platform reports">
            <SimpleDonutChart data={reportsByStatus} />
          </ChartCard>

          <ChartCard title="Reports by Category" subtitle="Issue types across the network">
            <SimpleBarChart data={reportsByCategory} color="#00873a" />
          </ChartCard>

          <ChartCard title="Reports by Region" subtitle="Geographic distribution of reported issues">
            <SimpleBarChart data={reportsByRegion} color="#4e5e68" />
          </ChartCard>
        </div>

        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0px_4px_20px_rgba(22,163,74,0.05)]">
          <div className="flex items-center justify-between border-b border-outline-variant/20 p-6">
            <div>
              <h3 className="font-title-md text-title-md text-on-surface">Recent Reports</h3>
              <p className="text-label-sm text-secondary">Latest issues submitted to the platform</p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-outline-variant px-4 py-2 font-label-md text-secondary transition-colors hover:bg-surface-container-low"
            >
              <MaterialIcon icon="download" className="text-lg" />
              Export
            </button>
          </div>
          <div className="divide-y divide-outline-variant/20">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-surface-container-low/50"
              >
                <div>
                  <p className="font-label-md text-on-surface">{report.title}</p>
                  <p className="text-label-sm text-secondary">
                    {report.id} · {report.date}
                  </p>
                </div>
                <StatusBadge status={report.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
