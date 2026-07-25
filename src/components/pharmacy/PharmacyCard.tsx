import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { Pharmacy } from '@/types'
import { pharmacyStatusLabels } from '@/data/pharmacies'

type PharmacyCardProps = {
  pharmacy: Pharmacy
  variant?: 'verification' | 'table'
}

export function PharmacyCard({ pharmacy, variant = 'verification' }: PharmacyCardProps) {
  const isPending = pharmacy.status === 'pending' || pharmacy.status === 'under_review'

  if (variant === 'table') {
    return (
      <tr className="border-b border-outline-variant/20 transition-colors hover:bg-surface-container-low/50">
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${pharmacy.iconClassName}`}
            >
              <MaterialIcon icon={pharmacy.icon} />
            </div>
            <div>
              <p className="font-label-md text-on-surface">{pharmacy.name}</p>
              <p className="text-label-sm text-secondary">{pharmacy.location}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-4 font-label-md">{pharmacy.licenseNumber}</td>
        <td className="px-4 py-4 font-label-md">{pharmacy.inventoryCount}</td>
        <td className="px-4 py-4 font-label-md">{pharmacy.reservationsToday}</td>
        <td className="px-4 py-4">
          <StatusBadge
            status={pharmacy.status}
            label={pharmacyStatusLabels[pharmacy.status]}
            pulse={isPending}
          />
        </td>
        <td className="px-4 py-4">
          <div className="flex gap-2">
            {isPending && (
              <>
                <button
                  type="button"
                  className="rounded-lg bg-primary px-3 py-1.5 text-label-sm text-on-primary"
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-error px-3 py-1.5 text-label-sm text-error"
                >
                  Reject
                </button>
              </>
            )}
            {pharmacy.status === 'verified' && (
              <button
                type="button"
                className="rounded-lg border border-outline-variant px-3 py-1.5 text-label-sm text-secondary"
              >
                Suspend
              </button>
            )}
            {(pharmacy.status === 'suspended' || pharmacy.status === 'deactivated') && (
              <button
                type="button"
                className="rounded-lg bg-primary px-3 py-1.5 text-label-sm text-on-primary"
              >
                Reactivate
              </button>
            )}
            <button type="button" className="rounded-lg p-1.5 text-secondary hover:text-primary">
              <MaterialIcon icon="visibility" className="text-lg" />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="glass-card group relative overflow-hidden rounded-[1.5rem] border border-outline-variant p-5 shadow-[0px_4px_20px_rgba(22,163,74,0.05)]">
      <div className="tilet-accent absolute left-0 top-0 h-1 w-full opacity-40" />

      <div className="mb-4 flex items-start justify-between">
        <div className="flex gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${pharmacy.iconClassName}`}
          >
            <MaterialIcon icon={pharmacy.icon} className="text-2xl" />
          </div>
          <div>
            <h3 className="font-title-md text-title-md leading-tight text-on-surface">
              {pharmacy.name}
            </h3>
            <p className="flex items-center gap-1 font-body-md text-on-surface-variant">
              <MaterialIcon icon="location_on" className="text-xs" />
              {pharmacy.location}
            </p>
          </div>
        </div>
        <StatusBadge
          status={pharmacy.status}
          label={pharmacyStatusLabels[pharmacy.status]}
          pulse={pharmacy.status === 'pending'}
        />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4 rounded-xl bg-surface-container-low p-3">
        <div>
          <p className="font-label-sm text-outline">Application Date</p>
          <p className="font-label-md text-on-surface">{pharmacy.applicationDate}</p>
        </div>
        <div>
          <p className="font-label-sm text-outline">License Number</p>
          <p className="font-label-md text-on-surface">{pharmacy.licenseNumber}</p>
        </div>
      </div>

      {isPending && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 font-label-md text-on-primary transition-transform active:scale-[0.98]"
            >
              <MaterialIcon icon="check_circle" className="text-lg" />
              Approve
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-error py-3 font-label-md text-error transition-transform active:scale-[0.98]"
            >
              <MaterialIcon icon="cancel" className="text-lg" />
              Reject
            </button>
          </div>
          <div className="flex items-center justify-between border-t border-outline-variant px-1 pt-3">
            <button
              type="button"
              className="flex items-center gap-1 font-label-md text-primary hover:underline"
            >
              <MaterialIcon icon="description" className="text-sm" />
              View License
            </button>
            <div className="flex gap-4">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"
              >
                <MaterialIcon icon="chat" className="text-xl" />
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"
              >
                <MaterialIcon icon="call" className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
