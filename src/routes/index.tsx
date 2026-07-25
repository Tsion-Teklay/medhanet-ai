import { createBrowserRouter } from 'react-router-dom'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Dashboard } from '@/pages/Dashboard'
import { UserManagement } from '@/pages/UserManagement'
import { PharmacyPartners } from '@/pages/PharmacyPartners'
import { MedicineInventory } from '@/pages/MedicineInventory'
import { SystemLogs } from '@/pages/SystemLogs'
import { Reporting } from '@/pages/Reporting'
import { NotFound } from '@/pages/NotFound'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'users', element: <UserManagement /> },
      { path: 'pharmacies', element: <PharmacyPartners /> },
      { path: 'medicines', element: <MedicineInventory /> },
      { path: 'reports', element: <Reporting /> },
      { path: 'logs', element: <SystemLogs /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
