import type { SystemLog } from '@/types'

export const systemLogs: SystemLog[] = [
  {
    id: 'LOG-001',
    timestamp: '2024-10-24 14:32:01',
    category: 'pharmacy',
    severity: 'info',
    source: 'Registration Service',
    message: 'New pharmacy partner application received',
    details: 'Bole Medhanealem Pharmacy submitted registration with license ET-PHA-2024-889',
  },
  {
    id: 'LOG-002',
    timestamp: '2024-10-24 14:15:44',
    category: 'pharmacy',
    severity: 'warning',
    source: 'Reservation Monitor',
    message: 'Reservation spike detected in Arada District',
    details: 'Unusual 340% increase in reservations across 4 pharmacy nodes in 30 minutes',
  },
  {
    id: 'LOG-003',
    timestamp: '2024-10-24 13:01:22',
    category: 'system',
    severity: 'info',
    source: 'Deployment Pipeline',
    message: 'AI Model v2.4 deployed successfully',
    details: 'Clinical-grade AI model verified across all primary Ethiopian medical regions',
  },
  {
    id: 'LOG-004',
    timestamp: '2024-10-24 11:45:09',
    category: 'report',
    severity: 'warning',
    source: 'User Reports',
    message: 'Data inaccuracy report submitted',
    details: 'User Abebe Selassie reported incorrect Amoxicillin pricing at Arada Community Pharmacy',
  },
  {
    id: 'LOG-005',
    timestamp: '2024-10-24 10:22:33',
    category: 'security',
    severity: 'critical',
    source: 'Auth Monitor',
    message: 'Multiple failed login attempts detected',
    details: '15 failed admin login attempts from IP 196.188.x.x in 5 minutes — auto-blocked',
  },
  {
    id: 'LOG-006',
    timestamp: '2024-10-24 09:18:55',
    category: 'user',
    severity: 'info',
    source: 'User Service',
    message: '312 new user registrations this week',
    details: 'Peak registration region: Addis Ababa (68%), Bahir Dar (12%)',
  },
  {
    id: 'LOG-007',
    timestamp: '2024-10-24 08:05:17',
    category: 'ai',
    severity: 'info',
    source: 'Addis AI Gateway',
    message: 'Prescription OCR batch processed',
    details: '1,240 prescription images processed with 94.2% extraction accuracy',
  },
  {
    id: 'LOG-008',
    timestamp: '2024-10-23 22:41:02',
    category: 'pharmacy',
    severity: 'error',
    source: 'Inventory Sync',
    message: 'Inventory sync failure for Mercato Discount Drugs',
    details: 'Pharmacy PHA-006 failed to sync inventory — account suspended pending review',
  },
  {
    id: 'LOG-009',
    timestamp: '2024-10-23 20:15:38',
    category: 'system',
    severity: 'warning',
    source: 'Database Monitor',
    message: 'High query latency detected',
    details: 'Average query time exceeded 200ms threshold for 12 minutes during peak hours',
  },
  {
    id: 'LOG-010',
    timestamp: '2024-10-23 18:30:11',
    category: 'report',
    severity: 'warning',
    source: 'Moderation Queue',
    message: 'Suspicious reservation pattern flagged',
    details: 'User USR-1004 attempted 8 reservations at different pharmacies within 1 hour',
  },
]

export type LogFilterTab = 'all' | 'system' | 'pharmacy' | 'user' | 'security' | 'report' | 'ai'

export const logFilterTabs: { id: LogFilterTab; icon: string; label: string }[] = [
  { id: 'all', icon: 'list', label: 'All Events' },
  { id: 'system', icon: 'settings', label: 'System' },
  { id: 'pharmacy', icon: 'local_pharmacy', label: 'Pharmacy' },
  { id: 'user', icon: 'group', label: 'Users' },
  { id: 'security', icon: 'security', label: 'Security' },
  { id: 'report', icon: 'report', label: 'Reports' },
  { id: 'ai', icon: 'psychology', label: 'AI Services' },
]

export function filterLogs(tab: LogFilterTab, search: string) {
  const query = search.toLowerCase()
  return systemLogs.filter((log) => {
    const matchesSearch =
      !query ||
      log.message.toLowerCase().includes(query) ||
      log.source.toLowerCase().includes(query) ||
      log.details?.toLowerCase().includes(query)

    const matchesTab = tab === 'all' || log.category === tab
    return matchesSearch && matchesTab
  })
}

export const logStats = {
  totalToday: 156,
  warnings: 23,
  errors: 4,
  reports: 8,
}
