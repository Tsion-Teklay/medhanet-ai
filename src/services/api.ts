/**
 * API service layer — replace mock implementations with real fetch calls
 * when backend endpoints are available.
 */
import { users, userStats } from '@/data/users'
import { pharmacies } from '@/data/pharmacies'
import { medicines, medicineStats } from '@/data/medicines'
import { systemLogs, logStats } from '@/data/logs'
import { reports, analyticsReports, reportStats } from '@/data/reports'
import { platformStats } from '@/data/platformStats'

export const api = {
  dashboard: {
    getStats: async () => platformStats,
  },
  users: {
    getAll: async () => users,
    getStats: async () => userStats,
  },
  pharmacies: {
    getAll: async () => pharmacies,
  },
  medicines: {
    getAll: async () => medicines,
    getStats: async () => medicineStats,
  },
  logs: {
    getAll: async () => systemLogs,
    getStats: async () => logStats,
  },
  reports: {
    getAll: async () => reports,
    getAnalytics: async () => analyticsReports,
    getStats: async () => reportStats,
  },
}
