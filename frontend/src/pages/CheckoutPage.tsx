import { CheckCircle2, ChevronLeft, Clock3, CreditCard, LockKeyhole, Minus, Plus, ShieldCheck, Ticket, Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from '../router'
import { useApp } from '../context/AppContext'
import { type Locale, localeMeta, useLanguage } from '../i18n'
import { apiEnabled, getAuthScope, orderApi } from '../lib/api'
import { classNames, formatNumber, formatPrice } from '../lib/format'

type CheckoutExtraCopy = {
  couponSuccess: string
  couponPending: string
  couponInvalid: string
  invalidContact: string
  completeToast: string
  failed: string
  paymentConfirmed: string
  paymentPending: string
  paymentUnconfirmed: string
  paymentCanceled: string
  fullNamePlaceholder: string
  phonePlaceholder: string
  couponPlaceholder: string
  decrease: string
  increase: string
  remove: string
}

const checkoutExtra: Record<Locale, CheckoutExtraCopy> = {
  en: {
    couponSuccess: 'Your 10% Nexa discount is applied.',
    couponPending: 'Your code will be verified securely with the reservation.',
    couponInvalid: 'That code did not work. For this demo, try NEXA10.',
    invalidContact: 'Enter a valid email address and mobile number to continue.',
    completeToast: 'Your demo reservation has been confirmed.',
    failed: 'We could not complete the reservation. Please try again.',
    paymentConfirmed: 'Your secure payment was confirmed. Your reservation is now in your account.',
    paymentPending: 'Your payment is still being confirmed. Check your reservations again in a moment.',
    paymentUnconfirmed: 'We could not confirm the payment status yet. Please check your reservations before trying again.',
    paymentCanceled: 'This payment was not completed. You can try again with a new reservation.',
    fullNamePlaceholder: 'e.g. Maya Wilson',
    phonePlaceholder: '+1 212 555 0148',
    couponPlaceholder: 'Enter code',
    decrease: 'Decrease quantity',
    increase: 'Increase quantity',
    remove: 'Remove',
  },
  fa: {
    couponSuccess: '۱۰٪ تخفیف نکسا برای شما اعمال شد.',
    couponPending: 'کد شما هنگام ثبت امن رزرو بررسی می‌شود.',
    couponInvalid: 'این کد معتبر نیست. برای نسخهٔ نمایشی NEXA10 را امتحان کنید.',
    invalidContact: 'برای ادامه، ایمیل و شمارهٔ همراه معتبر وارد کنید.',
    completeToast: 'رزرو نمایشی شما با موفقیت ثبت شد.',
    failed: 'رزرو انجام نشد. لطفاً دوباره تلاش کنید.',
    paymentConfirmed: 'پرداخت امن شما تأیید شد و رزرو در حسابتان قرار گرفت.',
    paymentPending: 'پرداخت شما هنوز در حال تأیید است. کمی بعد رزروهایتان را دوباره بررسی کنید.',
    paymentUnconfirmed: 'فعلاً نتوانستیم وضعیت پرداخت را تأیید کنیم. پیش از تلاش دوباره، رزروهایتان را بررسی کنید.',
    paymentCanceled: 'این پرداخت کامل نشد. می‌توانید با یک رزرو تازه دوباره تلاش کنید.',
    fullNamePlaceholder: 'مثلاً مایا ویلسون',
    phonePlaceholder: '+۱ ۲۱۲ ۵۵۵ ۰۱۴۸',
    couponPlaceholder: 'کد را وارد کنید',
    decrease: 'کاهش تعداد',
    increase: 'افزایش تعداد',
    remove: 'حذف',
  },
  ru: {
    couponSuccess: 'Ваша скидка Nexa 10% применена.',
    couponPending: 'Ваш код будет безопасно проверен вместе с бронированием.',
    couponInvalid: 'Этот код не сработал. Для демо попробуйте NEXA10.',
    invalidContact: 'Введите корректные email и номер телефона, чтобы продолжить.',
    completeToast: 'Демо-бронирование подтверждено.',
    failed: 'Не удалось завершить бронирование. Попробуйте ещё раз.',
    paymentConfirmed: 'Безопасная оплата подтверждена. Бронирование появилось в аккаунте.',
    paymentPending: 'Оплата ещё подтверждается. Проверьте бронирования через некоторое время.',
    paymentUnconfirmed: 'Пока не удалось подтвердить статус оплаты. Проверьте бронирования перед новой попыткой.',
    paymentCanceled: 'Эта оплата не была завершена. Создайте новое бронирование и попробуйте снова.',
    fullNamePlaceholder: 'например, Майя Уилсон',
    phonePlaceholder: '+1 212 555 0148',
    couponPlaceholder: 'Введите код',
    decrease: 'Уменьшить количество',
    increase: 'Увеличить количество',
    remove: 'Удалить',
  },
  tr: {
    couponSuccess: '%10 Nexa indiriminiz uygulandı.',
    couponPending: 'Kodunuz rezervasyonla birlikte güvenli şekilde doğrulanacak.',
    couponInvalid: 'Bu kod çalışmadı. Demo için NEXA10 deneyin.',
    invalidContact: 'Devam etmek için geçerli bir e-posta ve cep telefonu numarası girin.',
    completeToast: 'Demo rezervasyonunuz onaylandı.',
    failed: 'Rezervasyon tamamlanamadı. Lütfen tekrar deneyin.',
    paymentConfirmed: 'Güvenli ödemeniz onaylandı. Rezervasyonunuz hesabınızda.',
    paymentPending: 'Ödemeniz hâlâ onaylanıyor. Biraz sonra rezervasyonlarınızı tekrar kontrol edin.',
    paymentUnconfirmed: 'Ödeme durumunu henüz doğrulayamadık. Yeniden denemeden önce rezervasyonlarınızı kontrol edin.',
    paymentCanceled: 'Bu ödeme tamamlanmadı. Yeni bir rezervasyonla tekrar deneyebilirsiniz.',
    fullNamePlaceholder: 'ör. Maya Wilson',
    phonePlaceholder: '+1 212 555 0148',
    couponPlaceholder: 'Kodu girin',
    decrease: 'Adedi azalt',
    increase: 'Adedi artır',
    remove: 'Kaldır',
  },
}

const pad = (number: number, locale: Locale) => number.toLocaleString(localeMeta[locale].intl, { minimumIntegerDigits: 2, useGrouping: false })

type PendingPayment = { orderId: number; createdAt: number }

const pendingPaymentKey = () => `nexus-pending-payment:${getAuthScope()}`

const readPendingPayment = (): PendingPayment | null => {
  try {
    const value = JSON.parse(sessionStorage.getItem(pendingPaymentKey()) ?? 'null') as Partial<PendingPayment> | null
    return typeof value?.orderId === 'number' ? { orderId: value.orderId, createdAt: Number(value.createdAt ?? Date.now()) } : null
  } catch {
    return null
  }
}

const writePendingPayment = (payment: PendingPayment | null) => {
  try {
    if (payment) sessionStorage.setItem(pendingPaymentKey(), JSON.stringify(payment))
    else sessionStorage.removeItem(pendingPaymentKey())
  } catch {
    // Payment verification still remains server-authoritative if session storage is unavailable.
  }
}

export const CheckoutPage = () => {
  const { cart, cartTotal, clearCart, removeFromCart, showToast, updateQuantity } = useApp()
  const { locale, t } = useLanguage()
  const extra = checkoutExtra[locale]
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponPending, setCouponPending] = useState(false)
  const [couponMessage, setCouponMessage] = useState('')
  const [minutesLeft, setMinutesLeft] = useState(15 * 60)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successText, setSuccessText] = useState('')
  const [formError, setFormError] = useState('')
  const [paymentNotice, setPaymentNotice] = useState('')

  useEffect(() => {
    const timer = window.setInterval(() => setMinutesLeft((seconds) => Math.max(seconds - 1, 0)), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const pendingPayment = apiEnabled ? readPendingPayment() : null
    if (!pendingPayment) return
    let isCurrent = true
    void orderApi.list().then((orders) => {
      if (!isCurrent) return
      const order = orders.find((item) => item.id === pendingPayment.orderId)
      if (order?.status === 'paid') {
        writePendingPayment(null)
        clearCart()
        setSuccessText(extra.paymentConfirmed)
        setSuccess(true)
        return
      }
      if (order?.status === 'canceled') {
        writePendingPayment(null)
        setPaymentNotice(extra.paymentCanceled)
        return
      }
      setPaymentNotice(extra.paymentPending)
    }).catch(() => {
      if (isCurrent) setPaymentNotice(extra.paymentUnconfirmed)
    })
    return () => { isCurrent = false }
  }, [clearCart, extra.paymentCanceled, extra.paymentConfirmed, extra.paymentPending, extra.paymentUnconfirmed])

  const discount = couponApplied ? Math.round(cartTotal * 0.1) : 0
  const total = Math.max(cartTotal - discount, 0)
  const timerText = `${pad(Math.floor(minutesLeft / 60), locale)}:${pad(minutesLeft % 60, locale)}`

  const applyCoupon = () => {
    if (apiEnabled) {
      const hasCode = Boolean(coupon.trim())
      setCouponApplied(false)
      setCouponPending(hasCode)
      setCouponMessage(hasCode ? extra.couponPending : '')
      return
    }
    if (coupon.trim().toUpperCase() === 'NEXA10') {
      setCouponApplied(true)
      setCouponPending(false)
      setCouponMessage(extra.couponSuccess)
      return
    }
    setCouponApplied(false)
    setCouponPending(false)
    setCouponMessage(extra.couponInvalid)
  }

  const completeReservation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email') ?? '')
    const phone = String(data.get('phone') ?? '')
    if (!email.includes('@') || phone.replace(/\D/g, '').length < 10) {
      setFormError(extra.invalidContact)
      return
    }
    if (!cart.length) return
    setFormError('')
    setSubmitting(true)
    try {
      if (apiEnabled) {
        const order = await orderApi.create(
          cart.map((item) => ({ ticketClassId: item.ticket.id, quantity: item.quantity })),
          coupon.trim() || undefined,
        )
        const payment = await orderApi.requestPayment(order.id)
        writePendingPayment({ orderId: order.id, createdAt: Date.now() })
        window.location.assign(payment.paymentUrl)
        return
      }
      await new Promise((resolve) => window.setTimeout(resolve, 650))
      setSuccess(true)
      clearCart()
      showToast(extra.completeToast)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : extra.failed)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) return <main id="main-content" className="page-shell checkout-success"><div className="success-card"><span><CheckCircle2 size={42} /></span><span className="eyebrow">{t('checkout.successEyebrow')}</span><h1>{t('checkout.successTitle')}</h1><p>{successText || t('checkout.successText')}</p><div className="success-card__code"><small>{t('checkout.reference')}</small><strong>NX-{Math.floor(100000 + Math.random() * 899999).toLocaleString(localeMeta[locale].intl)}</strong></div><Link className="button button--primary" to="/account">{t('checkout.account')} <ChevronLeft size={18} /></Link></div></main>

  if (!cart.length) return <main id="main-content" className="page-shell checkout-success"><div className="success-card"><span><Ticket size={40} /></span><span className="eyebrow">{t('checkout.emptyEyebrow')}</span><h1>{t('checkout.emptyTitle')}</h1><p>{t('checkout.emptyText')}</p><Link className="button button--primary" to="/events">{t('common.explore')}</Link></div></main>

  return (
    <main id="main-content" className="page-shell checkout-page">
      <div className="container checkout-header"><div><Link className="back-link" to="/events">← {t('checkout.backToExplore')}</Link><h1>{t('checkout.title')}</h1><p>{t('checkout.subtitle')}</p></div><div className={classNames('reservation-timer', minutesLeft < 120 && 'is-urgent')}><Clock3 size={18} /><div><small>{t('checkout.timer')}</small><strong>{timerText}</strong></div></div></div>
      {paymentNotice && <div className="container"><p className="checkout-terms">{paymentNotice}</p></div>}
      <div className="container checkout-layout">
        <form className="checkout-form" onSubmit={completeReservation} noValidate>
          <section className="checkout-section"><header><span>1</span><div><h2>{t('checkout.recipient')}</h2><p>{t('checkout.recipientDescription')}</p></div></header><div className="form-grid"><label>{t('checkout.fullName')}<input name="name" autoComplete="name" placeholder={extra.fullNamePlaceholder} required /></label><label>{t('checkout.phone')}<input name="phone" inputMode="tel" autoComplete="tel" placeholder={extra.phonePlaceholder} required /></label><label className="form-grid__full">{t('checkout.email')}<input name="email" type="email" autoComplete="email" placeholder="hello@example.com" dir="ltr" required /></label></div></section>
          <section className="checkout-section"><header><span>2</span><div><h2>{t('checkout.payment')}</h2><p>{t('checkout.paymentDescription')}</p></div></header><label className="payment-method is-selected"><input type="radio" name="payment" defaultChecked /><span className="payment-method__radio" /><span className="payment-method__icon"><CreditCard size={22} /></span><span><strong>{t('checkout.online')}</strong><small>{t('checkout.cards')}</small></span><span className="payment-method__secure"><LockKeyhole size={14} /> {t('checkout.secure')}</span></label></section>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <button className="button button--primary button--large checkout-submit" type="submit" disabled={submitting || minutesLeft === 0}>{submitting ? t('checkout.preparing') : t('checkout.pay', { price: formatPrice(total, locale) })}</button>
          <p className="checkout-terms">{t('checkout.terms')} <Link to="/legal">{t('footer.legal')}</Link></p>
        </form>
        <aside className="order-summary"><header><h2>{t('checkout.summary')}</h2><span>{formatNumber(cart.length, locale)} {t('checkout.item')}</span></header><div className="order-summary__items">{cart.map((item) => <article className="order-item" key={item.ticket.id}><img src={item.event.cover_image} alt="" /><div><h3>{item.event.title}</h3><p>{item.ticket.title}</p><strong>{formatPrice(item.ticket.price, locale)}</strong><div className="quantity-stepper"><button type="button" onClick={() => updateQuantity(item.ticket.id, item.quantity - 1)} aria-label={extra.decrease}><Minus size={13} /></button><span>{formatNumber(item.quantity, locale)}</span><button type="button" onClick={() => updateQuantity(item.ticket.id, item.quantity + 1)} disabled={item.quantity >= item.ticket.remaining_capacity} aria-label={extra.increase}><Plus size={13} /></button></div></div><button className="order-item__delete" type="button" onClick={() => removeFromCart(item.ticket.id)} aria-label={`${extra.remove} ${item.event.title}`}><Trash2 size={17} /></button></article>)}</div><div className="coupon-field"><label htmlFor="coupon">{t('checkout.coupon')}</label><div><input id="coupon" value={coupon} onChange={(event) => { setCoupon(event.target.value); setCouponApplied(false); setCouponPending(false); setCouponMessage('') }} placeholder={extra.couponPlaceholder} dir="ltr" /><button type="button" onClick={applyCoupon}>{t('checkout.apply')}</button></div>{couponMessage && <p className={couponApplied || couponPending ? 'is-success' : 'is-error'}>{couponMessage}</p>}</div><div className="order-totals"><div><span>{t('checkout.subtotal')}</span><strong>{formatPrice(cartTotal, locale)}</strong></div>{couponApplied && <div className="order-totals__discount"><span>{t('checkout.discount')}</span><strong>− {formatPrice(discount, locale)}</strong></div>}<div className="order-totals__final"><span>{t('checkout.final')}</span><strong>{formatPrice(total, locale)}</strong></div></div><p className="order-summary__trust"><ShieldCheck size={16} /> {t('checkout.priceNote')}</p></aside>
      </div>
    </main>
  )
}
