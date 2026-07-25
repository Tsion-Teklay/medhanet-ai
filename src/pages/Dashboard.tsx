import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { PageShell } from '@/components/layout/PageShell'
import { StatCard } from '@/components/dashboard/StatCard'
import { RegionalHotspots } from '@/components/dashboard/RegionalHotspots'
import { SystemEvents } from '@/components/dashboard/SystemEvents'
import { AIPrecisionCard } from '@/components/dashboard/AIPrecisionCard'
import { platformStats } from '@/data/platformStats'

export function Dashboard() {
  useDocumentTitle('MedhaNet AI Admin Console')

  return (
    <PageShell title="Admin Dashboard">
      <div className="space-y-gutter">
        <section className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-5">
          <StatCard
            icon="group"
            iconClassName="bg-primary-container/10 text-primary"
            label="Total Users"
            value={platformStats.totalUsers}
            badge={
              <span className="flex items-center rounded-full bg-primary-container/10 px-2 py-0.5 text-label-sm font-bold text-primary">
                <MaterialIcon icon="trending_up" className="mr-1 text-xs" />
                {platformStats.userGrowth}
              </span>
            }
          />

          <StatCard
            icon="local_pharmacy"
            iconClassName="bg-tertiary-fixed text-tertiary"
            label="Active Pharmacies"
            value={String(platformStats.activePharmacies)}
            badge={
              <span className="rounded-full bg-primary-container/10 px-2 py-0.5 text-label-sm font-bold text-primary">
                +{platformStats.pharmaciesToday} today
              </span>
            }
          />

          <StatCard
            icon="calendar_today"
            iconClassName="bg-surface-container-highest text-surface-tint"
            label="Reservations"
            value={platformStats.reservations}
            subtitle={`${platformStats.reservationsToday} today`}
          />

          <StatCard
            icon="medication"
            iconClassName="bg-secondary-container text-secondary"
            label="Catalog Items"
            value={platformStats.catalogItems}
          />

          <StatCard
            icon="psychology"
            iconClassName="bg-primary-container text-on-primary-container"
            label="AI Queries"
            value={platformStats.aiQueries}
            footer={
              <div className="mt-2 flex items-center gap-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                <span className="text-label-sm font-bold text-primary">
                  {platformStats.aiAccuracy}% Accuracy
                </span>
              </div>
            }
          />
        </section>

        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
          <RegionalHotspots />
          <SystemEvents />
        </div>

        <AIPrecisionCard />
      </div>
    </PageShell>
  )
}
