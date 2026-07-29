import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  Mail,
  MapPin,
  MessageCircleQuestion,
  Phone,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { type Locale, useLanguage } from '../i18n'
import { Link } from '../router'

type ValueCopy = {
  title: string
  description: string
}

type StatCopy = {
  value: string
  label: string
}

type LegalSectionCopy = {
  id: 'purchase' | 'privacy' | 'refund' | 'support'
  title: string
  description: string
}

type InfoPageCopy = {
  about: {
    eyebrow: string
    heroLead: string
    heroAccent: string
    heroDescription: string
    imageAlt: string
    storyEyebrow: string
    storyTitle: string
    storyDescription: string
    values: ValueCopy[]
    stats: StatCopy[]
    ctaEyebrow: string
    ctaLead: string
    ctaAccent: string
    ctaAction: string
  }
  contact: {
    eyebrow: string
    heroLead: string
    heroAccent: string
    heroDescription: string
    supportLabel: string
    emailLabel: string
    hoursLabel: string
    hoursValue: string
    workplaceLabel: string
    workplaceValue: string
    formEyebrow: string
    formTitle: string
    nameLabel: string
    namePlaceholder: string
    emailFieldLabel: string
    subjectLabel: string
    subjectPlaceholder: string
    subjects: string[]
    messageLabel: string
    messagePlaceholder: string
    submit: string
    sentTitle: string
    sentDescription: string
    sendAnother: string
  }
  legal: {
    eyebrow: string
    title: string
    updated: string
    contentsTitle: string
    sections: LegalSectionCopy[]
  }
  notFound: {
    titleLead: string
    titleAccent: string
    description: string
    homeAction: string
    eventsAction: string
  }
}

