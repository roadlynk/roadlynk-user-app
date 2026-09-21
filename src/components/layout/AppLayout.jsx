import { useEffect, useState } from 'react'
import { LogOut, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sidebar } from './Sidebar'

export function AppLayout({ onLogout, eyebrow, title, heroImage, bannerImage, children }) {
  const [pinned, setPinned] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // With a banner the header starts transparent over the image and turns solid
  // once the page scrolls (same as the dashboard mockup).
  useEffect(() => {
    if (!bannerImage) return undefined
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [bannerImage])

  return (
    <div className="bg-background">
      <Sidebar
        pinned={pinned}
        onTogglePinned={() => setPinned((value) => !value)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={cn('relative transition-[padding] duration-300', pinned ? 'lg:pl-[16.5rem]' : 'lg:pl-[4.5rem]')}>
        {heroImage ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(180deg, color-mix(in oklab, var(--background) 55%, transparent) 0%, color-mix(in oklab, var(--background) 22%, transparent) 45%, color-mix(in oklab, var(--background) 78%, transparent) 100%), url(${heroImage})`,
            }}
          />
        ) : null}

        {bannerImage ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[31rem] bg-cover bg-center bg-no-repeat sm:h-[34rem] xl:h-[36rem]"
            style={{
              backgroundImage: `linear-gradient(to right, color-mix(in oklab, var(--background) 66%, transparent) 0%, color-mix(in oklab, var(--background) 20%, transparent) 45%, transparent 72%), linear-gradient(to bottom, transparent 58%, var(--background) 94%), url(${bannerImage})`,
            }}
          />
        ) : null}

        <header
          className={cn(
            'sticky top-0 z-30 transition-colors duration-300',
            heroImage || (bannerImage && !scrolled)
              ? 'border-b border-border/20 bg-transparent'
              : 'border-b border-border/70 bg-card/95 shadow-sm backdrop-blur-xl',
          )}
        >
          <div className="flex h-[4.5rem] items-center gap-4 px-5 sm:px-9">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="text-muted-foreground lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="eyebrow truncate text-accent">{eyebrow}</p>
              <h1 className="truncate font-display text-xl font-semibold tracking-tight text-foreground">{title}</h1>
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

        <main
          className={cn(
            'relative',
            heroImage
              ? 'flex min-h-[calc(100dvh-4.5rem)] flex-col justify-center px-4 py-10 sm:px-7'
              : bannerImage
                ? 'min-h-[calc(100dvh-4.5rem)] px-4 pb-10 sm:px-7'
                : 'px-5 py-9 sm:px-9',
          )}
        >
          <div className={cn('relative mx-auto w-full', heroImage ? 'max-w-3xl' : bannerImage ? 'max-w-5xl' : 'max-w-6xl')}>{children}</div>
        </main>
      </div>
    </div>
  )
}
