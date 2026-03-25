import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

type Props = {
  kicker?: string
  title: string
  subtitle?: string
  onBack?: () => void
  showBack?: boolean
  rightSlot?: ReactNode
  flatBottom?: boolean
}

export function ScreenHeader({ kicker, title, subtitle, onBack, showBack = true, rightSlot, flatBottom }: Props) {
  const navigate = useNavigate()
  const handleBack = onBack ?? (() => navigate(-1))

  return (
    <header className={`campus-screen-header${flatBottom ? ' campus-screen-header--flat-bottom' : ''}`}>
      <div className="campus-screen-header__row">
        {showBack ? (
          <button type="button" className="campus-icon-btn" onClick={handleBack} aria-label="Geri">
            <ArrowLeft size={22} />
          </button>
        ) : (
          <div style={{ width: 40 }} aria-hidden />
        )}
        <div className="campus-screen-header__text">
          {kicker ? <span className="campus-kicker">{kicker}</span> : null}
          <h1 className="campus-screen-title">{title}</h1>
          {subtitle ? <p className="campus-screen-sub">{subtitle}</p> : null}
        </div>
        {rightSlot ? <div style={{ flexShrink: 0 }}>{rightSlot}</div> : <div style={{ width: 40 }} aria-hidden />}
      </div>
    </header>
  )
}
