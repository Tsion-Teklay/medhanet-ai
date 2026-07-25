import { useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { StatPill } from '@/components/ui/StatPill'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  filterMedicines,
  medicineFilterTabs,
  medicineStats,
  type MedicineFilterTab,
} from '@/data/medicines'

export function MedicineInventory() {
  useDocumentTitle('Medicine Inventory | MedhaNet AI Admin')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<MedicineFilterTab>('all')

  const filtered = filterMedicines(filter, search)

  return (
    <PageShell title="Medicine Inventory" icon="medication">
      <div className="space-y-gutter">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatPill label="Catalog Items" value={`${(medicineStats.totalCatalog / 1000).toFixed(1)}k`} />
          <StatPill label="Network Availability" value={`${medicineStats.avgNetworkAvailability}%`} variant="primary" />
          <StatPill label="Low Stock Alerts" value={medicineStats.lowStockAlerts} variant="warning" />
          <StatPill label="Out of Stock" value={medicineStats.outOfStock} variant="error" />
          <StatPill label="Fast Moving" value={medicineStats.fastMoving} />
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search medicines by name or category..."
        />
        <FilterTabs tabs={medicineFilterTabs} active={filter} onChange={setFilter} />

        <SectionHeader
          eyebrow="Network-Wide Inventory"
          title={`Medicines (${filtered.length})`}
          subtitle="Monitor medicine availability, demand trends, and stock levels across all pharmacies"
        />

        <div className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0px_4px_20px_rgba(22,163,74,0.05)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                  <th className="px-4 py-3 font-label-md text-secondary">Medicine</th>
                  <th className="px-4 py-3 font-label-md text-secondary">Category</th>
                  <th className="px-4 py-3 font-label-md text-secondary">Network Stock</th>
                  <th className="px-4 py-3 font-label-md text-secondary">Pharmacies</th>
                  <th className="px-4 py-3 font-label-md text-secondary">Avg Price</th>
                  <th className="px-4 py-3 font-label-md text-secondary">Demand</th>
                  <th className="px-4 py-3 font-label-md text-secondary">Low Stock</th>
                  <th className="px-4 py-3 font-label-md text-secondary">Weekly Reservations</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((med) => (
                  <tr
                    key={med.id}
                    className="border-b border-outline-variant/20 transition-colors hover:bg-surface-container-low/50"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container/10 text-primary">
                          <MaterialIcon icon="medication" />
                        </div>
                        <div>
                          <p className="font-label-md text-on-surface">{med.name}</p>
                          <p className="text-label-sm text-secondary">{med.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-label-md">{med.category}</td>
                    <td className="px-4 py-4 font-label-md">{med.totalStock.toLocaleString()}</td>
                    <td className="px-4 py-4 font-label-md">{med.pharmacyCount}</td>
                    <td className="px-4 py-4 font-label-md">
                      {med.avgPrice} {med.currency}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={med.demand} />
                    </td>
                    <td className="px-4 py-4">
                      {med.lowStockPharmacies > 10 ? (
                        <span className="flex items-center gap-1 font-label-md text-error">
                          <MaterialIcon icon="warning" className="text-sm" />
                          {med.lowStockPharmacies}
                        </span>
                      ) : (
                        <span className="font-label-md">{med.lowStockPharmacies}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 font-label-md">{med.reservationsWeek}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <section className="rounded-[2rem] bg-primary p-8 text-on-primary-container">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h3 className="font-title-md text-title-md font-bold text-white">AI Demand Predictions</h3>
              <p className="mt-2 max-w-xl font-body-md text-on-primary-container/90">
                Antimalarials and antibiotics show rising demand across Addis Ababa and regional
                hubs. AI recommends restocking Artemether/Lumefantrine at 22 partner pharmacies
                within 48 hours.
              </p>
            </div>
            <button
              type="button"
              className="whitespace-nowrap rounded-xl bg-white px-6 py-3 font-label-md font-semibold text-primary"
            >
              View Full Report
            </button>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
