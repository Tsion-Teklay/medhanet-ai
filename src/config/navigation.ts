export type NavItem = {
  to: string
  icon: string
  label: string
  end?: boolean
}

export const navItems: NavItem[] = [
  { to: '/', icon: 'dashboard', label: 'Dashboard', end: true },
  { to: '/users', icon: 'group', label: 'User Management' },
  { to: '/pharmacies', icon: 'local_pharmacy', label: 'Pharmacy Partners' },
  { to: '/medicines', icon: 'medication', label: 'Medicine Inventory' },
  { to: '/reports', icon: 'assessment', label: 'Reporting' },
  { to: '/logs', icon: 'settings_heart', label: 'System Logs' },
]