const infoCopy: Record<Locale, InfoPageCopy> = {
  en: {
    about: {
      eyebrow: 'About Nexa',
      heroLead: 'We make it easier to find reasons to',
      heroAccent: 'go out.',
      heroDescription: 'Nexa began with a simple belief: discovering a good experience should feel clear, not fragmented or uncertain.',
      imageAlt: 'Guests enjoying a live performance',
      storyEyebrow: 'Why Nexa',
      storyTitle: 'Your time belongs to the experience.',
      storyDescription: 'We work with trusted organizers, present the essential details plainly, and keep booking focused—so you can spend less time comparing ticket pages and more time being there.',
      values: [
        { title: 'Clear', description: 'Prices and terms before you pay' },
        { title: 'Considered', description: 'Help that stays close when needed' },
        { title: 'Human', description: 'Built for people, not metrics' },
      ],
      stats: [
        { value: '01', label: 'One place to discover' },
        { value: '02', label: 'A clearer way to reserve' },
        { value: '03', label: 'Tickets close at hand' },
        { value: '04', label: 'Support when it matters' },
      ],
      ctaEyebrow: 'A fresh plan',
      ctaLead: 'See what is happening',
      ctaAccent: 'this week.',
      ctaAction: 'Explore events',
    },
    contact: {
      eyebrow: 'Contact Nexa',
      heroLead: 'Questions worth asking',
      heroAccent: 'deserve real answers.',
      heroDescription: 'Our support team is here every day to make your next booking easier.',
      supportLabel: 'Talk to support',
      emailLabel: 'Email us',
      hoursLabel: 'Response hours',
      hoursValue: 'Every day · 09:00–22:00 UTC',
      workplaceLabel: 'Where we work',
      workplaceValue: 'Remote-first · helping guests worldwide',
      formEyebrow: 'Contact form',
      formTitle: 'How can we help?',
      nameLabel: 'Full name',
      namePlaceholder: 'Your name',
      emailFieldLabel: 'Email',
      subjectLabel: 'Subject',
      subjectPlaceholder: 'Choose a subject',
      subjects: ['Question about a booking', 'Payment follow-up', 'Partner with Nexa', 'Feedback'],
      messageLabel: 'Your message',
      messagePlaceholder: 'Tell us a little more about what you need…',
      submit: 'Send message',
      sentTitle: 'Your message is with us.',
      sentDescription: 'A member of our team will reply as soon as possible.',
      sendAnother: 'Send another message',
    },
    legal: {
      eyebrow: 'Clear by design',
      title: 'Terms & Privacy',
      updated: 'Last updated: July 29, 2026',
      contentsTitle: 'On this page',
      sections: [
        {
          id: 'purchase',
          title: 'Booking & purchases',
          description: 'Nexa helps guests discover and reserve events from trusted organizers. Once payment is confirmed, your reservation is issued as a digital ticket with the applicable event details. Guests are responsible for arriving on time and following the venue’s published rules.',
        },
        {
          id: 'privacy',
          title: 'Privacy',
          description: 'We collect only the information needed to manage your reservation, deliver your ticket, and improve the experience. We do not sell personal information or share it with third parties without a valid reason or your permission.',
        },
        {
          id: 'refund',
          title: 'Cancellations & refunds',
          description: 'Each event follows the organizer’s own cancellation and refund policy, which is presented before payment. If an organizer cancels an event, the refund process begins under that policy.',
        },
        {
          id: 'support',
          title: 'Support',
          description: 'If you need help with a reservation, payment, or digital ticket, contact the Nexa support team through the contact page.',
        },
      ],
    },
    notFound: {
      titleLead: 'This page has',
      titleAccent: 'left the stage.',
      description: 'It may have ended, moved, or never been here in the first place.',
      homeAction: 'Back to home',
      eventsAction: 'Browse events',
    },
  },
  fa: {
    about: {
      eyebrow: 'دربارهٔ نکسا',
      heroLead: 'پیدا کردنِ بهانه‌های خوب برای',
      heroAccent: 'بیرون رفتن را آسان‌تر می‌کنیم.',
      heroDescription: 'نکسا از یک باور ساده شروع شد: پیدا کردن یک تجربهٔ خوب باید روشن و بی‌دردسر باشد، نه پراکنده و مبهم.',
      imageAlt: 'مهمانان در حال لذت بردن از یک اجرای زنده',
      storyEyebrow: 'چرا نکسا؟',
      storyTitle: 'وقتِ شما برای خودِ تجربه است.',
      storyDescription: 'با برگزارکننده‌های قابل اعتماد همکاری می‌کنیم، جزئیات مهم را روشن می‌نویسیم و مسیر رزرو را متمرکز نگه می‌داریم؛ تا کمتر زمانتان صرف مقایسهٔ صفحه‌های بلیت شود و بیشتر در لحظه باشید.',
      values: [
        { title: 'شفاف', description: 'قیمت و شرایط پیش از پرداخت' },
        { title: 'دقیق', description: 'کمکِ نزدیک، وقتی لازم است' },
        { title: 'انسانی', description: 'برای آدم‌ها، نه فقط آمارها' },
      ],
      stats: [
        { value: '۰۱', label: 'یک جا برای کشف کردن' },
        { value: '۰۲', label: 'یک راه روشن‌تر برای رزرو' },
        { value: '۰۳', label: 'بلیت‌ها همیشه نزدیک شما' },
        { value: '۰۴', label: 'پشتیبانی در زمان لازم' },
      ],
      ctaEyebrow: 'یک برنامهٔ تازه',
      ctaLead: 'ببینید این هفته',
      ctaAccent: 'چه خبر است.',
      ctaAction: 'کشف رویدادها',
    },
    contact: {
      eyebrow: 'تماس با نکسا',
      heroLead: 'هر پرسشی که مهم است،',
      heroAccent: 'پاسخی واقعی می‌خواهد.',
      heroDescription: 'تیم پشتیبانی ما هر روز آماده است تا مسیر رزرو بعدی‌تان را ساده‌تر کند.',
      supportLabel: 'تماس با پشتیبانی',
      emailLabel: 'ایمیل به ما',
      hoursLabel: 'ساعت پاسخ‌گویی',
      hoursValue: 'هر روز · ۰۹:۰۰ تا ۲۲:۰۰ به‌وقت UTC',
      workplaceLabel: 'محل کار ما',
      workplaceValue: 'دورکار · همراه مهمانان در سراسر جهان',
      formEyebrow: 'فرم تماس',
      formTitle: 'چطور می‌توانیم کمک کنیم؟',
      nameLabel: 'نام و نام خانوادگی',
      namePlaceholder: 'نام شما',
      emailFieldLabel: 'ایمیل',
      subjectLabel: 'موضوع',
      subjectPlaceholder: 'یک موضوع انتخاب کنید',
      subjects: ['پرسش دربارهٔ رزرو', 'پیگیری پرداخت', 'همکاری با نکسا', 'پیشنهاد یا بازخورد'],
      messageLabel: 'پیام شما',
      messagePlaceholder: 'کمی بیشتر دربارهٔ چیزی که نیاز دارید بنویسید…',
      submit: 'ارسال پیام',
      sentTitle: 'پیام شما به دست ما رسید.',
      sentDescription: 'یکی از همکاران ما در اولین فرصت پاسخ می‌دهد.',
      sendAnother: 'ارسال پیام دیگر',
    },
    legal: {
      eyebrow: 'شفاف از ابتدا',
      title: 'قوانین و حریم خصوصی',
      updated: 'آخرین به‌روزرسانی: ۲۹ ژوئیهٔ ۲۰۲۶',
      contentsTitle: 'در این صفحه',
      sections: [
        {
          id: 'purchase',
          title: 'رزرو و خرید',
          description: 'نکسا به مهمانان کمک می‌کند رویدادهای برگزارکنندگان قابل اعتماد را کشف و رزرو کنند. پس از تأیید پرداخت، رزرو شما به بلیت دیجیتال با جزئیات مرتبط با رویداد تبدیل می‌شود. حضور به‌موقع و رعایت مقررات منتشرشدهٔ محل برگزاری بر عهدهٔ مهمان است.',
        },
        {
          id: 'privacy',
          title: 'حریم خصوصی',
          description: 'فقط اطلاعاتی را جمع‌آوری می‌کنیم که برای مدیریت رزرو، ارسال بلیت و بهتر کردن تجربه لازم است. اطلاعات شخصی شما را نمی‌فروشیم و بدون دلیل معتبر یا اجازهٔ شما با اشخاص ثالث به اشتراک نمی‌گذاریم.',
        },
        {
          id: 'refund',
          title: 'لغو و بازگشت وجه',
          description: 'هر رویداد از سیاست لغو و بازگشت وجه برگزارکننده پیروی می‌کند و این شرایط پیش از پرداخت نمایش داده می‌شود. اگر برگزارکننده رویدادی را لغو کند، فرایند بازگشت وجه مطابق همان سیاست آغاز می‌شود.',
        },
        {
          id: 'support',
          title: 'پشتیبانی',
          description: 'اگر برای رزرو، پرداخت یا بلیت دیجیتال خود به کمک نیاز دارید، از طریق صفحهٔ تماس با تیم پشتیبانی نکسا در ارتباط باشید.',
        },
      ],
    },
    notFound: {
      titleLead: 'انگار این صفحه',
      titleAccent: 'از صحنه پایین رفته است.',
      description: 'شاید تمام شده، جابه‌جا شده یا از ابتدا هم اینجا نبوده است.',
      homeAction: 'بازگشت به خانه',
      eventsAction: 'دیدن رویدادها',
    },
  },
  ru: {
    about: {
      eyebrow: 'О Nexa',
      heroLead: 'Мы помогаем находить причины',
      heroAccent: 'выйти из дома.',
      heroDescription: 'Nexa началась с простой идеи: искать хорошее событие должно быть понятно, а не разрозненно и тревожно.',
      imageAlt: 'Гости на живом выступлении',
      storyEyebrow: 'Почему Nexa',
      storyTitle: 'Ваше время — для самого впечатления.',
      storyDescription: 'Мы работаем с надёжными организаторами, ясно показываем важные детали и делаем бронирование собранным — чтобы вы тратили меньше времени на сравнение билетов и больше на сам момент.',
      values: [
        { title: 'Прозрачно', description: 'Цены и условия до оплаты' },
        { title: 'Внимательно', description: 'Помощь рядом, когда нужна' },
        { title: 'По-человечески', description: 'Для людей, а не только метрик' },
      ],
      stats: [
        { value: '01', label: 'Одно место для открытий' },
        { value: '02', label: 'Более ясный путь к бронированию' },
        { value: '03', label: 'Билеты всегда под рукой' },
        { value: '04', label: 'Поддержка в важный момент' },
      ],
      ctaEyebrow: 'Новый план',
      ctaLead: 'Посмотрите, что происходит',
      ctaAccent: 'на этой неделе.',
      ctaAction: 'Открыть события',
    },
    contact: {
      eyebrow: 'Связаться с Nexa',
      heroLead: 'Хорошие вопросы',
      heroAccent: 'заслуживают настоящих ответов.',
      heroDescription: 'Наша команда поддержки каждый день помогает сделать следующее бронирование проще.',
      supportLabel: 'Связаться с поддержкой',
      emailLabel: 'Написать нам',
      hoursLabel: 'Часы ответа',
      hoursValue: 'Каждый день · 09:00–22:00 UTC',
      workplaceLabel: 'Как мы работаем',
      workplaceValue: 'Удалённо · помогаем гостям по всему миру',
      formEyebrow: 'Форма связи',
      formTitle: 'Чем можем помочь?',
      nameLabel: 'Полное имя',
      namePlaceholder: 'Ваше имя',
      emailFieldLabel: 'Электронная почта',
      subjectLabel: 'Тема',
      subjectPlaceholder: 'Выберите тему',
      subjects: ['Вопрос о бронировании', 'Вопрос по оплате', 'Партнёрство с Nexa', 'Отзыв или предложение'],
      messageLabel: 'Ваше сообщение',
      messagePlaceholder: 'Расскажите немного подробнее, что вам нужно…',
      submit: 'Отправить сообщение',
      sentTitle: 'Мы получили ваше сообщение.',
      sentDescription: 'Кто-то из нашей команды ответит при первой возможности.',
      sendAnother: 'Отправить ещё сообщение',
    },
    legal: {
      eyebrow: 'Ясность по умолчанию',
      title: 'Условия и конфиденциальность',
      updated: 'Последнее обновление: 29 июля 2026 г.',
      contentsTitle: 'На этой странице',
      sections: [
        {
          id: 'purchase',
          title: 'Бронирование и покупки',
          description: 'Nexa помогает гостям находить и бронировать события надёжных организаторов. После подтверждения оплаты бронирование оформляется как цифровой билет с данными события. Гость отвечает за своевременное прибытие и соблюдение опубликованных правил площадки.',
        },
        {
          id: 'privacy',
          title: 'Конфиденциальность',
          description: 'Мы собираем только данные, необходимые для управления бронированием, доставки билета и улучшения сервиса. Мы не продаём персональные данные и не передаём их третьим лицам без законной причины или вашего разрешения.',
        },
        {
          id: 'refund',
          title: 'Отмена и возврат',
          description: 'Для каждого события действует собственная политика отмены и возврата организатора, с которой можно ознакомиться до оплаты. Если организатор отменяет событие, возврат запускается в соответствии с этой политикой.',
        },
        {
          id: 'support',
          title: 'Поддержка',
          description: 'Если вам нужна помощь с бронированием, оплатой или цифровым билетом, свяжитесь с командой поддержки Nexa через страницу контактов.',
        },
      ],
    },
    notFound: {
      titleLead: 'Похоже, эта страница',
      titleAccent: 'ушла со сцены.',
      description: 'Она могла завершиться, переехать или никогда здесь не существовать.',
      homeAction: 'На главную',
      eventsAction: 'Смотреть события',
    },
  },
  tr: {
    about: {
      eyebrow: 'Nexa hakkında',
      heroLead: 'Dışarı çıkmak için iyi nedenler bulmayı',
      heroAccent: 'kolaylaştırıyoruz.',
      heroDescription: 'Nexa basit bir inançla başladı: iyi bir deneyimi keşfetmek net hissettirmeli; dağınık ya da belirsiz değil.',
      imageAlt: 'Canlı bir performansın keyfini çıkaran konuklar',
      storyEyebrow: 'Neden Nexa?',
      storyTitle: 'Zamanınız deneyimin kendisine ait.',
      storyDescription: 'Güvenilir organizatörlerle çalışır, önemli ayrıntıları açıkça sunar ve rezervasyonu odakta tutarız; böylece bilet sayfalarını karşılaştırmaya daha az, o anın içinde olmaya daha çok zaman ayırırsınız.',
      values: [
        { title: 'Açık', description: 'Ödeme öncesi fiyatlar ve koşullar' },
        { title: 'Özenli', description: 'Gerektiğinde yakın destek' },
        { title: 'İnsani', description: 'Sadece metrikler için değil, insanlar için' },
      ],
      stats: [
        { value: '01', label: 'Keşif için tek bir yer' },
        { value: '02', label: 'Rezervasyon için daha net yol' },
        { value: '03', label: 'Biletler her zaman elinizin altında' },
        { value: '04', label: 'Önemli anda destek' },
      ],
      ctaEyebrow: 'Yeni bir plan',
      ctaLead: 'Bu hafta neler olduğuna',
      ctaAccent: 'göz atın.',
      ctaAction: 'Etkinlikleri keşfet',
    },
    contact: {
      eyebrow: 'Nexa ile iletişim',
      heroLead: 'Sormaya değer sorular',
      heroAccent: 'gerçek yanıtları hak eder.',
      heroDescription: 'Destek ekibimiz bir sonraki rezervasyonunuzu kolaylaştırmak için her gün burada.',
      supportLabel: 'Destekle konuşun',
      emailLabel: 'Bize e-posta gönderin',
      hoursLabel: 'Yanıt saatleri',
      hoursValue: 'Her gün · 09:00–22:00 UTC',
      workplaceLabel: 'Nasıl çalışıyoruz',
      workplaceValue: 'Uzaktan öncelikli · dünyanın her yerindeki konuklara destek',
      formEyebrow: 'İletişim formu',
      formTitle: 'Nasıl yardımcı olabiliriz?',
      nameLabel: 'Ad soyad',
      namePlaceholder: 'Adınız',
      emailFieldLabel: 'E-posta',
      subjectLabel: 'Konu',
      subjectPlaceholder: 'Bir konu seçin',
      subjects: ['Rezervasyon sorusu', 'Ödeme takibi', 'Nexa ile ortaklık', 'Geri bildirim veya öneri'],
      messageLabel: 'Mesajınız',
      messagePlaceholder: 'İhtiyacınız olan şeyi biraz daha anlatın…',
      submit: 'Mesaj gönder',
      sentTitle: 'Mesajınız bize ulaştı.',
      sentDescription: 'Ekibimizden biri mümkün olan en kısa sürede yanıt verecek.',
      sendAnother: 'Başka bir mesaj gönder',
    },
    legal: {
      eyebrow: 'Tasarımdan gelen açıklık',
      title: 'Koşullar ve gizlilik',
      updated: 'Son güncelleme: 29 Temmuz 2026',
      contentsTitle: 'Bu sayfada',
      sections: [
        {
          id: 'purchase',
          title: 'Rezervasyon ve satın alma',
          description: 'Nexa, konukların güvenilir organizatörlerin etkinliklerini keşfetmesine ve rezerve etmesine yardımcı olur. Ödeme onaylandığında rezervasyonunuz, ilgili etkinlik ayrıntılarını içeren dijital bilet olarak düzenlenir. Konuklar zamanında gelmekten ve mekânın yayımlanmış kurallarına uymaktan sorumludur.',
        },
        {
          id: 'privacy',
          title: 'Gizlilik',
          description: 'Yalnızca rezervasyonunuzu yönetmek, biletinizi teslim etmek ve deneyimi iyileştirmek için gereken bilgileri toplarız. Kişisel bilgileri satmaz veya geçerli bir neden ya da izniniz olmadan üçüncü taraflarla paylaşmayız.',
        },
        {
          id: 'refund',
          title: 'İptal ve iade',
          description: 'Her etkinlik, ödeme öncesinde sunulan organizatörün kendi iptal ve iade politikasına tabidir. Organizatör bir etkinliği iptal ederse iade süreci bu politikaya göre başlar.',
        },
        {
          id: 'support',
          title: 'Destek',
          description: 'Rezervasyon, ödeme veya dijital bilet konusunda yardıma ihtiyacınız olursa iletişim sayfasından Nexa destek ekibine ulaşın.',
        },
      ],
    },
    notFound: {
      titleLead: 'Görünüşe göre bu sayfa',
      titleAccent: 'sahneden indi.',
      description: 'Bitmiş, taşınmış ya da belki de hiç burada olmamış olabilir.',
      homeAction: 'Ana sayfaya dön',
      eventsAction: 'Etkinlikleri gör',
    },
  },
}

