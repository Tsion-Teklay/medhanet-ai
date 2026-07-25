import { MaterialIcon } from '@/components/ui/MaterialIcon'

export function QuickStats() {
  return (
    <section className="pt-4">
      <h2 className="mb-4 font-title-md text-title-md text-on-surface">Quick Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex h-32 flex-col justify-between rounded-2xl bg-primary-container p-4 text-on-primary-container">
          <MaterialIcon icon="verified_user" filled className="text-3xl opacity-50" />
          <div>
            <p className="text-2xl font-bold">1,204</p>
            <p className="font-label-sm opacity-80">Total Verified</p>
          </div>
        </div>
        <div className="flex h-32 flex-col justify-between rounded-2xl bg-surface-container-high p-4">
          <MaterialIcon icon="speed" className="text-3xl text-primary" />
          <div>
            <p className="text-2xl font-bold text-on-surface">4.2h</p>
            <p className="font-label-sm text-on-surface-variant">Avg. Response</p>
          </div>
        </div>
      </div>
    </section>
  )
}
