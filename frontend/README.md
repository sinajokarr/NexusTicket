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
VITE_API_URL=http://127.0.0.1:8011
```

Without this variable, the UI is explicitly in demo mode and uses the localized fictional US event inventory. With it configured, the events list and detail pages, authentication, reservations, payment redirect, and account order status use the Django API. An unavailable configured API shows an error state; it never silently switches back to fictional inventory.

In connected mode the full cart is submitted as one atomic order, discount codes are validated by the server, and the browser only marks a reservation successful after the API returns `paid` following the payment redirect. Favorites and display-only profile preferences remain scoped to the signed-in browser account because the API does not currently expose profile or favorites endpoints.

If the connected API's numeric prices are not USD, set `VITE_CURRENCY` to its ISO-4217 code (for example, `IRR`). The same value is used for visible prices and the product-offer schema.

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

`VITE_API_URL` must point to the public API address that the browser can reach (Docker defaults to port `8011`). The payment service must also be configured with the frontend base URL so its verified return route can return to `/checkout`.
