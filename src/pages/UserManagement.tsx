import { useState } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { StatPill } from '@/components/ui/StatPill'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { users, userStats } from '@/data/users'
import type { UserStatus } from '@/types'

type UserFilter = 'all' | UserStatus

const userFilterTabs: { id: UserFilter; icon: string; label: string }[] = [
  { id: 'all', icon: 'group', label: 'All Users' },
  { id: 'active', icon: 'check_circle', label: 'Active' },
  { id: 'reported', icon: 'report', label: 'Reported' },
  { id: 'suspended', icon: 'block', label: 'Suspended' },
  { id: 'inactive', icon: 'person_off', label: 'Inactive' },
]

export function UserManagement() {
  useDocumentTitle('User Management | MedhaNet AI Admin')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<UserFilter>('all')

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.region.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || u.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <PageShell title="User Management" icon="group">
      <div className="space-y-gutter">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatPill label="Total Users" value={`${(userStats.total / 1000).toFixed(1)}k`} />
          <StatPill label="Active" value={`${(userStats.active / 1000).toFixed(1)}k`} variant="primary" />
          <StatPill label="Reported Issues" value={userStats.reported} variant="warning" />
          <StatPill label="Suspended" value={userStats.suspended} variant="error" />
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email, or region..."
        />
        <FilterTabs tabs={userFilterTabs} active={filter} onChange={setFilter} />

        <SectionHeader
          eyebrow="Registered Patients"
          title={`Users (${filtered.length})`}
          subtitle="Monitor registered users, reservations, and reported issues"
        />

        <div className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0px_4px_20px_rgba(22,163,74,0.05)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                  <th className="px-4 py-3 font-label-md text-secondary">User</th>
                  <th className="px-4 py-3 font-label-md text-secondary">Contact</th>
                  <th className="px-4 py-3 font-label-md text-secondary">Region</th>
                  <th className="px-4 py-3 font-label-md text-secondary">Reservations</th>
                  <th className="px-4 py-3 font-label-md text-secondary">AI Queries</th>
                  <th className="px-4 py-3 font-label-md text-secondary">Status</th>
                  <th className="px-4 py-3 font-label-md text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-outline-variant/20 transition-colors hover:bg-surface-container-low/50"
                  >
                    <td className="px-4 py-4">
                      <p className="font-label-md text-on-surface">{user.name}</p>
                      <p className="text-label-sm text-secondary">{user.id}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-label-md">{user.email}</p>
                      <p className="text-label-sm text-secondary">{user.phone}</p>
                    </td>
                    <td className="px-4 py-4 font-label-md">{user.region}</td>
                    <td className="px-4 py-4 font-label-md">{user.reservations}</td>
                    <td className="px-4 py-4 font-label-md">{user.aiQueries}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-secondary hover:text-primary"
                          title="View profile"
                        >
                          <MaterialIcon icon="visibility" className="text-lg" />
                        </button>
                        {user.status === 'active' && (
                          <button
                            type="button"
                            className="rounded-lg border border-error px-2 py-1 text-label-sm text-error"
                          >
                            Suspend
                          </button>
                        )}
                        {user.status === 'suspended' && (
                          <button
                            type="button"
                            className="rounded-lg bg-primary px-2 py-1 text-label-sm text-on-primary"
                          >
                            Reinstate
                          </button>
                        )}
                        {user.status === 'reported' && (
                          <button
                            type="button"
                            className="rounded-lg bg-primary px-2 py-1 text-label-sm text-on-primary"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
