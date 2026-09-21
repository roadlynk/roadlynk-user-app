import logo from '@/assets/roadlynk-logo.png'
import { cn } from '@/lib/utils'

/**
 * Branded loading indicator — a small truck "driving" over an animated road,
 * cropped from the RoadLynk logo. Use `fullScreen` for a page-covering splash
 * (see BrandLoader) or `compact` for an inline spot (e.g. next to a heading
 * while a secondary panel refreshes).
 */
export function RoadLynkLoader({ fullScreen = false, compact = false, label = 'Loading', className = '' }) {
  return (
    <div
      className={cn(
        fullScreen ? 'fixed inset-0 z-50 grid bg-background/88 backdrop-blur-md' : compact ? 'inline-grid' : 'grid min-h-40',
        className,
        'place-items-center',
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className={compact ? 'roadlynk-loader roadlynk-loader--compact' : 'roadlynk-loader'}>
        <div className="roadlynk-loader__vehicle" aria-hidden="true">
          <div className={compact ? 'roadlynk-loader__logo-crop roadlynk-loader__logo-crop--compact' : 'roadlynk-loader__logo-crop'}>
            <img src={logo} alt="" />
          </div>
        </div>
        <div className="roadlynk-loader__road" aria-hidden="true">
          <span />
        </div>
        <p className={compact ? 'sr-only' : 'mt-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'}>
          {label}
        </p>
      </div>
    </div>
  )
}
