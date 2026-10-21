# KOJGRA — plain HTML/CSS/JS version
- `*.html` pages, `css/style.css`, `js/config.js` (brand + Supabase keys), `js/app.js` (cart, layout), `js/pages.js` (page logic), `images/`
- `api/*.js` = 5 small Vercel serverless functions (order, coupon, track, subscribe, contact). They need `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` env vars.
- Local test: `npx vercel dev` (plain double-click won't work: clean URLs + /api).
- Brand details (phone, WhatsApp, email): edit `js/config.js`.
