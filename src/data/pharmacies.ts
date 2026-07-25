import type { Pharmacy } from '@/types'

export const pharmacies: Pharmacy[] = [
  {
    id: 'PHA-001',
    name: 'Bole Medhanealem Pharmacy',
    location: 'Bole, Addis Ababa, ET',
    region: 'Addis Ababa',
    status: 'pending',
    applicationDate: 'Oct 24, 2024',
    licenseNumber: 'ET-PHA-2024-889',
    contactPhone: '+251 911 100 001',
    contactEmail: 'contact@bolemed.et',
    inventoryCount: 0,
    reservationsToday: 0,
    icon: 'local_pharmacy',
    iconClassName: 'bg-primary-container text-on-primary',
  },
  {
    id: 'PHA-002',
    name: 'Hidase Health Center',
    location: 'Kirkos, Addis Ababa, ET',
    region: 'Addis Ababa',
    status: 'under_review',
    applicationDate: 'Oct 22, 2024',
    licenseNumber: 'ET-PHA-2024-712',
    contactPhone: '+251 911 100 002',
    contactEmail: 'info@hidase.et',
    inventoryCount: 0,
    reservationsToday: 0,
    icon: 'medication',
    iconClassName: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
  {
    id: 'PHA-003',
    name: 'Bole Heights Pharmacy',
    location: 'Bole, Addis Ababa, ET',
    region: 'Addis Ababa',
    status: 'verified',
    applicationDate: 'Sep 10, 2024',
    licenseNumber: 'ET-PHA-2024-445',
    contactPhone: '+251 911 100 003',
    contactEmail: 'hello@boleheights.et',
    inventoryCount: 342,
    reservationsToday: 28,
    icon: 'local_pharmacy',
    iconClassName: 'bg-primary-container/10 text-primary',
  },
  {
    id: 'PHA-004',
    name: 'Arada Community Pharmacy',
    location: 'Arada, Addis Ababa, ET',
    region: 'Addis Ababa',
    status: 'verified',
    applicationDate: 'Aug 15, 2024',
    licenseNumber: 'ET-PHA-2024-301',
    contactPhone: '+251 911 100 004',
    contactEmail: 'support@aradapharm.et',
    inventoryCount: 218,
    reservationsToday: 19,
    icon: 'local_pharmacy',
    iconClassName: 'bg-primary-container/10 text-primary',
  },
  {
    id: 'PHA-005',
    name: 'Bahir Dar Central Pharmacy',
    location: 'Bahir Dar, ET',
    region: 'Amhara',
    status: 'verified',
    applicationDate: 'Jul 02, 2024',
    licenseNumber: 'ET-PHA-2024-198',
    contactPhone: '+251 911 100 005',
    contactEmail: 'info@bdcentral.et',
    inventoryCount: 156,
    reservationsToday: 12,
    icon: 'local_pharmacy',
    iconClassName: 'bg-primary-container/10 text-primary',
  },
  {
    id: 'PHA-006',
    name: 'Mercato Discount Drugs',
    location: 'Addis Ketema, Addis Ababa, ET',
    region: 'Addis Ababa',
    status: 'suspended',
    applicationDate: 'Jun 18, 2024',
    licenseNumber: 'ET-PHA-2024-087',
    contactPhone: '+251 911 100 006',
    contactEmail: 'admin@mercatodrugs.et',
    inventoryCount: 89,
    reservationsToday: 0,
    icon: 'block',
    iconClassName: 'bg-error-container/20 text-error',
  },
  {
    id: 'PHA-007',
    name: 'Hawassa Lakeside Pharmacy',
    location: 'Hawassa, ET',
    region: 'Sidama',
    status: 'verified',
    applicationDate: 'May 30, 2024',
    licenseNumber: 'ET-PHA-2024-056',
    contactPhone: '+251 911 100 007',
    contactEmail: 'contact@hawassalake.et',
    inventoryCount: 201,
    reservationsToday: 15,
    icon: 'local_pharmacy',
    iconClassName: 'bg-primary-container/10 text-primary',
  },
  {
    id: 'PHA-008',
    name: 'Piassa Night Pharmacy',
    location: 'Arada, Addis Ababa, ET',
    region: 'Addis Ababa',
    status: 'deactivated',
    applicationDate: 'Apr 12, 2024',
    licenseNumber: 'ET-PHA-2024-012',
    contactPhone: '+251 911 100 008',
    contactEmail: 'closed@piassanight.et',
    inventoryCount: 0,
    reservationsToday: 0,
    icon: 'cancel',
    iconClassName: 'bg-secondary-container text-secondary',
  },
]

export type PharmacyFilterTab = 'pending' | 'verified' | 'all' | 'suspended'

export const pharmacyFilterTabs: { id: PharmacyFilterTab; icon: string; label: string }[] = [
  { id: 'pending', icon: 'pending_actions', label: 'Pending Review' },
  { id: 'verified', icon: 'verified', label: 'Verified' },
  { id: 'all', icon: 'local_pharmacy', label: 'All Partners' },
  { id: 'suspended', icon: 'block', label: 'Suspended' },
]

export function filterPharmacies(tab: PharmacyFilterTab, search: string) {
  const query = search.toLowerCase()
  return pharmacies.filter((p) => {
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.licenseNumber.toLowerCase().includes(query) ||
      p.location.toLowerCase().includes(query)

    const matchesTab =
      tab === 'all'
        ? true
        : tab === 'pending'
          ? p.status === 'pending' || p.status === 'under_review'
          : tab === 'verified'
            ? p.status === 'verified'
            : p.status === 'suspended' || p.status === 'deactivated'

    return matchesSearch && matchesTab
  })
}

export const pharmacyStatusLabels: Record<Pharmacy['status'], string> = {
  pending: 'Pending Review',
  under_review: 'Under Review',
  verified: 'Verified',
  suspended: 'Suspended',
  deactivated: 'Deactivated',
}
