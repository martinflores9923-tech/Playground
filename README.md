# Pacific Services Cleaning

Marketing website for a family cleaning business with:
- Service showcase sections
- Contact form that emails business owners
- SEO-ready metadata, `robots.txt`, and `sitemap.xml`
- Green/blue/white visual design

## Tech Stack
- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js + Express
- Email: Nodemailer (SMTP)
- Hosting target: Netlify (static site + serverless function)

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create env file:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` values:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `CONTACT_TO_EMAIL`
   - `FROM_EMAIL`
4. Start the app:
   ```bash
   npm start
   ```
5. Open:
   - `http://localhost:3000`

## Gmail SMTP Example
```env
PORT=3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=yourbusiness@gmail.com
SMTP_PASS=your_gmail_app_password
CONTACT_TO_EMAIL=yourbusiness@gmail.com
FROM_EMAIL=yourbusiness@gmail.com
```

## Notes
- For Gmail, turn on 2-Step Verification and use a Google App Password (not your normal login password).
- Replace placeholder canonical and sitemap URLs with your real production domain.
- Replace placeholder phone/email content in `public/index.html` with business details.

## Deploy To Netlify
1. Push this project to GitHub.
2. In Netlify: `Add new site` -> `Import an existing project` -> select the repo.
3. Build settings:
   - Build command: leave empty
   - Publish directory: `public`
   - Functions directory: `netlify/functions`
4. In Netlify -> `Site configuration` -> `Environment variables`, add:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `CONTACT_TO_EMAIL`
   - `FROM_EMAIL`
5. Deploy the site.

`netlify.toml` already configures:
- `/api/contact` -> Netlify function for form email delivery
- SPA fallback for routes to `index.html`
