export const authLocales = ['fa', 'en', 'ru', 'tr'] as const

export type AuthLocale = (typeof authLocales)[number]
export type AuthMode = 'login' | 'register'

type AuthModeCopy = {
  eyebrow: string
  title: string
  description: string
  action: string
  accountPrompt: string
  accountAction: string
}

export type AuthCopy = {
  locale: AuthLocale
  direction: 'rtl' | 'ltr'
  brand: string
  links: {
    home: string
    homeAria: string
    mobileBackAria: string
    legalLink: string
  }
  showcase: {
    titleBefore: string
    titleAccent: string
    titleAfter: string
    liveLabel: string
    description: string
    previewAria: string
    ticket: {
      featured: string
      code: string
      category: string
      title: string
      subtitle: string
      date: string
      digitalTicket: string
    }
    trustAria: string
    trust: {
      securePayment: string
      guaranteedTicket: string
      support: string
    }
  }
  tabs: {
    label: string
    login: string
    register: string
  }
  modes: Record<AuthMode, AuthModeCopy>
  form: {
    securityNote: string
    nameLabel: string
    namePlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    passwordLabel: string
    passwordPlaceholder: string
    forgotPassword: string
    showPassword: string
    hidePassword: string
    passwordHint: string
    protectedInfo: string
    legalBefore: string
    legalAfter: string
    demoNotice: string
  }
  validation: {
    nameRequired: string
    credentialsInvalid: string
    signInFailed: string
  }
  status: {
    pending: string
  }
  demoGuestName: string
}

