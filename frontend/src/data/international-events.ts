import type { EventCategory, EventItem } from '../types'

/**
 * Fictional US inventory for international UI and localization demos.
 * Venue names, addresses, schedules, and availability are sample content only.
 * Prices are expressed in USD.
 */

export type InternationalLocale = 'fa' | 'ru' | 'tr'

export type InternationalEventTranslation = {
  title: string
  description: string
  location: string
  address: string
  ticketTiers: Record<number, string>
}

export type InternationalEventSeed = EventItem & {
  city: string
  venue: string
  countryCode: 'US'
  currency: 'USD'
  translations: Record<InternationalLocale, InternationalEventTranslation>
}

export const internationalEventCategories: EventCategory[] = [
  { id: 101, name: 'Live Music', slug: 'live-music' },
  { id: 102, name: 'Film & Culture', slug: 'film-culture' },
  { id: 103, name: 'Markets & Workshops', slug: 'markets-workshops' },
  { id: 104, name: 'Sport & Outdoors', slug: 'sport-outdoors' },
  { id: 105, name: 'Family', slug: 'family' },
]

const [liveMusic, filmCulture, marketsWorkshops, sportOutdoors, family] = internationalEventCategories

export const internationalEvents: InternationalEventSeed[] = [
  {
    id: 1001,
    title: 'Afterglow: Sound & Light Session',
    slug: 'afterglow-sound-light-session',
    description: 'An after-dark room of live electronics, soft projections, and an open dance floor.',
    cover_image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=85',
    date: '2026-09-18T20:00:00-04:00',
    city: 'New York, NY',
    venue: 'Atlas Hall',
    location: 'Atlas Hall, New York',
    address: '78 Mercer Lane, New York, NY 10013',
    countryCode: 'US',
    currency: 'USD',
    categories: [liveMusic],
    artists: [],
    featured: true,
    is_active: true,
    ticket_classes: [
      { id: 1101, title: 'General Admission', price: 48, capacity: 650, sold: 428, remaining_capacity: 222, is_sold_out: false },
      { id: 1102, title: 'Floor Access', price: 72, capacity: 260, sold: 198, remaining_capacity: 62, is_sold_out: false },
      { id: 1103, title: 'Late Entry', price: 32, capacity: 150, sold: 39, remaining_capacity: 111, is_sold_out: false },
    ],
    translations: {
      fa: {
        title: 'پس‌تاب: شب صدا و نور',
        description: 'شبی پس از تاریکی با الکترونیک زنده، پروجکشن‌های نرم و پیست رقص آزاد.',
        location: 'سالن اطلس، نیویورک',
        address: '۷۸ مرسر لین، نیویورک، نیویورک ۱۰۰۱۳',
        ticketTiers: { 1101: 'ورودی عمومی', 1102: 'دسترسی به پیست', 1103: 'ورود دیرهنگام' },
      },
      ru: {
        title: 'Послесвечение: сессия звука и света',
        description: 'Ночная встреча с живой электроникой, мягкими проекциями и открытым танцполом.',
        location: 'Холл «Атлас», Нью-Йорк',
        address: 'Мерсер-лейн, 78, Нью-Йорк, штат Нью-Йорк 10013',
        ticketTiers: { 1101: 'Общий вход', 1102: 'Доступ на танцпол', 1103: 'Поздний вход' },
      },
      tr: {
        title: 'Afterglow: Ses ve Işık Seansı',
        description: 'Canlı elektronik, yumuşak projeksiyonlar ve açık dans pistinden oluşan gece etkinliği.',
        location: 'Atlas Hall, New York',
        address: '78 Mercer Lane, New York, NY 10013',
        ticketTiers: { 1101: 'Genel Giriş', 1102: 'Dans Pisti Erişimi', 1103: 'Geç Giriş' },
      },
    },
  },
  {
    id: 1002,
    title: 'Night Bloom Jazz Sessions',
    slug: 'night-bloom-jazz-sessions',
    description: 'Three intimate sets of modern jazz, late-night conversation, and a small seasonal bar.',
    cover_image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1600&q=85',
    date: '2026-09-26T19:30:00-05:00',
    city: 'Chicago, IL',
    venue: 'The Copper Room',
    location: 'The Copper Room, Chicago',
    address: '215 West Maple Street, Chicago, IL 60607',
    countryCode: 'US',
    currency: 'USD',
    categories: [liveMusic],
    artists: [],
    is_active: true,
    ticket_classes: [
      { id: 1201, title: 'Club Entry', price: 42, capacity: 280, sold: 180, remaining_capacity: 100, is_sold_out: false },
      { id: 1202, title: 'Table Lounge', price: 88, capacity: 72, sold: 59, remaining_capacity: 13, is_sold_out: false },
      { id: 1203, title: 'Late Set', price: 28, capacity: 160, sold: 71, remaining_capacity: 89, is_sold_out: false },
    ],
    translations: {
      fa: {
        title: 'جلسه‌های جَز شب‌گل',
        description: 'سه ست صمیمی جَز مدرن، گفت‌وگوی شبانه و باری کوچک با منوی فصلی.',
        location: 'کاپر روم، شیکاگو',
        address: '۲۱۵ وست میپل استریت، شیکاگو، ایلینوی ۶۰۶۰۷',
        ticketTiers: { 1201: 'ورودی کلاب', 1202: 'لانژ میزدار', 1203: 'ست پایانی' },
      },
      ru: {
        title: 'Ночной цвет: джазовые сессии',
        description: 'Три камерных сета современного джаза, ночные беседы и сезонный бар.',
        location: '«Коппер-рум», Чикаго',
        address: 'Уэст-Мейпл-стрит, 215, Чикаго, Иллинойс 60607',
        ticketTiers: { 1201: 'Вход в клуб', 1202: 'Столик в лаунже', 1203: 'Поздний сет' },
      },
      tr: {
        title: 'Gece Çiçeği: Caz Seansları',
        description: 'Üç samimi modern caz seti, gece sohbeti ve mevsimlik küçük bir bar.',
        location: 'The Copper Room, Chicago',
        address: '215 West Maple Street, Chicago, IL 60607',
        ticketTiers: { 1201: 'Kulüp Girişi', 1202: 'Masa Lounge', 1203: 'Geç Seans' },
      },
    },
  },
  {
    id: 1003,
    title: 'Canyon Current: Open-Air Electronic Set',
    slug: 'canyon-current-open-air-electronic-set',
    description: 'Golden-hour selectors, a panoramic terrace, and a slow build into an open-air night.',
    cover_image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=85',
    date: '2026-10-10T19:00:00-07:00',
    city: 'Los Angeles, CA',
    venue: 'Mirage Terrace',
    location: 'Mirage Terrace, Los Angeles',
    address: '3400 Sunset Crest Drive, Los Angeles, CA 90026',
    countryCode: 'US',
    currency: 'USD',
    categories: [liveMusic],
    artists: [],
    featured: true,
    is_active: true,
    ticket_classes: [
      { id: 1301, title: 'Lawn Entry', price: 38, capacity: 800, sold: 535, remaining_capacity: 265, is_sold_out: false },
      { id: 1302, title: 'Terrace Deck', price: 76, capacity: 220, sold: 154, remaining_capacity: 66, is_sold_out: false },
      { id: 1303, title: 'Premium View', price: 118, capacity: 90, sold: 74, remaining_capacity: 16, is_sold_out: false },
    ],
    translations: {
      fa: {
        title: 'جریان کنیون: اجرای الکترونیک روباز',
        description: 'دی‌جی‌های غروب، تراسی با چشم‌انداز و اوج‌گیری آرام در یک شب روباز.',
        location: 'تراس میراژ، لس‌آنجلس',
        address: '۳۴۰۰ سان‌ست کرست درایو، لس‌آنجلس، کالیفرنیا ۹۰۰۲۶',
        ticketTiers: { 1301: 'ورودی چمن', 1302: 'عرشهٔ تراس', 1303: 'نمای ممتاز' },
      },
      ru: {
        title: 'Течение каньона: электронный сет под открытым небом',
        description: 'Диджеи на закате, панорамная терраса и плавный переход в ночной сет.',
        location: 'Терраса «Мираж», Лос-Анджелес',
        address: 'Сансет-Крест-драйв, 3400, Лос-Анджелес, Калифорния 90026',
        ticketTiers: { 1301: 'Вход на газон', 1302: 'Терраса', 1303: 'Премиальный вид' },
      },
      tr: {
        title: 'Kanyon Akışı: Açık Hava Elektronik Seti',
        description: 'Gün batımı seçkileri, panoramik teras ve açık havada geceye uzanan bir set.',
        location: 'Mirage Terrace, Los Angeles',
        address: '3400 Sunset Crest Drive, Los Angeles, CA 90026',
        ticketTiers: { 1301: 'Çim Alan Girişi', 1302: 'Teras Güvertesi', 1303: 'Premium Manzara' },
      },
    },
  },
  {
    id: 1004,
    title: 'Frame by Frame: Independent Film Weekend',
    slug: 'frame-by-frame-independent-film-weekend',
    description: 'A compact weekend of first features, short films, and candid filmmaker conversations.',
    cover_image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=85',
    date: '2026-10-23T17:30:00-05:00',
    city: 'Austin, TX',
    venue: 'Juniper Cinema House',
    location: 'Juniper Cinema House, Austin',
    address: '610 East Willow Street, Austin, TX 78702',
    countryCode: 'US',
    currency: 'USD',
    categories: [filmCulture],
    artists: [],
    is_active: true,
    ticket_classes: [
      { id: 1401, title: 'Day Pass', price: 34, capacity: 180, sold: 98, remaining_capacity: 82, is_sold_out: false },
      { id: 1402, title: 'Weekend Pass', price: 82, capacity: 320, sold: 189, remaining_capacity: 131, is_sold_out: false },
      { id: 1403, title: 'Filmmaker Conversation', price: 18, capacity: 75, sold: 42, remaining_capacity: 33, is_sold_out: false },
    ],
    translations: {
      fa: {
        title: 'فریم‌به‌فریم: آخرهفتهٔ فیلم مستقل',
        description: 'آخرهفته‌ای جمع‌وجور از فیلم‌های اول، فیلم کوتاه و گفت‌وگوهای بی‌تکلف با فیلم‌سازان.',
        location: 'خانهٔ سینمای جونیپر، آستین',
        address: '۶۱۰ ایست ویلو استریت، آستین، تگزاس ۷۸۷۰۲',
        ticketTiers: { 1401: 'گذر یک‌روزه', 1402: 'گذر آخرهفته', 1403: 'گفت‌وگو با فیلم‌سازان' },
      },
      ru: {
        title: 'Кадр за кадром: уикенд независимого кино',
        description: 'Небольшой уикенд дебютных и короткометражных фильмов с беседами с авторами.',
        location: 'Кинотеатр «Джунипер», Остин',
        address: 'Ист-Уиллоу-стрит, 610, Остин, Техас 78702',
        ticketTiers: { 1401: 'Билет на день', 1402: 'Билет на уикенд', 1403: 'Беседа с режиссёрами' },
      },
      tr: {
        title: 'Kare Kare: Bağımsız Film Hafta Sonu',
        description: 'İlk filmler, kısa filmler ve samimi yönetmen söyleşilerinden oluşan kompakt bir hafta sonu.',
        location: 'Juniper Cinema House, Austin',
        address: '610 East Willow Street, Austin, TX 78702',
        ticketTiers: { 1401: 'Günlük Bilet', 1402: 'Hafta Sonu Bileti', 1403: 'Yönetmen Söyleşisi' },
      },
    },
  },
  {
    id: 1005,
    title: 'Common Ground: Makers & Design Market',
    slug: 'common-ground-makers-design-market',
    description: 'A bright indoor market for small-batch objects, thoughtful gifts, and hands-on design sessions.',
    cover_image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1600&q=85',
    date: '2026-11-07T11:00:00-08:00',
    city: 'San Francisco, CA',
    venue: 'Pierline Warehouse',
    location: 'Pierline Warehouse, San Francisco',
    address: '22 Bay Foundry Way, San Francisco, CA 94107',
    countryCode: 'US',
    currency: 'USD',
    categories: [marketsWorkshops],
    artists: [],
    is_active: true,
    ticket_classes: [
      { id: 1501, title: 'Open Entry', price: 16, capacity: 1200, sold: 562, remaining_capacity: 638, is_sold_out: false },
      { id: 1502, title: 'Early Access', price: 28, capacity: 160, sold: 102, remaining_capacity: 58, is_sold_out: false },
      { id: 1503, title: 'Workshop Bundle', price: 54, capacity: 90, sold: 48, remaining_capacity: 42, is_sold_out: false },
    ],
    translations: {
      fa: {
        title: 'زمین مشترک: بازار سازندگان و طراحی',
        description: 'بازاری روشن و سرپوشیده برای محصولات محدود، هدیه‌های دقیق و جلسه‌های عملی طراحی.',
        location: 'انبار پیرلاین، سان‌فرانسیسکو',
        address: '۲۲ بی فاندری وی، سان‌فرانسیسکو، کالیفرنیا ۹۴۱۰۷',
        ticketTiers: { 1501: 'ورود آزاد', 1502: 'دسترسی زودهنگام', 1503: 'بستهٔ کارگاه' },
      },
      ru: {
        title: 'Общее пространство: маркет мастеров и дизайна',
        description: 'Светлый крытый маркет небольших серий, подарков и практических дизайн-сессий.',
        location: 'Склад «Пирлайн», Сан-Франциско',
        address: 'Бэй-Фаундри-Уэй, 22, Сан-Франциско, Калифорния 94107',
        ticketTiers: { 1501: 'Свободный вход', 1502: 'Ранний доступ', 1503: 'Пакет с мастерской' },
      },
      tr: {
        title: 'Ortak Zemin: Üreticiler ve Tasarım Pazarı',
        description: 'Küçük üretim objeler, özenli hediyeler ve uygulamalı tasarım seansları için aydınlık kapalı pazar.',
        location: 'Pierline Warehouse, San Francisco',
        address: '22 Bay Foundry Way, San Francisco, CA 94107',
        ticketTiers: { 1501: 'Açık Giriş', 1502: 'Erken Erişim', 1503: 'Atölye Paketi' },
      },
    },
  },
  {
    id: 1006,
    title: 'Skyline Run: Twilight 10K',
    slug: 'skyline-run-twilight-10k',
    description: 'A welcoming twilight route with city views, paced start waves, and a finish-line social.',
    cover_image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1600&q=85',
    date: '2026-11-14T16:30:00-07:00',
    city: 'Denver, CO',
    venue: 'Summit Park',
    location: 'Summit Park, Denver',
    address: '701 Overlook Avenue, Denver, CO 80204',
    countryCode: 'US',
    currency: 'USD',
    categories: [sportOutdoors],
    artists: [],
    featured: true,
    is_active: true,
    ticket_classes: [
      { id: 1601, title: '10K Entry', price: 46, capacity: 1500, sold: 873, remaining_capacity: 627, is_sold_out: false },
      { id: 1602, title: 'Entry + Hoodie', price: 78, capacity: 480, sold: 321, remaining_capacity: 159, is_sold_out: false },
      { id: 1603, title: 'Supporter Zone', price: 14, capacity: 500, sold: 104, remaining_capacity: 396, is_sold_out: false },
    ],
    translations: {
      fa: {
        title: 'دوِ خط آسمان: ۱۰ کیلومتر گرگ‌ومیش',
        description: 'مسیر صمیمی غروب با چشم‌انداز شهر، استارت‌های زمان‌بندی‌شده و دورهمی خط پایان.',
        location: 'پارک سامیت، دنور',
        address: '۷۰۱ اورلوک اونیو، دنور، کلرادو ۸۰۲۰۴',
        ticketTiers: { 1601: 'ورودی ۱۰ کیلومتر', 1602: 'ورودی و هودی', 1603: 'محدودهٔ همراهان' },
      },
      ru: {
        title: 'Бег по линии горизонта: вечерние 10 км',
        description: 'Дружелюбный маршрут на закате с видами на город, стартовыми волнами и встречей на финише.',
        location: 'Парк «Саммит», Денвер',
        address: 'Оверлук-авеню, 701, Денвер, Колорадо 80204',
        ticketTiers: { 1601: 'Участие в забеге 10 км', 1602: 'Участие и худи', 1603: 'Зона поддержки' },
      },
      tr: {
        title: 'Skyline Koşusu: Alacakaranlık 10K',
        description: 'Şehir manzaralı sıcak bir alacakaranlık rotası, kademeli startlar ve bitiş buluşması.',
        location: 'Summit Park, Denver',
        address: '701 Overlook Avenue, Denver, CO 80204',
        ticketTiers: { 1601: '10K Katılımı', 1602: 'Katılım + Hoodie', 1603: 'Destekçi Alanı' },
      },
    },
  },
  {
    id: 1007,
    title: 'Futures in Motion: Design Forum',
    slug: 'futures-in-motion-design-forum',
    description: 'A one-day forum for practical ideas in product, public space, and responsible technology.',
    cover_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=85',
    date: '2026-12-03T09:30:00-05:00',
    city: 'Boston, MA',
    venue: 'Civic Studio',
    location: 'Civic Studio, Boston',
    address: '48 Harbor Street, Boston, MA 02110',
    countryCode: 'US',
    currency: 'USD',
    categories: [filmCulture],
    artists: [],
    is_active: true,
    ticket_classes: [
      { id: 1701, title: 'Forum Pass', price: 96, capacity: 650, sold: 404, remaining_capacity: 246, is_sold_out: false },
      { id: 1702, title: 'Workshop Pass', price: 148, capacity: 160, sold: 96, remaining_capacity: 64, is_sold_out: false },
      { id: 1703, title: 'Student Pass', price: 34, capacity: 220, sold: 62, remaining_capacity: 158, is_sold_out: false },
    ],
    translations: {
      fa: {
        title: 'آینده‌های در حرکت: فروم طراحی',
        description: 'فرومی یک‌روزه برای ایده‌های کاربردی در محصول، فضای عمومی و فناوری مسئولانه.',
        location: 'استودیوی سیویک، بوستون',
        address: '۴۸ هاربر استریت، بوستون، ماساچوست ۰۲۱۱۰',
        ticketTiers: { 1701: 'گذر فروم', 1702: 'گذر کارگاه', 1703: 'گذر دانشجویی' },
      },
      ru: {
        title: 'Будущее в движении: форум дизайна',
        description: 'Однодневный форум о практичных идеях в продукте, городской среде и ответственных технологиях.',
        location: 'Студия «Сивик», Бостон',
        address: 'Харбор-стрит, 48, Бостон, Массачусетс 02110',
        ticketTiers: { 1701: 'Пропуск на форум', 1702: 'Пропуск на мастерскую', 1703: 'Студенческий билет' },
      },
      tr: {
        title: 'Hareketli Gelecekler: Tasarım Forumu',
        description: 'Ürün, kamusal alan ve sorumlu teknolojide pratik fikirler için bir günlük forum.',
        location: 'Civic Studio, Boston',
        address: '48 Harbor Street, Boston, MA 02110',
        ticketTiers: { 1701: 'Forum Bileti', 1702: 'Atölye Bileti', 1703: 'Öğrenci Bileti' },
      },
    },
  },
  {
    id: 1008,
    title: 'Little Lanterns: Family Theatre Day',
    slug: 'little-lanterns-family-theatre-day',
    description: 'A playful daytime program of short theatre, puppet-making, and gentle music for families.',
    cover_image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1600&q=85',
    date: '2026-12-13T10:30:00-08:00',
    city: 'Seattle, WA',
    venue: 'Northlight Playhouse',
    location: 'Northlight Playhouse, Seattle',
    address: '190 Cedar Loop, Seattle, WA 98109',
    countryCode: 'US',
    currency: 'USD',
    categories: [family],
    artists: [],
    is_active: true,
    ticket_classes: [
      { id: 1801, title: 'Family Bundle', price: 64, capacity: 260, sold: 147, remaining_capacity: 113, is_sold_out: false },
      { id: 1802, title: 'Adult Entry', price: 24, capacity: 240, sold: 81, remaining_capacity: 159, is_sold_out: false },
      { id: 1803, title: 'Child Entry', price: 14, capacity: 300, sold: 105, remaining_capacity: 195, is_sold_out: false },
    ],
    translations: {
      fa: {
        title: 'فانوس‌های کوچک: روز تئاتر خانواده',
        description: 'برنامه‌ای بازیگوشانه از تئاتر کوتاه، ساخت عروسک و موسیقی آرام برای خانواده‌ها.',
        location: 'پلی‌هاوس نورث‌لایت، سیاتل',
        address: '۱۹۰ سیدار لوپ، سیاتل، واشینگتن ۹۸۱۰۹',
        ticketTiers: { 1801: 'بستهٔ خانواده', 1802: 'ورودی بزرگسال', 1803: 'ورودی کودک' },
      },
      ru: {
        title: 'Маленькие фонарики: семейный театральный день',
        description: 'Игровая дневная программа с короткими спектаклями, куклами и мягкой музыкой для семей.',
        location: 'Театр «Нортлайт», Сиэтл',
        address: 'Сидар-Луп, 190, Сиэтл, Вашингтон 98109',
        ticketTiers: { 1801: 'Семейный пакет', 1802: 'Взрослый билет', 1803: 'Детский билет' },
      },
      tr: {
        title: 'Küçük Fenerler: Aile Tiyatrosu Günü',
        description: 'Aileler için kısa tiyatro, kukla yapımı ve yumuşak müzikten oluşan neşeli gündüz programı.',
        location: 'Northlight Playhouse, Seattle',
        address: '190 Cedar Loop, Seattle, WA 98109',
        ticketTiers: { 1801: 'Aile Paketi', 1802: 'Yetişkin Girişi', 1803: 'Çocuk Girişi' },
      },
    },
  },
]
