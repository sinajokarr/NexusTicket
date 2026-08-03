# SinShop Frontend

A polished, multilingual React storefront for active-lifestyle products. The
portfolio demo is intentionally self-contained: it uses fictional products and
simulated checkout, so it is safe to explore without credentials or payment data.

## Highlights

- 24 structured products across training, running, yoga, recovery, smart health and outdoor categories.
- English, Persian (RTL), Turkish and Russian routes.
- Search, filters, sort, wishlist, cart, product variants, demo checkout and account states.
- Responsive UI, keyboard focus styles and reduced-motion support.
- GitHub Pages-compatible routing, including direct links to internal pages.

## Run locally

```bash
npm ci
npm run dev
```

Run quality checks before publishing:

```bash
npm run lint
npm run test
npm run build
```

## Deploy

Pushing to the default branch runs the repository's GitHub Pages workflow.
In GitHub, open **Settings → Pages** and select **GitHub Actions** as the source;
the site will then be published at `https://<github-user>.github.io/<repository>/`.

For Vercel or Netlify, deploy this `frontend` directory with `npm run build` and
leave `VITE_BASE_PATH` empty.

## Configuration

The demo needs no environment variables. `VITE_BASE_PATH` is set by the GitHub
Pages workflow. The legacy Django API is retained at the repository root as a
separate backend implementation sample; this storefront currently uses local,
fictional catalog data.
