import { AlertCircle, RefreshCw, SearchX } from 'lucide-react'
import type { ReactNode } from 'react'
import { useLanguage } from '../i18n'

type StatePanelProps = {
  type: 'empty' | 'error'
  title: string
  description: string
  action?: ReactNode
}

export const StatePanel = ({ type, title, description, action }: StatePanelProps) => (
  <section className={`state-panel state-panel--${type}`} aria-live="polite">
    <span className="state-panel__icon" aria-hidden="true">
      {type === 'empty' ? <SearchX size={28} /> : <AlertCircle size={28} />}
    </span>
    <h2>{title}</h2>
    <p>{description}</p>
    {action}
  </section>
)

export const EventSkeletons = () => {
  const { t } = useLanguage()
  return <div className="event-grid" aria-label={t('common.loading')}>
    {Array.from({ length: 6 }).map((_, index) => (
      <div className="event-card event-card--skeleton" key={index}>
        <div className="skeleton skeleton--image" />
        <div className="event-card__content">
          <div className="skeleton skeleton--line skeleton--short" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line skeleton--medium" />
        </div>
      </div>
    ))}
  </div>
}

export const RefreshButton = ({ onClick }: { onClick: () => void }) => {
  const { t } = useLanguage()
  return <button className="button button--secondary" type="button" onClick={onClick}>
    <RefreshCw size={17} /> {t('listing.retry')}
  </button>
}
