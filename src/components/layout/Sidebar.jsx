import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Building2, ClipboardList, PanelLeftClose, PanelLeftOpen, Percent, UserRound, Users, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth-service'
import { PAGE, canAccessPage } from '@/lib/access-control'
import logo from '@/assets/roadlynk-logo.png'

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { path: '/profile', label: 'Profile', icon: UserRound, page: PAGE.PROFILE },
      { path: '/companies', label: 'Companies', icon: Building2, page: PAGE.COMPANIES },
      { path: '/company-list', label: 'Company list', icon: ClipboardList, page: PAGE.COMPANY_LIST },
      { path: '/users', label: 'Users & Roles', icon: Users, page: PAGE.USERS_ROLES },
    ],
  },
  {
    label: 'Masters',
    items: [{ path: '/masters/gst-configurer', label: 'GST Configurer', icon: Percent, page: PAGE.GST_CONFIGURER }],
  },
]

function NavGroup({ label, items, expanded, pathname, onNavigate, onCloseMobile }) {
  return (
    <div className="space-y-1.5">
      {label && expanded ? <p className="px-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p> : null}
      {items.map((item) => {
        const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`)
        return (
          <button
            key={item.path}
            type="button"
            onClick={() => {
              onNavigate(item.path)
              onCloseMobile?.()
            }}
            title={item.label}
            className={cn(
              'flex h-11 w-full items-center rounded-lg text-sm font-medium transition-all duration-200',
              expanded ? 'gap-3 px-3' : 'w-11 justify-center',
              isActive ? 'accent-fill shadow-accent' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            )}
          >
            <item.icon className="size-[1.05rem] shrink-0" />
            <span className={expanded ? 'truncate' : 'sr-only'}>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function SidebarContent({ expanded, mobile = false, pathname, onNavigate, onCloseMobile, pinned, onTogglePinned, navGroups }) {
  return (
    <div
      className={cn(
        'flex h-full flex-col border-r border-border bg-card/90 backdrop-blur-xl',
        expanded ? 'items-stretch' : 'items-center',
      )}
    >
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

      <nav className={cn('mt-3 w-full flex-1 space-y-5 border-t border-border/70 pt-3', expanded ? 'px-3' : 'px-2')}>
        {navGroups.map((group) => (
          <NavGroup
            key={group.label ?? 'default'}
            label={group.label}
            items={group.items}
            expanded={expanded}
            pathname={pathname}
            onNavigate={onNavigate}
            onCloseMobile={onCloseMobile}
          />
        ))}
      </nav>

      {!mobile ? (
        <button
          type="button"
          onClick={onTogglePinned}
          className={cn(
            'm-3 flex h-10 items-center rounded-lg border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:border-accent/40 hover:text-foreground',
            expanded ? 'justify-start gap-3 px-3' : 'w-11 justify-center',
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

export function Sidebar({ pinned, onTogglePinned, mobileOpen, onCloseMobile }) {
  const [hovered, setHovered] = useState(false)
  const expanded = pinned || hovered
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const navGroups = useMemo(() => {
    const user = getCurrentUser()
    return NAV_GROUPS.map((group) => ({ ...group, items: group.items.filter((item) => canAccessPage(user, item.page)) })).filter(
      (group) => group.items.length > 0,
    )
  }, [])

  return (
    <>
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-300 lg:block',
          expanded ? 'w-[16.5rem] shadow-lift' : 'w-[4.5rem]',
        )}
      >
        <SidebarContent
          expanded={expanded}
          pathname={pathname}
          onNavigate={navigate}
          pinned={pinned}
          onTogglePinned={() => {
            onTogglePinned()
            setHovered(false)
          }}
          navGroups={navGroups}
        />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="absolute inset-y-0 left-0 w-[17rem] shadow-lift">
            <SidebarContent expanded mobile pathname={pathname} onNavigate={navigate} onCloseMobile={onCloseMobile} navGroups={navGroups} />
          </div>
        </div>
      ) : null}
    </>
  )
}
