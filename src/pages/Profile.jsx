import { useState } from 'react'
import { KeyRound, Loader2, Mail, MoonStar, Phone, Sun, UserRound } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { PasswordField } from '@/components/ui/text-field'
import { changePassword } from '@/lib/auth-service'
import bannerImage from '@/assets/roadlynk-dashboard-highway.jpg'

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}

function ChangePasswordCard({ onLogout }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('Fill in all three fields.')
      return
    }
    if (form.newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }

    setPending(true)
    try {
      await changePassword(form.currentPassword, form.newPassword)
      await onLogout()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Could not change password.')
      setPending(false)
    }
  }

  return (
    <div className="rounded-xl border border-card/70 bg-card/70 p-6 shadow-card backdrop-blur-xl">
      <div className="mb-5 flex items-center gap-2">
        <KeyRound className="size-4 text-accent" />
        <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">Change password</h2>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordField
            label="Current password"
            required
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(event) => setForm({ ...form, currentPassword: event.target.value })}
            className="sm:col-span-2"
          />
          <PasswordField
            label="New password"
            required
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
          />
          <PasswordField
            label="Confirm new password"
            required
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
          />
        </div>

        {error ? (
          <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={pending} className="accent-fill">
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Update password
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function Profile({ user, onLogout }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const GreetingIcon = hour >= 6 && hour < 18 ? Sun : MoonStar

  return (
    <AppLayout onLogout={onLogout} eyebrow="Account" title="Profile" bannerImage={bannerImage}>
      <section className="relative flex min-h-[15rem] items-center pt-8 sm:min-h-[17rem] sm:pt-10">
        <div className="flex items-center gap-5">
          <span className="grid size-20 shrink-0 place-items-center rounded-full border-4 border-background bg-accent/10 text-accent shadow-lift sm:size-24">
            <UserRound className="size-9 sm:size-10" />
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="eyebrow text-accent [text-shadow:0_0_2px_var(--background),0_1px_10px_color-mix(in_oklab,var(--background)_90%,transparent),0_0_28px_color-mix(in_oklab,var(--background)_75%,transparent)]">Account</span>
              <span className="h-px w-8 bg-accent/30" />
            </div>
            <h1 className="flex items-center gap-3 font-display text-lg font-bold leading-tight tracking-tight text-foreground [text-shadow:0_0_2px_var(--background),0_1px_10px_color-mix(in_oklab,var(--background)_90%,transparent),0_0_28px_color-mix(in_oklab,var(--background)_75%,transparent)] sm:text-2xl">
              {greeting},
              <GreetingIcon className="size-4 text-amber-500 drop-shadow-[0_0_6px_var(--background)] sm:size-5" strokeWidth={1.7} />
            </h1>
            <p className="break-words font-display text-3xl font-medium text-foreground/90 [text-shadow:0_0_2px_var(--background),0_1px_10px_color-mix(in_oklab,var(--background)_90%,transparent),0_0_28px_color-mix(in_oklab,var(--background)_75%,transparent)] sm:text-5xl">{user?.username}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="rounded-xl border border-card/70 bg-card/70 p-6 shadow-card backdrop-blur-xl">
          <h2 className="mb-3 font-display text-sm font-semibold tracking-tight text-foreground">Account details</h2>
          <div className="divide-y divide-border rounded-lg border border-border/70 bg-card/60">
            <DetailRow icon={UserRound} label="Username" value={user?.username} />
            <DetailRow icon={Mail} label="Email" value={user?.email} />
            <DetailRow icon={Phone} label="Mobile number" value={user?.mobileNumber ?? '—'} />
          </div>
        </div>

        <ChangePasswordCard onLogout={onLogout} />
      </div>
    </AppLayout>
  )
}
