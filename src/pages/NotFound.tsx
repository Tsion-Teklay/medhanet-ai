import { Link } from 'react-router-dom'
import { MaterialIcon } from '@/components/ui/MaterialIcon'
import { PageShell } from '@/components/layout/PageShell'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function NotFound() {
  useDocumentTitle('Page Not Found | MedhaNet AI Admin')

  return (
    <PageShell title="Page Not Found" icon="error">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <MaterialIcon icon="search_off" className="mb-4 text-6xl text-secondary" />
        <h2 className="font-headline-lg text-headline-lg text-on-surface">404 — Page Not Found</h2>
        <p className="mt-2 max-w-md text-body-md text-secondary">
          The page you are looking for does not exist in the MedhaNet admin dashboard.
        </p>
        <Link
          to="/"
          className="mt-6 rounded-xl bg-primary px-6 py-3 font-label-md text-on-primary transition-transform hover:scale-105"
        >
          Back to Dashboard
        </Link>
      </div>
    </PageShell>
  )
}
