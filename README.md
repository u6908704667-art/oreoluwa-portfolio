# Oreoluwa Adedeji — 3D Motion Graphics Portfolio

A cinematic, single-page portfolio with a WebGL hero (your portrait rendered through a custom GLSL shader with chromatic shift, displacement waves, a gold particle field and mouse parallax), buttery GSAP + ScrollTrigger motion, Lenis smooth scroll, animated counters, magnetic cursor and 3D-tilt project cards.

## Stack
- **Three.js** (r128) — WebGL hero shader + particles
- **GSAP + ScrollTrigger** — scroll-driven animation
- **Lenis** — smooth scrolling
- Vanilla HTML/CSS/JS — zero build step, fully static

## Structure
```
.
├─ index.html        # markup + styles
├─ main.js           # WebGL + motion engine
├─ vercel.json       # static hosting config + asset caching
└─ assets/
   ├─ portrait_main.jpg  # hero texture
   └─ portrait_sq.jpg    # about-section portrait
```

## Run locally
It's fully static — just serve the folder:
```bash
npx serve .
# or
python3 -m http.server 8080
```
Then open the printed URL. (Open via a server, not `file://`, so the WebGL texture loads.)

## Deploy to Vercel
1. Push this folder to a GitHub repo.
2. On vercel.com → **Add New → Project** → import the repo.
3. Framework preset: **Other**. Build command: _none_. Output dir: `./`.
4. Deploy. Done — it's a static site, so it goes live in seconds.

Or from the CLI: `npm i -g vercel && vercel`.

## Customize
- Email / social links live at the bottom of `index.html` (search `davere2x@gmail.com`).
- Colors are CSS variables at the top of `index.html` (`--gold`, `--amber`, `--bg`).
- Swap the portrait by replacing the files in `assets/`.
