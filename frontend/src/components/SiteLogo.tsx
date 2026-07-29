import { Ticket } from 'lucide-react'
import { useLanguage } from '../i18n'
import { Link } from '../router'

export const SiteLogo = ({ inverted = false }: { inverted?: boolean }) => {
  const { t } = useLanguage()
  return <Link className={`site-logo${inverted ? ' site-logo--inverted' : ''}`} to="/" aria-label={`NEXA — ${t('common.home')}`}>
    <span className="site-logo__mark" aria-hidden="true"><Ticket size={20} strokeWidth={2.4} /></span>
    <span>NEXA</span>
  </Link>
}
