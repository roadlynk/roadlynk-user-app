import { useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  ArrowLeft,
  Boxes,
  Building2,
  FileText,
  Fuel,
  Handshake,
  IdCard,
  IndianRupee,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Truck,
  UserRound,
  Wallet,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/auth-service'
import { canManageCompanyProfile } from '@/lib/access-control'
import logo from '@/assets/roadlynk-logo.png'

const COMPANY_NAV = [{ to: 'profile', label: 'Profile', icon: Building2 }]

const ONBOARDING_NAV = [
  { to: 'owner', label: 'Owners', icon: UserRound },
  { to: 'truck', label: 'Trucks', icon: Truck },
  { to: 'driver', label: 'Drivers', icon: IdCard },
  { to: 'client', label: 'Clients', icon: Handshake },
]

const TRIP_NAV = [{ to: 'dc', label: 'Delivery challans', icon: FileText }]

const PAYMENT_NAV = [{ to: 'account', label: 'Account', icon: Wallet }]

const MASTERS_NAV = [
  { to: 'material', label: 'Materials', icon: Boxes },
  { to: 'bunk-data', label: 'Bunk Data', icon: Fuel },
  { to: 'transport-rate', label: 'Transport Rate', icon: IndianRupee },
]

const NAV_GROUPS = [
  { key: 'company', label: 'Company', items: COMPANY_NAV, requiresProfileAccess: true },
  { key: 'onboarding', label: 'Onboarding', items: ONBOARDING_NAV },
  { key: 'trip', label: 'Trip', items: TRIP_NAV },
  { key: 'payment', label: 'Payment', items: PAYMENT_NAV },
  { key: 'masters', label: 'Masters', items: MASTERS_NAV },
]

// Every group stays visible (no accordion): a labelled section when the
// sidebar is expanded, a thin divider between icon clusters when collapsed.
function NavGroup({ label, items, expanded, first, onNavigate }) {
  return (
    <div className={cn(!first && (expanded ? 'pt-5' : 'mt-4 border-t border-border/70 pt-4'))}>
      {expanded ? (
        <p className="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">{label}</p>
      ) : null}
      <div className={cn('space-y-1', !expanded && 'flex flex-col items-center')}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={item.label}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group relative flex h-10 items-center rounded-lg text-sm font-medium transition-colors duration-150',
                expanded ? 'w-full gap-3 px-3' : 'w-10 justify-center',
                isActive ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-accent" /> : null}
                <item.icon className={cn('size-[1.1rem] shrink-0', isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground')} />
                <span className={expanded ? 'truncate' : 'sr-only'}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  )
}

function SidebarContent({ expanded, mobile = false, company, onCloseMobile, pinned, onTogglePinned }) {
  const groups = useMemo(() => {
    const canSeeProfile = canManageCompanyProfile(getCurrentUser())
    return NAV_GROUPS.filter((group) => !group.requiresProfileAccess || canSeeProfile)
  }, [])

  const initials = (company?.companyName ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase()

  return (
    <div className={cn('flex h-full flex-col border-r border-border bg-card/95 backdrop-blur-xl', expanded ? 'items-stretch' : 'items-center')}>
      <div className={cn('grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-4', expanded ? 'px-4' : 'px-2')}>
        <div className={cn('flex min-w-0 items-center', expanded ? 'justify-start' : 'justify-center')}>
          <img src={logo} alt="RoadLynk" className={cn('shrink-0 object-contain', expanded ? 'h-11 w-14' : 'h-10 w-12')} />
          {expanded ? <span className="ml-2 truncate font-display text-base font-semibold text-foreground">RoadLynk</span> : null}
        </div>
        {mobile ? (
          <button type="button" onClick={onCloseMobile} className="text-muted-foreground" aria-label="Close navigation">
            <X className="size-5" />
          </button>
        ) : null}
      </div>

      <nav className={cn('mt-1 w-full flex-1 overflow-y-auto border-t border-border/70 pb-2 pt-5', expanded ? 'px-3' : 'px-2')}>
        {groups.map((group, index) => (
          <NavGroup key={group.key} label={group.label} items={group.items} expanded={expanded} first={index === 0} onNavigate={mobile ? onCloseMobile : undefined} />
        ))}
      </nav>

      {company ? (
        expanded ? (
          <div className="mx-3 mb-3 flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/10 font-display text-xs font-semibold text-accent">{initials}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{company.companyName}</p>
              <p className="truncate text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">{company.companyCode}</p>
            </div>
          </div>
        ) : (
          <span
            title={company.companyName}
            className="mb-3 grid size-10 place-items-center rounded-lg bg-accent/10 font-display text-xs font-semibold text-accent"
          >
            {initials}
          </span>
        )
      ) : null}

      {!mobile ? (
        <button
          type="button"
          onClick={onTogglePinned}
          className={cn(
            'm-3 mt-0 flex h-10 items-center rounded-lg border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:border-accent/40 hover:text-foreground',
            expanded ? 'justify-start gap-3 self-stretch px-3' : 'w-10 justify-center',
          )}
          aria-label={pinned ? 'Collapse navigation' : 'Keep navigation open'}
          title={pinned ? 'Collapse navigation' : 'Keep navigation open'}
        >
          {pinned ? <PanelLeftClose className="size-[1.05rem] shrink-0" /> : <PanelLeftOpen className="size-[1.05rem] shrink-0" />}
          {expanded ? <span className="text-sm font-medium">{pinned ? 'Collapse' : 'Keep open'}</span> : null}
        </button>
      ) : null}
    </div>
  )
}

export function CompanyWorkspaceLayout({ company, loading, onLogout, children }) {
  const [pinned, setPinned] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const expanded = pinned || hovered
  const navigate = useNavigate()
  const location = useLocation()
  const isOnlyCompany = useSelector((state) => state.company.isOnlyCompany)

  // The DC listing pairs a wide filter sidebar with a data-heavy table —
  // give it more room than the standard form/list pages get.
  const isWidePage = /\/dc$/.test(location.pathname)

  return (
    <div className="bg-background">
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-300 lg:block',
          expanded ? 'w-[16.5rem] shadow-lift' : 'w-[4.5rem]',
        )}
      >
        <SidebarContent expanded={expanded} company={company} pinned={pinned} onTogglePinned={() => setPinned((value) => !value)} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[17rem] shadow-lift">
            <SidebarContent expanded mobile company={company} onCloseMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className={cn('relative transition-[padding] duration-300', pinned ? 'lg:pl-[16.5rem]' : 'lg:pl-[4.5rem]')}>
        <header className="sticky top-0 z-30 border-b border-border/70 bg-card/95 shadow-sm backdrop-blur-xl">
          <div className="flex h-[4.5rem] items-center gap-4 px-5 sm:px-9">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="text-muted-foreground lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>
            <Button asChild variant="outline" size="icon" aria-label="Back" className="hidden sm:inline-flex">
              <button type="button" onClick={() => navigate(isOnlyCompany ? '/profile' : '/company-list')}>
                <ArrowLeft className="size-4" />
              </button>
            </Button>
            <div className="min-w-0 flex-1">
              <p className="eyebrow truncate text-accent">Company workspace</p>
              <h1 className="flex items-center gap-2 truncate font-display text-xl font-semibold tracking-tight text-foreground">
                <span className="truncate">{loading ? 'Loading…' : (company?.companyName ?? 'Company not found')}</span>
              </h1>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={onLogout}
              className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </header>

        <main className="relative px-5 py-9 sm:px-9">
          <div className={cn('relative mx-auto w-full', isWidePage ? 'max-w-[100rem]' : 'max-w-6xl')}>{children}</div>
        </main>
      </div>
    </div>
  )
}
