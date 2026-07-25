import { useLocation } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { FloatingActionButton } from '@/components/layout/FloatingActionButton'

const fabConfig: Record<string, { label: string; hidden?: boolean }> = {
  '/': { label: 'Add New Partner' },
  '/users': { label: 'Export Users', hidden: true },
  '/pharmacies': { label: 'Add Pharmacy Manually' },
  '/medicines': { label: 'Add Medicine', hidden: true },
  '/reports': { label: 'Generate Report' },
  '/logs': { label: 'Export Logs', hidden: true },
}

export function AdminLayout() {
  const { pathname } = useLocation()
  const fab = fabConfig[pathname] ?? { label: 'Quick Action', hidden: true }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Sidebar />
      <main className="ml-72 flex min-h-screen flex-col">
        <Outlet />
      </main>
      {!fab.hidden && <FloatingActionButton label={fab.label} />}
    </div>
  )
}
