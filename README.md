# KB Digital Works

Official static portfolio website for KB Digital Works, an independent digital development studio.

**Website:** https://kb-digitalworks.github.io

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Google Fonts
- Font Awesome Free

## Structure

- `index.html`, `about.html`, `services.html`, `portfolio.html`, `contact.html`, `privacy.html`
- `css/style.css` — shared design system
- `css/responsive.css` — responsive layouts
- `css/animations.css` — reveal effects and reduced-motion support
- `js/navigation.js` — navigation and footer year
- `js/animations.js` — IntersectionObserver reveals
- `js/contact.js` — validation and FormSubmit integration
- `js/portfolio.js` — portfolio category filtering
- `assets/` — images, icons and fonts
- `docs/deployment.md` — GitHub Pages deployment notes

## Run locally

Open `index.html` directly in a browser, or run a local static server:

```text
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Adding portfolio projects

Add project cards to `portfolio.html`. Give each `.portfolio-card` a `data-category` of `web-app`, `website`, `backend` or `integration`. Replace concept copy and the icon with real project details only when verified. Add GitHub or live-demo links only when real URLs exist.

## Replacing images and the logo

Place project or page images in `assets/images/`. The KB monogram favicon is at `assets/images/logo/favicon.svg`. Update the same brand markup across pages if the logo or wordmark changes.

## Contact details

Update the business email in the HTML, `js/contact.js`, privacy page and README where required.

## Contact form setup

The form uses FormSubmit at `https://formsubmit.co/ajax/contact.kbdigitalworks@google.com`.

On first submission, FormSubmit sends an activation verification email to the destination address. Follow that verification link before production use. The endpoint is configured in `js/contact.js` in one clearly named `FORM_ENDPOINT` location.

The form includes inline validation, loading and success/error states, and a honeypot field. If delivery fails, it visibly provides an email fallback.

No API secret or private key is stored in frontend code.

## Deployment

Push changes to the `main` branch. In GitHub repository settings, enable Pages from **main** branch and **root** directory. The canonical site URL is `https://kb-digitalworks.github.io`.
