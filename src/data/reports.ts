import type { AnalyticsReport, PlatformReport } from '@/types'

export const reports: PlatformReport[] = [
  {
    id: 'RPT-001',
    title: 'Incorrect Amoxicillin pricing',
    description:
      'User reported Amoxicillin 500mg listed at 85 ETB at Arada Community Pharmacy, but average network price is 45 ETB.',
    category: 'pricing',
    status: 'open',
    priority: 'high',
    reportedBy: 'Abebe Selassie',
    reportedAt: '2024-10-24 11:45',
    region: 'Addis Ababa',
    relatedEntity: 'Arada Community Pharmacy',
  },
  {
    id: 'RPT-002',
    title: 'Suspicious reservation pattern',
    description:
      'User attempted 8 reservations at different pharmacies within 1 hour — possible abuse or bot activity.',
    category: 'suspicious_activity',
    status: 'investigating',
    priority: 'critical',
    reportedBy: 'System Monitor',
    reportedAt: '2024-10-23 18:30',
    region: 'Addis Ababa',
    relatedEntity: 'USR-1004 (Sara Bekele)',
    assignedTo: 'Security Team',
  },
  {
    id: 'RPT-003',
    title: 'Medicine out of stock — regional gap',
    description:
      'Artemether/Lumefantrine unavailable in 22 pharmacies across Addis Ababa despite high demand alerts.',
    category: 'availability',
    status: 'investigating',
    priority: 'high',
    reportedBy: 'AI Demand Monitor',
    reportedAt: '2024-10-24 08:15',
    region: 'Addis Ababa',
    relatedEntity: 'Network Inventory',
    assignedTo: 'Ops Team',
  },
  {
    id: 'RPT-004',
    title: 'Pharmacy license mismatch',
    description:
      'Submitted license document for Hidase Health Center does not match EFDA registry entry for ET-PHA-2024-712.',
    category: 'data_inaccuracy',
    status: 'open',
    priority: 'medium',
    reportedBy: 'Verification Service',
    reportedAt: '2024-10-22 14:20',
    region: 'Addis Ababa',
    relatedEntity: 'Hidase Health Center',
  },
  {
    id: 'RPT-005',
    title: 'Patient complaint — wrong medicine dispensed info',
    description:
      'Patient claims reservation confirmation showed different medicine name than what pharmacy had in stock.',
    category: 'user_complaint',
    status: 'resolved',
    priority: 'medium',
    reportedBy: 'Hanna Tadesse',
    reportedAt: '2024-10-20 16:42',
    region: 'Addis Ababa',
    relatedEntity: 'Bole Heights Pharmacy',
    assignedTo: 'Support Team',
  },
  {
    id: 'RPT-006',
    title: 'Failed admin login attempts',
    description:
      '15 failed admin login attempts from IP 196.188.x.x blocked automatically. Review for persistent threat.',
    category: 'security',
    status: 'resolved',
    priority: 'critical',
    reportedBy: 'Auth Monitor',
    reportedAt: '2024-10-24 10:22',
    region: 'System',
    assignedTo: 'Security Team',
  },
  {
    id: 'RPT-007',
    title: 'Metformin stock data stale',
    description:
      'Inventory sync for 18 pharmacies shows Metformin 850mg as in-stock but patient searches return unavailable.',
    category: 'data_inaccuracy',
    status: 'open',
    priority: 'high',
    reportedBy: 'Inventory Sync',
    reportedAt: '2024-10-24 07:55',
    region: 'Multi-region',
    relatedEntity: '18 pharmacies',
  },
]

export const analyticsReports: AnalyticsReport[] = [
  {
    id: 'AR-001',
    title: 'Platform Demand Trends',
    description: 'Weekly medicine demand across all regions with AI predictions',
    icon: 'trending_up',
    lastGenerated: '2024-10-24',
    format: 'PDF',
    frequency: 'Weekly',
  },
  {
    id: 'AR-002',
    title: 'Network Availability Summary',
    description: 'Aggregated medicine availability and out-of-stock hotspots',
    icon: 'inventory',
    lastGenerated: '2024-10-24',
    format: 'CSV',
    frequency: 'Daily',
  },
  {
    id: 'AR-003',
    title: 'Pharmacy Performance Report',
    description: 'Reservations, inventory turnover, and response times by partner',
    icon: 'local_pharmacy',
    lastGenerated: '2024-10-23',
    format: 'PDF',
    frequency: 'Weekly',
  },
  {
    id: 'AR-004',
    title: 'User Activity & Engagement',
    description: 'Anonymized user registrations, reservations, and AI assistant usage',
    icon: 'group',
    lastGenerated: '2024-10-23',
    format: 'JSON',
    frequency: 'Monthly',
  },
  {
    id: 'AR-005',
    title: 'Healthcare Insights — Regional',
    description: 'Regional health demand patterns and medicine access gaps in Ethiopia',
    icon: 'public',
    lastGenerated: '2024-10-22',
    format: 'PDF',
    frequency: 'Monthly',
  },
]

export const reportStats = {
  open: 3,
  investigating: 2,
  resolvedThisWeek: 14,
  suspiciousActivity: 2,
}

export type ReportFilterTab =
  | 'all'
  | 'open'
  | 'investigating'
  | 'resolved'
  | 'suspicious_activity'
  | 'data_inaccuracy'

export const reportFilterTabs: { id: ReportFilterTab; icon: string; label: string }[] = [
  { id: 'all', icon: 'list', label: 'All Reports' },
  { id: 'open', icon: 'pending', label: 'Open' },
  { id: 'investigating', icon: 'search', label: 'Investigating' },
  { id: 'resolved', icon: 'check_circle', label: 'Resolved' },
  { id: 'suspicious_activity', icon: 'shield', label: 'Suspicious' },
  { id: 'data_inaccuracy', icon: 'error', label: 'Data Issues' },
]

export const categoryLabels: Record<PlatformReport['category'], string> = {
  data_inaccuracy: 'Data Inaccuracy',
  user_complaint: 'User Complaint',
  suspicious_activity: 'Suspicious Activity',
  availability: 'Availability',
  pricing: 'Pricing',
  security: 'Security',
}

export function filterReports(tab: ReportFilterTab, search: string) {
  const query = search.toLowerCase()
  return reports.filter((r) => {
    const matchesSearch =
      !query ||
      r.title.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.reportedBy.toLowerCase().includes(query) ||
      r.relatedEntity?.toLowerCase().includes(query)

    const matchesTab =
      tab === 'all'
        ? true
        : tab === 'open' || tab === 'investigating' || tab === 'resolved'
          ? r.status === tab
          : r.category === tab

    return matchesSearch && matchesTab
  })
}
