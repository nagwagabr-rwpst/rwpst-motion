# RWPST MOTION — Landing Page

Single-page marketing site for **RWPST MOTION**, an AI-powered creative studio. Built with pure HTML, CSS, and vanilla JavaScript. Optimized for **GitHub Pages** with custom domain support at [rwpst.com](https://rwpst.com).

## Project structure

```
deployment/
├── CNAME                 # Custom domain (rwpst.com)
├── .nojekyll             # Disables Jekyll processing on GitHub Pages
├── index.html            # Main page
├── README.md
└── assets/
    ├── Brand/
    │   └── logo.png
    ├── css/
    │   └── styles.css
    ├── js/
    │   ├── main.js
    │   └── i18n.js
    └── videos/
        ├── watch-ad.mp4
        ├── perfume-ad.mp4
        ├── burger-ad.mp4
        ├── clinic-ad.mp4
        └── realestate.mp4
```

All asset paths are **relative** (e.g. `assets/css/styles.css`, `assets/videos/watch-ad.mp4`) so the site works at the domain root without a build step.

## Local preview

From the `deployment/` folder:

```bash
# Python
python -m http.server 8080

# Node.js (npx)
npx serve .
```

Open `http://localhost:8080` and verify:

- Logo, CSS, and JS load
- Portfolio videos play (inline for vertical ads; landscape modal for Real Estate)
- Language switcher (AR / EN)
- WhatsApp floating button and contact links
- Mobile layout (resize browser or use DevTools device mode)

## Deploy to GitHub Pages

Repository: `rwpst-dev/rwpst-platform`

### Option A — Publish from `/deployment` folder (recommended)

This repo keeps the site in the `deployment/` subdirectory.

1. Push all changes to GitHub:

   ```bash
   git add deployment/
   git commit -m "Deploy RWPST MOTION landing page"
   git push origin main
   ```

2. In GitHub: **Settings → Pages**

   - **Source:** Deploy from a branch
   - **Branch:** `main`
   - **Folder:** `/deployment`
   - Save

3. Wait 1–3 minutes. GitHub will build and publish the site.

4. Confirm `deployment/CNAME` is present in the repo — GitHub Pages reads it automatically for the custom domain.

### Option B — Dedicated `gh-pages` branch

If you prefer the site at the repository root of a publish branch:

```bash
git subtree push --prefix deployment origin gh-pages
```

Then set **Settings → Pages** to branch `gh-pages` and folder `/ (root)`.

## Custom domain — rwpst.com

The `CNAME` file contains:

```
rwpst.com
```

### DNS configuration

At your domain registrar (or DNS provider), add:

| Type  | Name | Value                    |
|-------|------|--------------------------|
| `A`   | `@`  | `185.199.108.153`        |
| `A`   | `@`  | `185.199.109.153`        |
| `A`   | `@`  | `185.199.110.153`        |
| `A`   | `@`  | `185.199.111.153`        |
| `CNAME` | `www` | `rwpst-dev.github.io` |

> Use the four GitHub Pages `A` records above. If GitHub shows different values in **Settings → Pages → Custom domain**, prefer those.

### Enable HTTPS

1. **Settings → Pages → Custom domain** → enter `rwpst.com`
2. Enable **Enforce HTTPS** once DNS has propagated (can take up to 24 hours)

## Video assets

Portfolio videos are served as static MP4 files from `assets/videos/`.

| File              | Used by                    |
|-------------------|----------------------------|
| `watch-ad.mp4`    | Watch Ad                   |
| `perfume-ad.mp4`  | Perfume Ad                 |
| `burger-ad.mp4`   | Burger Ad                  |
| `clinic-ad.mp4`   | Speech Therapy Clinic Ad   |
| `realestate.mp4`  | Real Estate Ad (wide card) |

**GitHub limits:** individual files must be under **100 MB**. Current videos are within that limit.

**Adding or replacing videos:**

1. Place `.mp4` files in `assets/videos/`
2. Keep filenames lowercase with hyphens (matches `index.html` `<source>` paths)
3. Commit and push — no code changes needed if filenames stay the same

If videos grow beyond 100 MB, use [Git LFS](https://git-lfs.github.com/) or host videos on a CDN and update the `<source src="...">` paths.

## Mobile responsiveness

The site is **mobile-first** with breakpoints at:

| Breakpoint   | Layout highlights                                      |
|--------------|--------------------------------------------------------|
| `< 640px`    | Single-column layout, hamburger nav, stacked CTAs      |
| `≥ 640px`    | 2-column portfolio/services grids                      |
| `≥ 1024px`   | Desktop nav, 4-column portfolio, wide Real Estate row  |

Verified areas:

- Viewport meta tag (`width=device-width, initial-scale=1.0`)
- Responsive typography (`clamp()` for headings)
- Touch-friendly nav and play buttons
- Floating WhatsApp button (tooltip hidden on small screens)
- `prefers-reduced-motion` support for animations

Test on real devices or Chrome DevTools: iPhone SE, iPhone 14, iPad, and desktop 1440px.

## Post-deployment checklist

- [ ] `https://rwpst.com` loads `index.html`
- [ ] Logo appears in navbar and footer
- [ ] All 5 portfolio videos play
- [ ] Real Estate ad opens landscape lightbox modal
- [ ] WhatsApp links open `https://wa.me/01006786392`
- [ ] AR / EN language switch works
- [ ] HTTPS enforced in GitHub Pages settings
- [ ] No mixed-content warnings in browser console

## Updating content

| What to change        | Where                                              |
|-----------------------|----------------------------------------------------|
| Page copy (AR / EN)   | `assets/js/i18n.js`                                |
| Styles / layout       | `assets/css/styles.css`                            |
| Portfolio videos      | `assets/videos/` + `index.html` if filenames change |
| Logo                  | `assets/Brand/logo.png`                            |
| WhatsApp number       | `index.html` + `assets/js/i18n.js` (`waUrl`)       |
| SEO / domain meta     | `index.html` `<head>`                              |

After edits, commit and push. GitHub Pages redeploys automatically.

## Troubleshooting

**404 on assets**  
Confirm GitHub Pages folder is set to `/deployment` and paths start with `assets/` (no leading `/`).

**Videos show “Add Video” placeholder**  
- Check the file exists in `assets/videos/` with exact filename casing  
- Ensure the file was committed and pushed (not in `.gitignore`)  
- Hard-refresh the browser (`Ctrl+Shift+R`)

**Custom domain not working**  
- Verify DNS records and wait for propagation  
- Confirm `CNAME` file is in the published folder (`deployment/CNAME`)  
- Check **Settings → Pages** for DNS verification status

**Large push fails**  
Video files are ~60 MB total. If push times out, use Git LFS or split large assets.

---

© RWPST MOTION
