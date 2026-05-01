# Hi-Class Home Services — Deployment Manifest

## Infrastructure Map

### Public Website (Static)
- **Pages:** 11 (Home, Services, Pricing, Quote, Blog, FAQ, Reviews, About, Areas, Contact, Agents)
- **Stack:** HTML5 + CSS3 + Vanilla JS
- **SEO:** JSON-LD LocalBusiness, Open Graph, sitemap.xml, robots.txt
- **Domain:** hi-classhomeservices.com (GoDaddy)
- **Hosting:** S3 static hosting via Perplexity Computer

### Inspector Dashboard (Fullstack)
- **Pages:** 10 (Dashboard, New Inspection, Inspection Detail, Photo Analysis, Report Builder, Email Automation, Client Portal, Deficiency Library, Pricing Calculator, Settings)
- **Stack:** React + Express + SQLite + Drizzle ORM + shadcn/ui + Chart.js
- **Data:** 19 seeded inspections, 14 findings, 200+ deficiency database, 6 email templates
- **Hosting:** S3 deploy with API proxy / Vercel deployment ready

### Aspen Grove Automation (Python)
- **Modules:** 10 (config, inspection_engine, deficiency_engine, ai_photo_analyzer, report_generator, client_portal, intake_system, notion_bridge, automation_runner, tests)
- **Tests:** 33 passing
- **Lines:** 7,500+ Python
- **Dependencies:** Notion API, GPT-4 Vision (configurable), SendGrid (configurable)

## API Integrations Required for Production
1. **OpenAI GPT-4 Vision** — Photo analysis (OPENAI_API_KEY)
2. **SendGrid** — Email automation (SENDGRID_API_KEY)
3. **Stripe** — Payment processing (STRIPE_SECRET_KEY)
4. **Notion API** — Project sync (NOTION_API_KEY)
5. **Supabase** — Production database (SUPABASE_URL, SUPABASE_KEY)

## Brand Identity
- Deep Ocean Blue: #1B3A5C
- Tropical Teal: #2A9D8F
- Warm Gold: #E9B44C
- Fonts: Cabinet Grotesk (display) + Satoshi (body)
- Owner: Casey Del Carpio Barton
- Email: casey@hi-classhomeservices.com
