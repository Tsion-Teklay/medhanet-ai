export type UserStatus = 'active' | 'suspended' | 'reported' | 'inactive'

export type PlatformUser = {
  id: string
  name: string
  email: string
  phone: string
  region: string
  language: string
  status: UserStatus
  registeredAt: string
  reservations: number
  aiQueries: number
}

export type PharmacyStatus =
  | 'pending'
  | 'under_review'
  | 'verified'
  | 'suspended'
  | 'deactivated'

export type Pharmacy = {
  id: string
  name: string
  location: string
  region: string
  status: PharmacyStatus
  applicationDate: string
  licenseNumber: string
  contactPhone: string
  contactEmail: string
  inventoryCount: number
  reservationsToday: number
  icon: string
  iconClassName: string
}

export type MedicineDemand = 'rising' | 'stable' | 'falling'

export type NetworkMedicine = {
  id: string
  name: string
  category: string
  totalStock: number
  pharmacyCount: number
  avgPrice: number
  currency: string
  demand: MedicineDemand
  lowStockPharmacies: number
  reservationsWeek: number
}

export type LogSeverity = 'info' | 'warning' | 'error' | 'critical'

export type LogCategory = 'system' | 'pharmacy' | 'user' | 'security' | 'report' | 'ai'

export type SystemLog = {
  id: string
  timestamp: string
  category: LogCategory
  severity: LogSeverity
  source: string
  message: string
  details?: string
}

export type PlatformStats = {
  totalUsers: string
  userGrowth: string
  activePharmacies: number
  pharmaciesToday: number
  reservations: string
  reservationsToday: number
  catalogItems: string
  aiQueries: string
  aiAccuracy: number
  verifiedPharmacies: number
  pendingPharmacies: number
  suspendedPharmacies: number
}

export type ReportStatus = 'open' | 'investigating' | 'resolved' | 'dismissed'

export type ReportPriority = 'low' | 'medium' | 'high' | 'critical'

export type ReportCategory =
  | 'data_inaccuracy'
  | 'user_complaint'
  | 'suspicious_activity'
  | 'availability'
  | 'pricing'
  | 'security'

export type PlatformReport = {
  id: string
  title: string
  description: string
  category: ReportCategory
  status: ReportStatus
  priority: ReportPriority
  reportedBy: string
  reportedAt: string
  region: string
  relatedEntity?: string
  assignedTo?: string
}

export type AnalyticsReport = {
  id: string
  title: string
  description: string
  icon: string
  lastGenerated: string
  format: 'PDF' | 'CSV' | 'JSON'
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'On demand'
}
