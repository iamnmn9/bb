# Baby Pundir's Neverland ✨

A Peter Pan themed baby shower site: invitation, Amazon registry and RSVP.
It is a plain static site (HTML/CSS/JS, no build step) hosted on GitHub Pages.

## Structure

```
site/                     ← everything that gets published
  index.html              ← landing page (Tinker Bell + "enter Neverland")
  neverland.html          ← inside page: invitation, countdown, registry, RSVP
  assets/css/style.css
  assets/js/sky.js        ← twinkling stars
  assets/js/skyline.js    ← lit windows in the London skyline
  assets/js/tinkerbell.js ← Tinker Bell + pixie dust trail
  assets/js/scene.js      ← opening sequence, "It's a Boy!" reveal, parallax
  assets/js/neverland.js  ← countdown + cards rising into view
.github/workflows/
  pages.yml               ← deploys site/ to GitHub Pages on push to main
  check.yml               ← validates the HTML on PRs and pushes
```

## Preview locally

```sh
python3 -m http.server -d site 8000
# open http://localhost:8000
```

## Publishing (one-time setup)

1. On GitHub go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Merge to `main` (or run the *Deploy to GitHub Pages* workflow manually from the **Actions** tab).

The site will be live at `https://<your-github-username>.github.io/bb/`.
Share that link with everyone!
