# ArtikelMeister website

Static site for ArtikelMeister, served by GitHub Pages at
https://kaankekec-sec.github.io/artikelmeister/ . Plain HTML, CSS and vanilla JS.
There is no build step: what you see in this folder is what gets published.

## Structure

- `index.html` - landing page (hero, features, demo, screenshots, downloads, FAQ)
- `privacy.html`, `terms.html`, `404.html`
- `assets/` - CSS, JS, fonts, images
- `assets/data/words.json` - words for the "Der, Die or Das?" demo
- `sitemap.xml`, `robots.txt`

All paths are relative so the site works under the `/artikelmeister/` sub-path.
Jekyll (classic GitHub Pages) skips any file or folder starting with `_` or `.`,
so do not use such names.

## Adding screenshots

The gallery is driven by the `SCREENSHOTS` array exported from `assets/js/screenshots.js`.
Drop images into `assets/screenshots/` and add or edit an entry in that array. Fields:

- `file`: file name inside `assets/screenshots/`. An empty string shows a "coming soon" frame.
- `device`: `"phone"` or `"desktop"`.
- `title`: short heading for the slide.
- `caption`: platform label, for example `"Android"`.
- `alt`: alt text describing the screenshot.
- `width`, `height` (optional): real pixel size of the image. Defaults are 1080x2340 for phone and 1440x900 for desktop.

If an image fails to load, the placeholder frame is shown instead. The social preview image is `assets/img/og-image.png`.

## Editing the demo words

Edit `assets/data/words.json` (loaded by `assets/js/demo.js`). Each entry looks like:

```json
{ "noun": "Tisch", "article": "der", "en": "table" }
```

Use a capitalized singular noun, a lowercase article (`der`, `die` or `das`),
and avoid nouns with more than one valid gender.

## Local preview

From the repository root:

```sh
python3 -m http.server
```

Then open http://localhost:8000/artikelmeister/ .

## Notes

Jekyll publishes this README as `README.html`. That is fine.

## Changing the domain

The base URL lives in `site.config.json`. Because this is a static site and crawlers do not run JavaScript, the URL is written literally into canonical/Open Graph tags, JSON-LD, `sitemap.xml`, `robots.txt` and the root-absolute links in `404.html`. To change it everywhere at once:

```sh
python3 artikelmeister/tools/set-base-url.py https://new.example.com/ --dry-run   # preview
python3 artikelmeister/tools/set-base-url.py https://new.example.com/             # apply
```

The script (Python 3.9+, standard library only) replaces the old base in all `.html`, `.xml`, `.txt`, `.json` and `.webmanifest` files, rewrites the `/artikelmeister/` path prefix in `404.html` links, and updates `site.config.json`.

## Search Console

`index.html` contains a commented-out `google-site-verification` meta tag. Uncomment it and paste the token from Search Console. Then submit `sitemap.xml` there.
