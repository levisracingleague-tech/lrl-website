# Levi's Racing League Website

Official static website package for Levi's Racing League.

## Recommended repository

Create this repository inside the `levisracingleague-tech` GitHub organization:

```text
lrl-website
```

The public website address will then normally be:

```text
https://levisracingleague-tech.github.io/lrl-website/
```

## Publish with GitHub Pages

1. Create a new public repository named `lrl-website`.
2. Upload every file and folder from this package to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select branch **main** and folder **/(root)**.
6. Save and wait for the deployment to finish.

`index.html` must remain in the selected publishing root.

## Updating league information

Most content is stored in:

```text
site-data.js
```

Edit that file to update:

- calendar and venue vote
- teams
- staff
- sponsor prices
- Discord, TikTok, regulations and GitHub links

The layout and styling are in:

```text
styles.css
```

## Files

```text
index.html
styles.css
script.js
site-data.js
.nojekyll
assets/
  lrl-logo.png
  favicon.png
```
