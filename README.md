# kasmin.org website

Source of [kasmin.org](https://kasmin.org), the website of [Kasmin](https://github.com/kasmin-org/kasmin) –
Kids' Summer camp Admin. Built with [Astro Starlight](https://starlight.astro.build), in English and German.

- `src/content/docs/` – pages (English at the root, German in `de/`)
- `scripts/fetch-docs.mjs` – exports the documentation from the `docs/` folder of the kasmin repository: one
  version per MINOR release (newest PATCH), `latest`, and `dev` (develop branch); writes `src/versions.json` for
  the version menu in the header
- `npm run build` – export docs and build the site into `dist/`
- Deployment: GitHub Actions builds every push and pull request; pushes to `main` are uploaded to the web space via
  FTPS. A daily build picks up new releases.

The website is public on purpose: corrections are welcome as issues or pull requests (German or English).
This website does not use cookies, tracking or external fonts.
