// Screenshots for the website from a throwaway Kasmin instance with demo data (no real data):
//   node scripts/screenshots.mjs <base url> <de|en> <portal link phone> <portal link desktop> <admin link phone> <admin link desktop>
// The links come from `php artisan kasmin:login-link`; the second factor is switched off in that instance only.
// PLAYWRIGHT_FROM: path of a package.json next to an installed @playwright/test (e.g. the kasmin repository).
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import sharp from 'sharp';

const { chromium, devices } = createRequire(process.env.PLAYWRIGHT_FROM ?? import.meta.url)('@playwright/test');

const [base, lang, ...links] = process.argv.slice(2);
const out = `public/screenshots/${lang}`;
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const locale = lang === 'de' ? 'de-AT' : 'en-GB';
const device = {
	phone: { ...devices['Pixel 7'], locale },
	desktop: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, locale },
};
const shots = {
	portal: [['portal', '/portal']],
	admin: [['dashboard', '/admin'], ['statistics', '/admin/reports'], ['invoices', '/admin/invoices'], ['automations', '/admin/automations'], ['import', '/admin/import/people']],
};
for (const [i, [area, name]] of [['portal', 'phone'], ['portal', 'desktop'], ['admin', 'phone'], ['admin', 'desktop']].entries()) {
	const page = await (await browser.newContext(device[name])).newPage();
	await page.goto(links[i]);
	await page.locator('form button').first().click();
	await page.waitForLoadState('networkidle');
	for (const [file, path] of shots[area]) {
		const response = await page.goto(base + path, { waitUntil: 'networkidle' });
		if (response && response.status() !== 200) throw new Error(`${path}: ${response.status()}`);
		await page.waitForTimeout(400);
		await sharp(await page.screenshot()).webp({ quality: 82 }).toFile(`${out}/${file}-${name}.webp`);
	}
}
await browser.close();
