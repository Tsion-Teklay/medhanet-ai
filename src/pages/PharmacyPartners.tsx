import { useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { StatPill } from '@/components/ui/StatPill'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { PharmacyCard } from '@/components/pharmacy/PharmacyCard'
import { QuickStats } from '@/components/pharmacy/QuickStats'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { platformStats } from '@/data/platformStats'
import {
  filterPharmacies,
  pharmacyFilterTabs,
  type PharmacyFilterTab,
} from '@/data/pharmacies'

export function PharmacyPartners() {
  useDocumentTitle('Pharmacy Partners | MedhaNet AI Admin')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<PharmacyFilterTab>('pending')

  const filtered = filterPharmacies(filter, search)
  const showCards = filter === 'pending'

  return (
    <PageShell title="Pharmacy Partners" icon="local_pharmacy">
      <div className="space-y-gutter">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatPill label="Verified" value={platformStats.verifiedPharmacies} variant="primary" />
          <StatPill label="Pending Review" value={platformStats.pendingPharmacies} variant="warning" />
          <StatPill label="Active Network" value={platformStats.activePharmacies} />
          <StatPill label="Suspended" value={platformStats.suspendedPharmacies} variant="error" />
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, license, or location..."
        />
        <FilterTabs tabs={pharmacyFilterTabs} active={filter} onChange={setFilter} />

        <SectionHeader
          eyebrow="Partner Network"
          title={
            filter === 'pending'
              ? `Pending Pharmacies (${platformStats.pendingPharmacies})`
              : `Pharmacies (${filtered.length})`
          }
          subtitle="Review registrations, verify licenses, and manage pharmacy accounts"
          action={<span className="font-label-sm text-outline">Sorted by newest</span>}
        />

        {showCards ? (
          <div className="space-y-4">
            {filtered.map((pharmacy) => (
              <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} variant="verification" />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0px_4px_20px_rgba(22,163,74,0.05)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                    <th className="px-4 py-3 font-label-md text-secondary">Pharmacy</th>
                    <th className="px-4 py-3 font-label-md text-secondary">License</th>
                    <th className="px-4 py-3 font-label-md text-secondary">Inventory</th>
                    <th className="px-4 py-3 font-label-md text-secondary">Reservations Today</th>
                    <th className="px-4 py-3 font-label-md text-secondary">Status</th>
                    <th className="px-4 py-3 font-label-md text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((pharmacy) => (
                    <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} variant="table" />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-12 text-center">
            <MaterialIcon icon="local_pharmacy" className="mx-auto mb-3 text-4xl text-secondary" />
            <p className="font-title-md text-on-surface">No pharmacies found</p>
            <p className="text-label-sm text-secondary">Try adjusting your search or filters</p>
          </div>
        )}

        {filter === 'pending' && <QuickStats />}
      </div>
    </PageShell>
  )
}
