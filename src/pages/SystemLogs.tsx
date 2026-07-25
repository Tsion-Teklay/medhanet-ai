import { useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { StatPill } from '@/components/ui/StatPill'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { filterLogs, logFilterTabs, logStats, type LogFilterTab } from '@/data/logs'

const categoryIcons: Record<string, string> = {
  system: 'settings',
  pharmacy: 'local_pharmacy',
  user: 'group',
  security: 'security',
  report: 'report',
  ai: 'psychology',
}

export function SystemLogs() {
  useDocumentTitle('System Logs | MedhaNet AI Admin')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<LogFilterTab>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = filterLogs(filter, search)

  return (
    <PageShell title="System Logs" icon="settings_heart">
      <div className="space-y-gutter">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatPill label="Events Today" value={logStats.totalToday} />
          <StatPill label="Warnings" value={logStats.warnings} variant="warning" />
          <StatPill label="Errors" value={logStats.errors} variant="error" />
          <StatPill label="User Reports" value={logStats.reports} variant="primary" />
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search logs by message, source, or details..."
        />
        <FilterTabs tabs={logFilterTabs} active={filter} onChange={setFilter} />

        <SectionHeader
          eyebrow="Platform Activity"
          title={`System Events (${filtered.length})`}
          subtitle="Monitor system activity, security alerts, and reported issues across the network"
        />

        <div className="space-y-3">
          {filtered.map((log) => (
            <div
              key={log.id}
              className="card-soft-shadow overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest"
            >
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-surface-container-low/50"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    log.severity === 'critical' || log.severity === 'error'
                      ? 'bg-error-container/20 text-error'
                      : log.severity === 'warning'
                        ? 'bg-[#FEF3C7] text-[#92400E]'
                        : 'bg-primary-container/10 text-primary'
                  }`}
                >
                  <MaterialIcon icon={categoryIcons[log.category] ?? 'info'} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-label-md font-semibold text-on-surface">{log.message}</p>
                    <StatusBadge status={log.severity} />
                    <StatusBadge status={log.category} label={log.category} />
                  </div>
                  <p className="mt-1 text-label-sm text-secondary">
                    {log.source} · {log.timestamp}
                  </p>
                </div>
                <MaterialIcon
                  icon={expandedId === log.id ? 'expand_less' : 'expand_more'}
                  className="shrink-0 text-secondary"
                />
              </button>
              {expandedId === log.id && log.details && (
                <div className="border-t border-outline-variant/20 bg-surface-container-low px-5 py-4">
                  <p className="font-label-sm text-outline">Details</p>
                  <p className="mt-1 font-body-md text-on-surface-variant">{log.details}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      className="rounded-lg bg-primary px-3 py-1.5 text-label-sm text-on-primary"
                    >
                      Investigate
                    </button>
                    {log.category === 'report' && (
                      <button
                        type="button"
                        className="rounded-lg border border-outline-variant px-3 py-1.5 text-label-sm text-secondary"
                      >
                        Resolve Report
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
