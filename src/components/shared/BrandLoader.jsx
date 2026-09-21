import { RoadLynkLoader } from './RoadLynkLoader'

/**
 * Full-screen branded loading splash — shown while a page's primary data is
 * still loading for the first time (not for secondary/in-page refreshes,
 * toggles or submits, which keep the small inline spinner).
 */
export function BrandLoader({ label = 'Loading…' }) {
  return <RoadLynkLoader fullScreen label={label} />
}
