Mukoni Website — Controls, Accessibility, and Local Audit

Overview
- This repository contains a minimal static site for Mukoni Integrated Service.
- Visual theme: dark, premium with metallic bronze accents and glassmorphism.

Keyboard & Controls
- Sidebar: open/close with the hamburger button; `Esc` closes the sidebar.
- While sidebar is open, `Tab` cycles inside the sidebar (focus trap).
- Slideshow: use `ArrowRight` and `ArrowLeft` to navigate slides.
- Slide dots are keyboard-focusable buttons and announce the slide when selected.

Contact Form Behavior
- The contact form (`/contact.html`) performs client-side validation (required fields and basic email pattern).
- On submit, the form uses a `mailto:` fallback to open the user's email client with a prefilled subject/body (no backend).

Accessibility Summary
- ARIA attributes added: `aria-expanded`, `aria-controls`, `role="navigation"` for sidebar; slideshow uses `aria-roledescription="carousel"`, slides use `aria-hidden`, dots use `aria-current`, and a visually-hidden live announcer is updated when slides change.
- Focus styles and visible focus outlines were added for keyboard users.

Running locally
1) Simple static server (Python):

```powershell
# From repository root
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

2) Using Node (serve):

```powershell
npm install -g serve
serve -s . -l 5000
# then open http://localhost:5000
```

3) NPM scripts (optional)
- Add a simple `package.json` in the project root and use `npx` to run Pa11y without global install.

Accessibility audit (quick)
- Pa11y (quick CLI):

```powershell
npm install -g pa11y
# Run a local server (see above), then:
pa11y http://localhost:8000
```

- axe-core (via pa11y or browser extensions):
  - Use the axe DevTools browser extension for interactive scans.
  - Or use `npx pa11y-ci`/`pa11y` for CLI checks.

NPM audit script (example)
1. Create `package.json` with the script `audit:pa11y`.

```json
{
  "name": "mukoni-website",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "npx serve -s . -l 5000",
    "audit:pa11y": "npx pa11y http://localhost:5000"
  }
}
```

Notes
- The repo intentionally uses a `mailto:` fallback — if you want a server-side form, I can scaffold a small server and API endpoint.
- If you want, I can add a `package.json` and install `pa11y` as a dev dependency and run a local audit.

If you want me to run an automated audit now, tell me which tool you prefer (Pa11y CLI or axe via Node) and I will add scripts and run it locally (you'll need Node/npm installed).