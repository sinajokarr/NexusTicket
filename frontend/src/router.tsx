import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

type LocationState = { pathname: string; search: string }
type RouterContextValue = LocationState & { navigate: (to: string, replace?: boolean) => void }
type RouteContextValue = Record<string, string | undefined>
type RouteProps = { path: string; element: ReactNode }

const RouterContext = createContext<RouterContextValue | null>(null)
const RouteContext = createContext<RouteContextValue>({})

const tidyPath = (value: string) => (value.replace(/\/$/, '') || '/')
const basePath = tidyPath(import.meta.env.BASE_URL)
const stripBasePath = (pathname: string) => {
  if (basePath === '/') return tidyPath(pathname)
  const withoutBase = pathname === basePath || pathname === `${basePath}/`
    ? '/'
    : pathname.startsWith(`${basePath}/`)
      ? pathname.slice(basePath.length)
      : pathname
  return tidyPath(withoutBase)
}
const withBasePath = (pathname: string) => basePath === '/' ? pathname : `${basePath}${pathname === '/' ? '' : pathname}`
const getLocation = (): LocationState => ({ pathname: stripBasePath(window.location.pathname), search: window.location.search })

const matchRoute = (pattern: string, pathname: string): RouteContextValue | null => {
  if (pattern === '*') return {}
  const patternParts = tidyPath(pattern).split('/').filter(Boolean)
  const pathParts = tidyPath(pathname).split('/').filter(Boolean)
  if (patternParts.length !== pathParts.length) return null
  const params: RouteContextValue = {}
  for (let index = 0; index < patternParts.length; index += 1) {
    const part = patternParts[index]
    const value = pathParts[index]
    if (part.startsWith(':')) params[part.slice(1)] = decodeURIComponent(value)
    else if (part !== value) return null
  }
  return params
}

export const BrowserRouter = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<LocationState>(getLocation)
  const navigate = useCallback((to: string, replace = false) => {
    const url = new URL(to, window.location.origin)
    if (url.origin !== window.location.origin) {
      window.location.assign(to)
      return
    }
    const next = `${withBasePath(url.pathname)}${url.search}${url.hash}`
    if (replace) window.history.replaceState({}, '', next)
    else window.history.pushState({}, '', next)
    setLocation(getLocation())
  }, [])

  useEffect(() => {
    const sync = () => setLocation(getLocation())
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  const value = useMemo(() => ({ ...location, navigate }), [location, navigate])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

const useRouter = () => {
  const context = useContext(RouterContext)
  if (!context) throw new Error('Router hooks must be used inside BrowserRouter.')
  return context
}

export const Link = ({ to, onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => {
  const { navigate } = useRouter()
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented || props.target === '_blank' || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate(to)
  }
  const href = to.startsWith('/') ? withBasePath(to) : to
  return <a href={href} onClick={handleClick} {...props} />
}

export const NavLink = ({ className, to, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => {
  const { pathname, search } = useRouter()
  const target = new URL(to, window.location.origin)
  const isActive = tidyPath(pathname) === tidyPath(target.pathname)
    && (!target.search || target.search === search)
  return <Link to={to} className={[className, isActive ? 'active' : ''].filter(Boolean).join(' ')} {...props} />
}

export const useLocation = () => {
  const { pathname, search } = useRouter()
  return { pathname, search }
}

export const useNavigate = () => useRouter().navigate

export const useParams = <T extends Record<string, string | undefined> = Record<string, string | undefined>>() =>
  useContext(RouteContext) as T

export const useSearchParams = () => {
  const { pathname, search, navigate } = useRouter()
  const params = useMemo(() => new URLSearchParams(search), [search])
  const setParams = (next: URLSearchParams | Record<string, string>) => {
    const value = next instanceof URLSearchParams ? next : new URLSearchParams(next)
    const query = value.toString()
    navigate(`${pathname}${query ? `?${query}` : ''}`)
  }
  return [params, setParams] as const
}

export const Route = (_: RouteProps) => null

export const Routes = ({ children }: { children: ReactNode }) => {
  const { pathname } = useRouter()
  const candidates = Children.toArray(children).filter(isValidElement) as ReactElement<RouteProps>[]
  const matched = candidates.find((candidate) => matchRoute(candidate.props.path, pathname) !== null)
  if (!matched) return null
  const params = matchRoute(matched.props.path, pathname) ?? {}
  return <RouteContext.Provider value={params}>{matched.props.element}</RouteContext.Provider>
}
