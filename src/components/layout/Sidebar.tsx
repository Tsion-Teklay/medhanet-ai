import { NavLink } from 'react-router-dom'
import { navItems } from '@/config/navigation'
import { MaterialIcon } from '@/components/ui/MaterialIcon'

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col space-y-unit border-r border-outline-variant bg-surface-container-low py-gutter transition-transform duration-300 ease-in-out">
      <div className="px-6 pb-8">
        <div className="mb-8 flex items-center gap-3">
          <MaterialIcon icon="settings_heart" className="text-4xl text-primary" />
          <div>
            <h1 className="font-title-md text-title-md font-black tracking-tight text-primary">
              MedhaNet AI
            </h1>
            <p className="text-label-sm text-secondary">Admin Console v2.4</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map(({ to, icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'flex items-center gap-4 rounded-r-full px-4 py-3 transition-colors',
                  isActive
                    ? 'bg-primary-container font-semibold text-on-primary-container'
                    : 'text-on-surface-variant hover:bg-secondary-container/50',
                ].join(' ')
              }
            >
              <MaterialIcon icon={icon} />
              <span className="font-label-md text-label-md">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t border-outline-variant/30 px-6 pt-4">
        <div className="flex items-center gap-3 rounded-xl bg-surface p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container font-bold text-on-primary-container">
            SA
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface">System Admin</p>
            <p className="text-label-sm text-secondary">Active Session</p>
          </div>
        </div>
        <div className="tilet-pattern mt-4 h-1 w-full rounded-full" />
      </div>
    </aside>
  )
}