const aboutValueIcons = [ShieldCheck, HeartHandshake, UsersRound]

const ForwardArrow = ({ locale }: { locale: Locale }) =>
  locale === 'fa' ? <ArrowLeft size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />

export const AboutPage = () => {
  const { locale } = useLanguage()
  const content = infoCopy[locale].about

  return (
    <main id="main-content" className="page-shell about-page">
      <section className="about-hero">
        <div className="container">
          <span className="eyebrow eyebrow--lime"><Sparkles size={15} aria-hidden="true" /> {content.eyebrow}</span>
          <h1>{content.heroLead}<br /><em>{content.heroAccent}</em></h1>
          <p>{content.heroDescription}</p>
        </div>
      </section>
      <section className="container about-story">
        <div className="about-story__image"><img src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=85" alt={content.imageAlt} /></div>
        <div>
          <span className="eyebrow">{content.storyEyebrow}</span>
          <h2>{content.storyTitle}</h2>
          <p>{content.storyDescription}</p>
          <div className="about-values">
            {content.values.map((value, index) => {
              const Icon = aboutValueIcons[index] ?? ShieldCheck
              return <div key={value.title}><Icon size={21} aria-hidden="true" /><strong>{value.title}</strong><span>{value.description}</span></div>
            })}
          </div>
        </div>
      </section>
      <section className="about-stats">
        <div className="container">{content.stats.map((stat) => <div key={stat.value}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div>
      </section>
      <section className="container about-cta">
        <div><span className="eyebrow">{content.ctaEyebrow}</span><h2>{content.ctaLead}<br />{content.ctaAccent}</h2></div>
        <Link className="button button--primary" to="/events">{content.ctaAction} <ForwardArrow locale={locale} /></Link>
      </section>
    </main>
  )
}

export const ContactPage = () => {
  const { locale } = useLanguage()
  const content = infoCopy[locale].contact
  const [sent, setSent] = useState(false)
  const send = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true) }

  return (
    <main id="main-content" className="page-shell contact-page">
      <section className="page-hero page-hero--compact">
        <div className="container"><span className="eyebrow">{content.eyebrow}</span><h1>{content.heroLead}<br />{content.heroAccent}</h1><p>{content.heroDescription}</p></div>
      </section>
      <section className="container contact-grid">
        <aside className="contact-details">
          <span className="eyebrow">{content.eyebrow}</span>
          <h2>{content.formTitle}</h2>
          <a href="tel:+12125550148"><span><Phone size={20} aria-hidden="true" /></span><div><small>{content.supportLabel}</small><strong dir="ltr">+1 (212) 555-0148</strong></div></a>
          <a href="mailto:hello@nexa.live"><span><Mail size={20} aria-hidden="true" /></span><div><small>{content.emailLabel}</small><strong dir="ltr">hello@nexa.live</strong></div></a>
          <div><span><Clock3 size={20} aria-hidden="true" /></span><div><small>{content.hoursLabel}</small><strong>{content.hoursValue}</strong></div></div>
          <div><span><MapPin size={20} aria-hidden="true" /></span><div><small>{content.workplaceLabel}</small><strong>{content.workplaceValue}</strong></div></div>
        </aside>
        <section className="contact-form-wrap">
          {sent ? (
            <div className="contact-sent" role="status">
              <span><CheckCircle2 size={34} aria-hidden="true" /></span>
              <h2>{content.sentTitle}</h2>
              <p>{content.sentDescription}</p>
              <button className="button button--secondary" type="button" onClick={() => setSent(false)}>{content.sendAnother}</button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={send}>
              <header><span className="eyebrow">{content.formEyebrow}</span><h2>{content.formTitle}</h2></header>
              <label>{content.nameLabel}<input required autoComplete="name" placeholder={content.namePlaceholder} /></label>
              <label>{content.emailFieldLabel}<input required type="email" autoComplete="email" placeholder="you@example.com" dir="ltr" /></label>
              <label>{content.subjectLabel}<select defaultValue="" required><option value="" disabled>{content.subjectPlaceholder}</option>{content.subjects.map((subject) => <option key={subject}>{subject}</option>)}</select></label>
              <label>{content.messageLabel}<textarea required rows={5} placeholder={content.messagePlaceholder} /></label>
              <button className="button button--primary" type="submit">{content.submit} <ForwardArrow locale={locale} /></button>
            </form>
          )}
        </section>
      </section>
    </main>
  )
}

