# NexusTicket Frontend

An independent, international event-discovery and ticket-reservation frontend for the NexusTicket API. The demo starts in English and includes fully localized English, Persian (RTL), Russian, and Turkish experiences.

The included demo inventory is fictional, US-based event content with USD pricing. It is designed as a high-end ticketing marketplace and remains ready to connect to the existing Django API.

## اجرا

```bash
cd frontend
npm install
npm run dev
```

برای ساخت نسخهٔ production:

```bash
npm run build
```

## اتصال به API

یک فایل `.env.local` کنار `package.json` بسازید:

```env
VITE_API_URL=http://127.0.0.1:8001
```

Without this variable, the UI uses the localized fictional US event inventory. With it configured, event listings, authentication, order creation, and payment requests are read from the Django API.

## مسیرها

- `/` صفحهٔ اصلی و کشف رویدادها
- `/events` فیلتر، جست‌وجو، مرتب‌سازی و حالت‌های loading/empty/error
- `/events/:slug` جزئیات رویداد، گالری، انتخاب نوع و تعداد بلیت و نظرات
- `/checkout` سبد، کد تخفیف، فرم پرداخت و شمارش‌گر رزرو
- `/login` ورود و ثبت‌نام
- `/account` سفارش‌ها و اطلاعات حساب
- `/favorites` علاقه‌مندی‌ها
- `/about`، `/contact`، `/legal` و 404

## ساختار

- `src/components` اجزای قابل استفادهٔ layout، کارت رویداد، سبد و stateها
- `src/context` سبد و علاقه‌مندی‌های local-first
- `src/data` localized fictional US event inventory and category/city adapters
- `src/lib/api.ts` لایهٔ یکپارچه‌سازی API با fallback دادهٔ نمونه
- `src/pages` صفحات مستقل
- `src/styles.css` design tokens و UI responsive

## ملاحظات اتصال کامل

The current API creates one order per `ticket_class`. The UI keeps multiple selections locally, while the connected API checkout currently completes one ticket type per request. Persistent favorites, a complete profile, richer digital-ticket data, and multi-item checkout still need backend endpoints.
