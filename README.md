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
  assets/js/skyline.js    ← loads the London night scene (assets/img/london.svg)
  assets/js/tinkerbell.js ← Tinker Bell + pixie dust trail
  assets/js/scene.js      ← opening sequence, "It's a Boy!" reveal, parallax
  assets/js/neverland.js  ← countdown + cards rising into view
  assets/js/intro.js      ← opening flight across the sky before the landing page
  assets/js/music.js      ← background song, shared by both pages
  assets/img/             ← character images
  assets/audio/           ← background song
tools/make_london.py      ← draws assets/img/london.svg (run: python3 tools/make_london.py)
tools/make_palace.py      ← draws the palace into neverland.html (run: python3 tools/make_palace.py)
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

## RSVPs

The RSVP form on `neverland.html` posts to Formspree (form `xoeejaab`), which emails each reply to the account owner and keeps them in the Formspree dashboard. The free plan allows 50 submissions a month.

## Image credits

- Shri Ganesh: "Shri Mangalmurti", Ravi Varma Press, c. 1900 (public domain, via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Sri_Mangalmurthy.jpg)).