export const LegalPage = () => {
  const { locale } = useLanguage()
  const content = infoCopy[locale].legal

  return (
    <main id="main-content" className="page-shell legal-page">
      <section className="page-hero page-hero--compact">
        <div className="container"><span className="eyebrow"><ShieldCheck size={15} aria-hidden="true" /> {content.eyebrow}</span><h1>{content.title}</h1><p>{content.updated}</p></div>
      </section>
      <section className="container legal-layout">
        <aside><strong>{content.contentsTitle}</strong>{content.sections.map((section) => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}</aside>
        <article>{content.sections.map((section) => <section id={section.id} key={section.id}><h2>{section.title}</h2><p>{section.description}</p></section>)}</article>
      </section>
    </main>
  )
}

export const NotFoundPage = () => {
  const { locale } = useLanguage()
  const content = infoCopy[locale].notFound

  return (
    <main id="main-content" className="not-found-page">
      <div>
        <span>404</span>
        <h1>{content.titleLead}<br />{content.titleAccent}</h1>
        <p>{content.description}</p>
        <Link className="button button--primary" to="/">{content.homeAction} <ForwardArrow locale={locale} /></Link>
        <Link className="not-found-page__link" to="/events"><MessageCircleQuestion size={17} aria-hidden="true" /> {content.eventsAction}</Link>
      </div>
    </main>
  )
}
