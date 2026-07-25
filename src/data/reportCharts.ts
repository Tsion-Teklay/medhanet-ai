export const weeklyReportTrend = [
  { label: 'Mon', reports: 4, resolved: 6 },
  { label: 'Tue', reports: 7, resolved: 5 },
  { label: 'Wed', reports: 5, resolved: 8 },
  { label: 'Thu', reports: 9, resolved: 7 },
  { label: 'Fri', reports: 6, resolved: 10 },
  { label: 'Sat', reports: 3, resolved: 4 },
  { label: 'Sun', reports: 2, resolved: 3 },
]

export const reportsByCategory = [
  { label: 'Pricing', value: 12 },
  { label: 'Data', value: 18 },
  { label: 'Availability', value: 9 },
  { label: 'Security', value: 6 },
  { label: 'Complaints', value: 8 },
  { label: 'Suspicious', value: 5 },
]

export const reportsByStatus = [
  { label: 'Open', value: 3, color: '#D97706' },
  { label: 'Investigating', value: 2, color: '#00873a' },
  { label: 'Resolved', value: 14, color: '#006b2c' },
  { label: 'Dismissed', value: 4, color: '#5c5f61' },
]

export const reportsByRegion = [
  { label: 'Addis Ababa', value: 22 },
  { label: 'Bahir Dar', value: 6 },
  { label: 'Hawassa', value: 4 },
  { label: 'Gondar', value: 3 },
  { label: 'Other', value: 5 },
]

export const recentReports = [
  { id: 'RPT-001', title: 'Incorrect Amoxicillin pricing', status: 'open', date: 'Oct 24' },
  { id: 'RPT-003', title: 'Medicine out of stock — regional gap', status: 'investigating', date: 'Oct 24' },
  { id: 'RPT-007', title: 'Metformin stock data stale', status: 'open', date: 'Oct 24' },
  { id: 'RPT-002', title: 'Suspicious reservation pattern', status: 'investigating', date: 'Oct 23' },
  { id: 'RPT-006', title: 'Failed admin login attempts', status: 'resolved', date: 'Oct 24' },
]
