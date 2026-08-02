import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronLeft,
  CircleAlert,
  CircleCheck,
  Eye,
  EyeOff,
  Headphones,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserRound,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from '../router'
import { apiEnabled, authApi } from '../lib/api'
import { getAuthCopy } from '../i18n/auth-copy'
import { useLanguage } from '../i18n'
import '../styles/auth.css'

type Mode = 'login' | 'register'

const getSafeNextPath = (value: string | null) => {
  if (!value) return '/account'
  const candidate = value.trim()
  if (!candidate.startsWith('/') || candidate.startsWith('//') || candidate.startsWith('/\\')) return '/account'
  try {
    const target = new URL(candidate, window.location.origin)
    if (target.origin !== window.location.origin) return '/account'
    return `${target.pathname}${target.search}${target.hash}`
  } catch {
    return '/account'
  }
}

export const AuthPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { locale } = useLanguage()
  const auth = getAuthCopy(locale)
  const [mode, setMode] = useState<Mode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const selectMode = (nextMode: Mode) => {
    setMode(nextMode)
    setError('')
    setShowPassword(false)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')

    if (mode === 'register' && name.length < 2) {
      setError(auth.validation.nameRequired)
      return
    }

    if (!email.includes('@') || password.length < 6) {
      setError(auth.validation.credentialsInvalid)
      return
    }

    setPending(true)
    setError('')
    try {
      if (apiEnabled) {
        if (mode === 'register') await authApi.register(email, password)
        await authApi.login(email, password, { name: mode === 'register' ? name : undefined })
      } else {
        authApi.completeDemoLogin({
          email,
          name: mode === 'register' ? name : auth.demoGuestName,
        })
        await new Promise((resolve) => window.setTimeout(resolve, 450))
      }
      navigate(getSafeNextPath(searchParams.get('next')))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : auth.validation.signInFailed)
    } finally {
      setPending(false)
    }
  }

  const content = auth.modes[mode]

  return (
    <main id="main-content" className="nx-auth">
      <section className="nx-auth__showcase" aria-labelledby="auth-showcase-title">
        <div className="nx-auth__light nx-auth__light--violet" aria-hidden="true" />
        <div className="nx-auth__light nx-auth__light--acid" aria-hidden="true" />
        <div className="nx-auth__grid" aria-hidden="true" />

        <div className="nx-auth__showcase-top">
          <Link className="nx-auth__brand" to="/" aria-label={auth.links.homeAria}>
            <span className="nx-auth__brand-mark" aria-hidden="true"><i /><i /></span>
            <span>{auth.brand}</span>
          </Link>
          <Link className="nx-auth__home-link" to="/">
            <span>{auth.links.home}</span>
            <ArrowLeft size={16} strokeWidth={2.2} aria-hidden="true" />
          </Link>
        </div>

        <div className="nx-auth__showcase-content">
          <p className="nx-auth__live-label"><span aria-hidden="true" /> {auth.showcase.liveLabel}</p>
          <h1 id="auth-showcase-title">{auth.showcase.titleBefore}<br /><em>{auth.showcase.titleAccent}</em> {auth.showcase.titleAfter}</h1>
          <p className="nx-auth__showcase-description">{auth.showcase.description}</p>

          <article className="nx-auth__ticket-preview" aria-label={auth.showcase.previewAria}>
            <div className="nx-auth__ticket-glow" aria-hidden="true"><span /><span /><span /></div>
            <div className="nx-auth__ticket-head">
              <span className="nx-auth__ticket-chip"><Sparkles size={14} aria-hidden="true" /> {auth.showcase.ticket.featured}</span>
              <span className="nx-auth__ticket-code" dir="ltr">{auth.showcase.ticket.code}</span>
            </div>
            <div className="nx-auth__ticket-main">
              <p>{auth.showcase.ticket.category}</p>
              <h2>{auth.showcase.ticket.title}</h2>
              <span>{auth.showcase.ticket.subtitle}</span>
            </div>
            <div className="nx-auth__ticket-bottom">
              <span><CalendarDays size={15} aria-hidden="true" /> {auth.showcase.ticket.date}</span>
              <span><Ticket size={15} aria-hidden="true" /> {auth.showcase.ticket.digitalTicket}</span>
            </div>
            <div className="nx-auth__ticket-perforation" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
          </article>
        </div>

        <div className="nx-auth__showcase-footer" aria-label={auth.showcase.trustAria}>
          <span><ShieldCheck size={17} aria-hidden="true" /> {auth.showcase.trust.securePayment}</span>
          <span><CircleCheck size={17} aria-hidden="true" /> {auth.showcase.trust.guaranteedTicket}</span>
          <span><Headphones size={17} aria-hidden="true" /> {auth.showcase.trust.support}</span>
        </div>
      </section>

      <section className="nx-auth__workspace" aria-labelledby="auth-form-title">
        <div className="nx-auth__workspace-orb nx-auth__workspace-orb--one" aria-hidden="true" />
        <div className="nx-auth__workspace-orb nx-auth__workspace-orb--two" aria-hidden="true" />

        <div className="nx-auth__mobile-nav">
          <Link className="nx-auth__brand nx-auth__brand--dark" to="/" aria-label={auth.links.homeAria}>
            <span className="nx-auth__brand-mark" aria-hidden="true"><i /><i /></span>
            <span>{auth.brand}</span>
          </Link>
          <Link className="nx-auth__mobile-back" to="/" aria-label={auth.links.mobileBackAria}>
            <ChevronLeft size={20} aria-hidden="true" />
          </Link>
        </div>

        <div className="nx-auth__form-shell">
          <div className="nx-auth__security-note"><ShieldCheck size={16} aria-hidden="true" /> {auth.form.securityNote}</div>

          <div className="nx-auth__mode-switch" role="tablist" aria-label={auth.tabs.label}>
            <button
              type="button"
              className={mode === 'login' ? 'is-active' : ''}
              onClick={() => selectMode('login')}
              role="tab"
              id="login-tab"
              aria-selected={mode === 'login'}
              aria-controls="login-panel"
            >
              {auth.tabs.login}
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'is-active' : ''}
              onClick={() => selectMode('register')}
              role="tab"
              id="register-tab"
              aria-selected={mode === 'register'}
              aria-controls="register-panel"
            >
              {auth.tabs.register}
            </button>
          </div>

          <div
            className="nx-auth__form-panel"
            role="tabpanel"
            id={mode === 'login' ? 'login-panel' : 'register-panel'}
            aria-labelledby={mode === 'login' ? 'login-tab' : 'register-tab'}
          >
            <header className="nx-auth__form-intro">
              <p><Sparkles size={15} aria-hidden="true" /> {content.eyebrow}</p>
              <h2 id="auth-form-title">{content.title}</h2>
              <span>{content.description}</span>
            </header>

            <form onSubmit={submit} noValidate aria-busy={pending}>
              {mode === 'register' && (
                <label className="nx-auth__field">
                    <span>{auth.form.nameLabel}</span>
                  <span className="nx-auth__input-wrap">
                    <UserRound size={18} aria-hidden="true" />
                    <input
                      name="name"
                      autoComplete="name"
                      placeholder={auth.form.namePlaceholder}
                      required
                      onChange={() => error && setError('')}
                    />
                  </span>
                </label>
              )}

              <label className="nx-auth__field">
                <span>{auth.form.emailLabel}</span>
                <span className="nx-auth__input-wrap">
                  <Mail size={18} aria-hidden="true" />
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={auth.form.emailPlaceholder}
                    dir="ltr"
                    required
                    aria-describedby={error ? 'auth-form-error' : undefined}
                    onChange={() => error && setError('')}
                  />
                </span>
              </label>

              <label className="nx-auth__field">
                <span className="nx-auth__password-label">
                  <span>{auth.form.passwordLabel}</span>
                  {mode === 'login' && <a href="mailto:hello@nexa.live?subject=Password%20reset">{auth.form.forgotPassword}</a>}
                </span>
                <span className="nx-auth__input-wrap">
                  <LockKeyhole size={18} aria-hidden="true" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    placeholder={auth.form.passwordPlaceholder}
                    dir="ltr"
                    required
                    aria-describedby={error ? 'auth-form-error' : undefined}
                    onChange={() => error && setError('')}
                  />
                  <button
                    type="button"
                    className="nx-auth__password-toggle"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? auth.form.hidePassword : auth.form.showPassword}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </span>
              </label>

              {mode === 'register' && <p className="nx-auth__password-hint"><Check size={14} aria-hidden="true" /> {auth.form.passwordHint}</p>}

              {error && <p className="nx-auth__error" id="auth-form-error" role="alert"><span><CircleAlert size={17} aria-hidden="true" /></span>{error}</p>}

              <button className="nx-auth__submit" type="submit" disabled={pending}>
                <span>{pending ? auth.status.pending : content.action}</span>
                {pending ? <span className="nx-auth__spinner" aria-hidden="true" /> : <ArrowLeft size={19} aria-hidden="true" />}
              </button>
            </form>

            <div className="nx-auth__form-footnote">
              <span><ShieldCheck size={15} aria-hidden="true" /> {auth.form.protectedInfo}</span>
              {mode === 'login' ? (
                <button type="button" onClick={() => selectMode('register')}>{content.accountPrompt} <b>{content.accountAction}</b></button>
              ) : (
                <button type="button" onClick={() => selectMode('login')}>{content.accountPrompt} <b>{content.accountAction}</b></button>
              )}
            </div>

            <p className="nx-auth__legal">{auth.form.legalBefore} <Link to="/legal">{auth.links.legalLink}</Link> {auth.form.legalAfter}</p>
            {!apiEnabled && <p className="nx-auth__demo-hint"><Sparkles size={14} aria-hidden="true" /> {auth.form.demoNotice}</p>}
          </div>
        </div>
      </section>
    </main>
  )
}