export const authCopy = {
  fa: {
    locale: 'fa',
    direction: 'rtl',
    brand: 'نکسا',
    links: {
      home: 'بازگشت به خانه',
      homeAria: 'نکسا، بازگشت به صفحهٔ اصلی',
      mobileBackAria: 'بازگشت به خانه',
      legalLink: 'قوانین استفاده و حریم خصوصی',
    },
    showcase: {
      titleBefore: 'شب‌های بزرگ،',
      titleAccent: 'یک بلیت',
      titleAfter: 'آغاز می‌شوند.',
      liveLabel: 'نبضِ شهر، همین حالا',
      description: 'از صندلی ردیف اول تا تجربه‌هایی که تا مدت‌ها درباره‌شان حرف می‌زنید؛ همه در یک جای امن و شخصی.',
      previewAria: 'نمونه‌ای از یک رویداد محبوب',
      ticket: {
        featured: 'انتخاب این هفته',
        code: 'NX•0578',
        category: 'موسیقی زنده',
        title: 'پس‌تاب: شب صدا و نور',
        subtitle: 'اجرایی ویژه در قلب نیویورک',
        date: '۲۷ شهریور، ۲۰:۰۰',
        digitalTicket: 'بلیت الکترونیک',
      },
      trustAria: 'مزیت‌های نکسا',
      trust: {
        securePayment: 'پرداخت امن',
        guaranteedTicket: 'بلیت تضمین‌شده',
        support: 'پشتیبانی همراه شما',
      },
    },
    tabs: {
      label: 'انتخاب ورود یا ثبت‌نام',
      login: 'ورود',
      register: 'ثبت‌نام',
    },
    modes: {
      login: {
        eyebrow: 'بازگشت به لحظه‌های خوب',
        title: 'خوش برگشتید.',
        description: 'برای دیدن بلیت‌ها و تجربه‌های انتخاب‌شده‌تان وارد شوید.',
        action: 'ورود به فضای من',
        accountPrompt: 'حساب ندارید؟',
        accountAction: 'ثبت‌نام کنید',
      },
      register: {
        eyebrow: 'شروع یک تجربهٔ تازه',
        title: 'جای شما اینجاست.',
        description: 'حساب نکسا را بسازید و از رویدادهایی که دوست دارید جا نمانید.',
        action: 'ساخت حساب نکسا',
        accountPrompt: 'حساب دارید؟',
        accountAction: 'وارد شوید',
      },
    },
    form: {
      securityNote: 'اتصال شما با استانداردهای امنیتی محافظت می‌شود.',
      nameLabel: 'نام و نام خانوادگی',
      namePlaceholder: 'مثلاً سارا احمدی',
      emailLabel: 'نشانی ایمیل',
      emailPlaceholder: 'sara@example.com',
      passwordLabel: 'رمز عبور',
      passwordPlaceholder: 'حداقل ۶ کاراکتر',
      forgotPassword: 'رمز عبور را فراموش کرده‌اید؟',
      showPassword: 'نمایش رمز عبور',
      hidePassword: 'پنهان کردن رمز عبور',
      passwordHint: 'حداقل ۶ کاراکتر؛ برای امنیت بیشتر از ترکیب حروف و عدد استفاده کنید.',
      protectedInfo: 'اطلاعات شما نزد نکسا محفوظ می‌ماند.',
      legalBefore: 'با ادامه،',
      legalAfter: 'نکسا را می‌پذیرید.',
      demoNotice: 'حالت نمایشی فعال است؛ هر ایمیل و رمز ۶ کاراکتری قابل استفاده است.',
    },
    validation: {
      nameRequired: 'لطفاً نام و نام خانوادگی‌تان را وارد کنید.',
      credentialsInvalid: 'ایمیل معتبر و رمز عبور دست‌کم ۶ کاراکتری وارد کنید.',
      signInFailed: 'ورود به حساب انجام نشد. لطفاً دوباره تلاش کنید.',
    },
    status: {
      pending: 'در حال بررسی اطلاعات…',
    },
    demoGuestName: 'مهمان نکسا',
  },
  en: {
    locale: 'en',
    direction: 'ltr',
    brand: 'Nexa',
    links: {
      home: 'Back to home',
      homeAria: 'Nexa, return to the homepage',
      mobileBackAria: 'Back to home',
      legalLink: 'Terms of Use and Privacy Policy',
    },
    showcase: {
      titleBefore: 'Big nights',
      titleAccent: 'start with',
      titleAfter: 'one ticket.',
      liveLabel: 'The city is happening now',
      description: 'From front-row seats to the experiences you will be talking about for weeks—keep them all in one secure, personal place.',
      previewAria: 'Preview of a popular event',
      ticket: {
        featured: 'This week’s pick',
        code: 'NX•0578',
        category: 'Live music',
        title: 'Afterglow: Sound & Light Session',
        subtitle: 'A special session in the heart of New York',
        date: 'September 18 · 20:00',
        digitalTicket: 'Digital ticket',
      },
      trustAria: 'Nexa benefits',
      trust: {
        securePayment: 'Secure payment',
        guaranteedTicket: 'Guaranteed tickets',
        support: 'Support when you need it',
      },
    },
    tabs: {
      label: 'Choose sign in or create an account',
      login: 'Sign in',
      register: 'Create account',
    },
    modes: {
      login: {
        eyebrow: 'Welcome back to good moments',
        title: 'Welcome back.',
        description: 'Sign in to see your tickets and handpicked experiences.',
        action: 'Enter my space',
        accountPrompt: 'New to Nexa?',
        accountAction: 'Create an account',
      },
      register: {
        eyebrow: 'Start a new experience',
        title: 'You belong here.',
        description: 'Create your Nexa account and never miss the events you love.',
        action: 'Create my Nexa account',
        accountPrompt: 'Already have an account?',
        accountAction: 'Sign in',
      },
    },
    form: {
      securityNote: 'Your connection is protected by modern security standards.',
      nameLabel: 'Full name',
      namePlaceholder: 'e.g. Sara Ahmadi',
      emailLabel: 'Email address',
      emailPlaceholder: 'sara@example.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'At least 6 characters',
      forgotPassword: 'Forgot your password?',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      passwordHint: 'Use at least 6 characters. A mix of letters and numbers is more secure.',
      protectedInfo: 'Your information stays protected with Nexa.',
      legalBefore: 'By continuing, you agree to Nexa’s',
      legalAfter: '.',
      demoNotice: 'Demo mode is on—any email and a password of 6 or more characters will work.',
    },
    validation: {
      nameRequired: 'Please enter your full name.',
      credentialsInvalid: 'Enter a valid email address and a password with at least 6 characters.',
      signInFailed: 'We could not sign you in. Please try again.',
    },
    status: {
      pending: 'Checking your details…',
    },
    demoGuestName: 'Nexa guest',
  },
  ru: {
    locale: 'ru',
    direction: 'ltr',
    brand: 'Nexa',
    links: {
      home: 'На главную',
      homeAria: 'Nexa, вернуться на главную страницу',
      mobileBackAria: 'На главную',
      legalLink: 'Условия использования и политика конфиденциальности Nexa',
    },
    showcase: {
      titleBefore: 'Большие вечера',
      titleAccent: 'начинаются',
      titleAfter: 'с одного билета.',
      liveLabel: 'Город живёт прямо сейчас',
      description: 'От мест в первом ряду до впечатлений, о которых будут говорить неделями, — всё хранится в одном безопасном личном пространстве.',
      previewAria: 'Пример популярного события',
      ticket: {
        featured: 'Выбор недели',
        code: 'NX•0578',
        category: 'Живая музыка',
        title: 'Послесвечение: сессия звука и света',
        subtitle: 'Особая сессия в самом сердце Нью-Йорка',
        date: '18 сентября · 20:00',
        digitalTicket: 'Электронный билет',
      },
      trustAria: 'Преимущества Nexa',
      trust: {
        securePayment: 'Безопасная оплата',
        guaranteedTicket: 'Гарантированный билет',
        support: 'Поддержка рядом',
      },
    },
    tabs: {
      label: 'Выберите вход или регистрацию',
      login: 'Войти',
      register: 'Регистрация',
    },
    modes: {
      login: {
        eyebrow: 'Возвращение к ярким моментам',
        title: 'С возвращением.',
        description: 'Войдите, чтобы увидеть свои билеты и выбранные впечатления.',
        action: 'Войти в мой аккаунт',
        accountPrompt: 'Ещё нет аккаунта?',
        accountAction: 'Зарегистрируйтесь',
      },
      register: {
        eyebrow: 'Начните новое впечатление',
        title: 'Вам здесь рады.',
        description: 'Создайте аккаунт Nexa и не пропускайте события, которые любите.',
        action: 'Создать аккаунт Nexa',
        accountPrompt: 'Уже есть аккаунт?',
        accountAction: 'Войти',
      },
    },
    form: {
      securityNote: 'Ваше соединение защищено современными стандартами безопасности.',
      nameLabel: 'Имя и фамилия',
      namePlaceholder: 'Например, Сара Ахмади',
      emailLabel: 'Электронная почта',
      emailPlaceholder: 'sara@example.com',
      passwordLabel: 'Пароль',
      passwordPlaceholder: 'Не менее 6 символов',
      forgotPassword: 'Забыли пароль?',
      showPassword: 'Показать пароль',
      hidePassword: 'Скрыть пароль',
      passwordHint: 'Не менее 6 символов. Комбинация букв и цифр надёжнее.',
      protectedInfo: 'Nexa бережно хранит ваши данные.',
      legalBefore: 'Продолжая, вы принимаете',
      legalAfter: '.',
      demoNotice: 'Включён деморежим: подойдёт любой email и пароль от 6 символов.',
    },
    validation: {
      nameRequired: 'Укажите имя и фамилию.',
      credentialsInvalid: 'Введите корректный email и пароль не короче 6 символов.',
      signInFailed: 'Не удалось войти в аккаунт. Попробуйте ещё раз.',
    },
    status: {
      pending: 'Проверяем данные…',
    },
    demoGuestName: 'Гость Nexa',
  },
  tr: {
    locale: 'tr',
    direction: 'ltr',
    brand: 'Nexa',
    links: {
      home: 'Ana sayfaya dön',
      homeAria: 'Nexa, ana sayfaya dön',
      mobileBackAria: 'Ana sayfaya dön',
      legalLink: "Kullanım Koşulları'nı ve Gizlilik Politikası'nı",
    },
    showcase: {
      titleBefore: 'Büyük geceler',
      titleAccent: 'tek bir biletle',
      titleAfter: 'başlar.',
      liveLabel: 'Şehrin ritmi şimdi burada',
      description: 'Ön sıra koltuklardan haftalarca konuşacağınız deneyimlere kadar her şey güvenli, size özel bir yerde.',
      previewAria: 'Popüler bir etkinlik önizlemesi',
      ticket: {
        featured: 'Haftanın seçimi',
        code: 'NX•0578',
        category: 'Canlı müzik',
        title: 'Afterglow: Ses ve Işık Seansı',
        subtitle: 'New York’un kalbinde özel bir seans',
        date: '18 Eylül · 20.00',
        digitalTicket: 'Dijital bilet',
      },
      trustAria: 'Nexa avantajları',
      trust: {
        securePayment: 'Güvenli ödeme',
        guaranteedTicket: 'Garantili bilet',
        support: 'Yanınızda destek',
      },
    },
    tabs: {
      label: 'Giriş veya kayıt seçin',
      login: 'Giriş yap',
      register: 'Kayıt ol',
    },
    modes: {
      login: {
        eyebrow: 'Güzel anlara yeniden dönün',
        title: 'Tekrar hoş geldiniz.',
        description: 'Biletlerinizi ve seçtiğiniz deneyimleri görmek için giriş yapın.',
        action: 'Alanıma gir',
        accountPrompt: 'Hesabınız yok mu?',
        accountAction: 'Kayıt olun',
      },
      register: {
        eyebrow: 'Yeni bir deneyime başlayın',
        title: 'Yeriniz burada.',
        description: 'Nexa hesabınızı oluşturun, sevdiğiniz etkinlikleri asla kaçırmayın.',
        action: 'Nexa hesabımı oluştur',
        accountPrompt: 'Zaten hesabınız var mı?',
        accountAction: 'Giriş yapın',
      },
    },
    form: {
      securityNote: 'Bağlantınız güncel güvenlik standartlarıyla korunur.',
      nameLabel: 'Ad soyad',
      namePlaceholder: 'Örn. Sara Ahmadi',
      emailLabel: 'E-posta adresi',
      emailPlaceholder: 'sara@example.com',
      passwordLabel: 'Şifre',
      passwordPlaceholder: 'En az 6 karakter',
      forgotPassword: 'Şifrenizi mi unuttunuz?',
      showPassword: 'Şifreyi göster',
      hidePassword: 'Şifreyi gizle',
      passwordHint: 'En az 6 karakter kullanın. Harf ve rakam karışımı daha güvenlidir.',
      protectedInfo: 'Bilgileriniz Nexa ile güvende kalır.',
      legalBefore: "Devam ederek Nexa'nın",
      legalAfter: 'kabul etmiş olursunuz.',
      demoNotice: 'Demo modu açık: herhangi bir e-posta ve en az 6 karakterlik şifre kullanılabilir.',
    },
    validation: {
      nameRequired: 'Lütfen adınızı ve soyadınızı girin.',
      credentialsInvalid: 'Geçerli bir e-posta ve en az 6 karakterlik şifre girin.',
      signInFailed: 'Hesabınıza giriş yapılamadı. Lütfen tekrar deneyin.',
    },
    status: {
      pending: 'Bilgileriniz kontrol ediliyor…',
    },
    demoGuestName: 'Nexa misafiri',
  },
} satisfies Record<AuthLocale, AuthCopy>

export const defaultAuthLocale: AuthLocale = 'fa'

export const isAuthLocale = (value: string | null | undefined): value is AuthLocale =>
  typeof value === 'string' && (authLocales as readonly string[]).includes(value)

export const getAuthCopy = (locale?: string | null): AuthCopy =>
  authCopy[isAuthLocale(locale) ? locale : defaultAuthLocale]
