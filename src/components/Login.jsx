import { useState } from 'react'
import { ArrowRight, BarChart3, Box, Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { Button } from './ui'
import { login } from '../lib/auth-service'
import logo from '../assets/roadlynk-logo.png'
import loginScene from '../assets/roadlynk-login-scene.jpg'

function Login({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Enter both your username and password.')
      return
    }

    setPending(true)
    try {
      const session = await login(email.trim().toLowerCase(), password)
      onSuccess?.(session)
    } catch (submitError) {
      setError(
        submitError.response?.data?.message ??
          (submitError.response ? 'Incorrect username or password.' : 'Unable to reach the server. Please try again.'),
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">
      <img
        src={loginScene}
        alt="RoadLynk truck travelling through a connected global logistics network"
        className="absolute inset-0 size-full object-cover object-[52%_center]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--login-wash-strong)_0%,var(--login-wash-soft)_29%,transparent_52%,var(--login-wash-soft)_100%)]" />

      <div className="relative mx-auto grid min-h-dvh max-w-[1600px] grid-rows-[auto_1fr_auto] px-5 py-5 sm:px-8 sm:py-7 lg:px-12 xl:px-16">
        <header className="flex items-start justify-between">
          <div className="flex flex-col items-center">
            <img src={logo} alt="RoadLynk" className="h-[4.8rem] w-auto object-contain sm:h-[5.5rem]" />
            <p className="mt-1 text-[0.55rem] font-semibold uppercase tracking-[0.34em] text-foreground/65">Plan &middot; Track &middot; Deliver</p>
          </div>
          <p className="pt-2 text-[0.7rem] font-medium text-muted-foreground sm:text-xs">
            New to RoadLynk? <span className="ml-2 font-semibold text-accent">Contact Us &rarr;</span>
          </p>
        </header>

        <section className="relative grid items-center gap-8 py-4 md:grid-cols-[minmax(15rem,0.78fr)_minmax(20rem,1fr)] lg:grid-cols-[minmax(19rem,0.8fr)_minmax(24rem,1fr)]">
          <div className="z-10 self-center md:pb-10 lg:pb-16">
            <h2 className="max-w-[29rem] font-display text-[2.7rem] font-semibold leading-[0.92] tracking-normal text-foreground sm:text-[3.4rem] lg:text-[4.35rem] xl:text-[4.8rem]">
              Moving
              <span className="block text-accent">Possibilities</span>
              <span className="block">Forward</span>
            </h2>
            <p className="mt-5 max-w-[20rem] text-sm leading-relaxed text-foreground/70 sm:text-[0.95rem]">
              A unified workspace for companies, owners, trucks, drivers and compliance.
            </p>
            <div className="mt-7 flex max-w-[25rem] flex-wrap gap-x-6 gap-y-3 md:-ml-1">
              <Feature icon={Box} title="Manage" detail="Your Fleet" />
              <Feature icon={BarChart3} title="Real-time" detail="Visibility" />
              <Feature icon={ShieldCheck} title="Stay" detail="Compliant" />
            </div>
          </div>

          <div className="z-20 mx-auto w-full max-w-[27rem] rounded-[1.625rem] border border-card/70 bg-card/88 p-6 shadow-lift backdrop-blur-xl sm:p-8 md:ml-auto lg:p-9">
            <p className="eyebrow text-muted-foreground">Welcome back</p>
            <h1 className="mt-3 max-w-xs font-display text-[2rem] font-semibold leading-[1.04] tracking-normal text-foreground sm:text-[2.25rem]">
              Sign in to your
              <br />
              workspace
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Use the credentials issued to you by your RoadLynk administrator.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                  Username
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    name="email"
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 w-full rounded-lg border border-input bg-card/60 pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/65 focus:border-accent focus:ring-2 focus:ring-accent/15"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    className="h-12 w-full rounded-lg border border-input bg-card/60 pl-11 pr-12 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/65 focus:border-accent focus:ring-2 focus:ring-accent/15"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center text-xs">
                <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="size-4 rounded border-input accent-[var(--accent)]"
                  />
                  Remember me
                </label>
              </div>

              {error ? (
                <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={pending}
                className="accent-fill h-12 w-full rounded-lg text-sm font-semibold shadow-accent transition-transform hover:-translate-y-0.5 hover:brightness-105"
              >
                {pending ? <Loader2 className="animate-spin" /> : null}
                {pending ? 'Verifying…' : 'Sign in'}
                {!pending ? <ArrowRight /> : null}
              </Button>
            </form>

            <div className="mt-6 border-t border-border/70 pt-5">
              <p className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" />
                Access is granted by your assigned company, role and permissions.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function Feature({ icon: Icon, title, detail }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-card/70 bg-card/70 backdrop-blur-sm">
        <Icon className="size-3.5 text-foreground" />
      </span>
      <p className="text-[0.7rem] font-semibold leading-tight text-foreground">
        {title}
        <span className="block font-normal text-muted-foreground">{detail}</span>
      </p>
    </div>
  )
}

export default Login
