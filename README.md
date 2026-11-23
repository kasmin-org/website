# kasmin.org website

Source of [kasmin.org](https://kasmin.org), the website of [Kasmin](https://github.com/kasmin-org/kasmin) –
Kids' Summer camp Admin. Built with [Astro Starlight](https://starlight.astro.build), in English and German.

- `src/content/docs/` – pages (English at the root, German in `de/`)
- `scripts/fetch-docs.mjs` – exports the documentation from the `docs/` folder of the kasmin repository: one
  version per MINOR release (newest PATCH), `latest`, and `dev` (develop branch); writes `src/versions.json` for
  the version menu in the header
- `npm run build` – export docs and build the site into `dist/`
- Deployment: GitHub Actions builds every push and pull request and uploads via FTPS (one FTP user per target):
  `main` → https://www.kasmin.org (production), `develop` → https://www-dev.kasmin.org (development, not indexed).
  A daily build picks up new releases. Server configuration per target: `server/htaccess-*`.
- `demo-menu/` – the small menu page of https://demo.kasmin.org (links to the German and English demo), deployed from `main`
- Branches: work on `feature/…` branches, pull requests to `develop`, then `develop` → `main`.

The website is public on purpose: corrections are welcome as issues or pull requests (German or English).
This website does not use cookies, tracking or external fonts.
