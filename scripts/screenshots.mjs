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
// [file, path, selector to scroll to]; EVENT is replaced by the address of the first event, CHILD by the first child in the portal.
const shots = {
	portal: [['portal', '/portal'], ['portal-safety-sheet', 'CHILD']],
	admin: [['dashboard', '/admin'], ['people', '/admin/people'], ['participants', 'EVENT/edit', '.fi-ta'], ['groups', 'EVENT/groups', '[data-division]'],
		['lists', '/admin/lists'], ['statistics', '/admin/reports'], ['invoices', '/admin/invoices'], ['mail-templates', '/admin/mail-templates'], ['automations', '/admin/automations'],
		['import', '/admin/import/people'], ['system', '/admin/system']],
};
for (const [i, [area, name]] of [['portal', 'phone'], ['portal', 'desktop'], ['admin', 'phone'], ['admin', 'desktop']].entries()) {
	const page = await (await browser.newContext(device[name])).newPage();
	await page.goto(links[i]);
	await page.locator('form button').first().click();
	await page.waitForLoadState('networkidle');
	let event = '';
	let child = '';
	if (area === 'admin') {
		await page.goto(base + '/admin/events', { waitUntil: 'networkidle' });
		event = new URL((await page.locator('.fi-ta-row a[href*="/edit"]').first().getAttribute('href')).replace('/edit', '')).pathname;
	} else {
		child = await page.locator('a[href*="/portal/children/"]').first().getAttribute('href').then((h) => new URL(h, base).pathname).catch(() => '/portal');
	}
	for (const [file, raw, selector] of shots[area]) {
		const path = raw.replace('EVENT', event).replace('CHILD', child);
		const response = await page.goto(base + path, { waitUntil: 'networkidle' });
		if (response && response.status() !== 200) throw new Error(`${path}: ${response.status()}`);
		if (selector) await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); // tables below the form load when they come into view
		if (selector) await page.locator(selector).first().waitFor({ timeout: 10000 }).catch(() => {});
		if (selector) await page.locator(selector).first().evaluate((el) => { el.scrollIntoView({ block: 'start' }); window.scrollBy(0, -110); document.querySelectorAll('.fi-main-ctn, .fi-main, main').forEach((m) => m.scrollBy?.(0, -110)); }).catch(() => {});
		await page.waitForTimeout(600);
		await sharp(await page.screenshot()).webp({ quality: 82 }).toFile(`${out}/${file}-${name}.webp`);
	}
}
await browser.close();
