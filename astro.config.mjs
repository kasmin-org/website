// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import fs from 'node:fs';

// Documentation versions are built by scripts/fetch-docs.mjs from the tags of kasmin-org/kasmin (D8, V06, V07).
const versions = JSON.parse(fs.readFileSync('./src/versions.json', 'utf8'));

export default defineConfig({
	site: 'https://kasmin.org',
	integrations: [
		starlight({
			title: 'Kasmin',
			description: "Kids' Summer camp Admin – open-source management for children's summer camps.",
			logo: { light: './src/assets/logo-light.svg', dark: './src/assets/logo-dark.svg', replacesTitle: true },
			favicon: '/favicon.svg',
			head: [
				{ tag: 'link', attrs: { rel: 'icon', href: '/favicon.ico', sizes: '48x48' } },
				{ tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } },
				{ tag: 'link', attrs: { rel: 'manifest', href: '/site.webmanifest' } },
				{ tag: 'meta', attrs: { property: 'og:image', content: 'https://kasmin.org/og-image.png' } },
			],
			defaultLocale: 'root',
			locales: {
				root: { label: 'English', lang: 'en' },
				de: { label: 'Deutsch', lang: 'de' },
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/kasmin-org/kasmin' }],
			customCss: ['./src/styles/kasmin.css'],
			components: { ThemeSelect: './src/components/HeaderExtras.astro' },
			sidebar: [
				{ label: 'Kasmin', translations: { de: 'Kasmin' }, items: [
					{ slug: 'about' },
					{ slug: 'built-with-ai' },
					{ slug: 'screenshots' },
					{ slug: 'imprint' },
				] },
				...versions.map((v) => ({
					label: `Documentation ${v.label}`,
					translations: { de: `Dokumentation ${v.label}` },
					collapsed: !v.current,
					items: [{ autogenerate: { directory: `docs/${v.slug}` } }],
				})),
			],
		}),
	],
});
