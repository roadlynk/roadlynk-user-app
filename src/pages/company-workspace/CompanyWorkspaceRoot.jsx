import { Link, Outlet, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowLeft, Building2 } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { CompanyWorkspaceLayout } from '@/components/company-workspace/CompanyWorkspaceLayout'

// There's no GET /companies/:id endpoint, so the company chosen on the
// company list is stored in Redux (store/slices/companySlice.js, persisted)
// when it's clicked — that's what keeps the workspace working across
// in-app navigation and page refreshes.
export default function CompanyWorkspaceRoot({ onLogout }) {
  const { companyId } = useParams()
  const selectedCompany = useSelector((state) => state.company.selectedCompany)
  const company = selectedCompany?._id === companyId ? selectedCompany : null

  if (!company) {
    return (
      <AppLayout onLogout={onLogout} eyebrow="Onboarding" title="Company not found">
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center shadow-sm">
          <Building2 className="mx-auto size-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium text-foreground">Open this company from the list to view its workspace.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/company-list">
              <ArrowLeft className="size-4" />
              Back to company list
            </Link>
          </Button>
        </div>
      </AppLayout>
    )
  }

  return (
    <CompanyWorkspaceLayout company={company} onLogout={onLogout}>
      <Outlet context={{ company }} />
    </CompanyWorkspaceLayout>
  )
}
