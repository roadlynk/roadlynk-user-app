import { useSyncExternalStore } from 'react'
import { getLoadingSnapshot, subscribeLoading } from '@/lib/loading-store'
import { BrandLoader } from './BrandLoader'

/** Mounted once at the app root — shows the branded splash for every API call in flight. */
export function GlobalLoader() {
  const isLoading = useSyncExternalStore(subscribeLoading, getLoadingSnapshot)
  if (!isLoading) return null
  return <BrandLoader />
}
