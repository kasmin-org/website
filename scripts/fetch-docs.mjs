// Builds the versioned documentation (D8, V03, V07): for every MINOR version the docs/ folder of its newest
// PATCH tag of kasmin-org/kasmin, plus "latest" (newest release) and "dev" (develop branch).
// Output: src/content/docs/docs/<slug>/… and src/versions.json for the version menu.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const repo = process.env.KASMIN_REPO ?? 'https://github.com/kasmin-org/kasmin.git';
const devBranch = process.env.KASMIN_DEV_BRANCH ?? 'develop';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kasmin-docs-'));
const git = (...args) => execFileSync('git', args, { cwd: tmp, encoding: 'utf8' }).trim();

execFileSync('git', ['clone', '--quiet', '--no-checkout', '--filter=blob:none', repo, tmp]);
const tags = git('tag', '--list', 'v*.*.*').split('\n').filter((t) => /^v\d+\.\d+\.\d+$/.test(t));
const parse = (t) => t.slice(1).split('.').map(Number);
const newestPerMinor = new Map();
for (const tag of tags) {
	const [maj, min, pat] = parse(tag);
	const key = `${maj}.${min}`;
	if (!newestPerMinor.has(key) || parse(newestPerMinor.get(key))[2] < pat) newestPerMinor.set(key, tag);
}
const releases = [...newestPerMinor.values()].sort((a, b) => {
	const [x, y] = [parse(a), parse(b)];
	return y[0] - x[0] || y[1] - x[1] || y[2] - x[2];
});

const out = 'src/content/docs/docs';
fs.rmSync(out, { recursive: true, force: true });
const versions = [];

function exportDocs(ref, slug, label, current) {
	const dir = path.join(out, slug);
	fs.mkdirSync(dir, { recursive: true });
	const files = git('ls-tree', '-r', '--name-only', ref, 'docs').split('\n').filter((f) => f.endsWith('.md'));
	const pages = [];
	for (const file of files) {
		let text = git('show', `${ref}:${file}`);
		const rel = file.replace(/^docs\//, '').replace(/\.md$/, '');
		const h1 = text.match(/^# (.+)$/m);
		const title = h1 ? h1[1].trim() : path.basename(rel);
		text = text.replace(/^# .+\n+/m, '');
		// Relative links to other Markdown files → Starlight routes.
		text = text.replace(/\]\((?!https?:)([^)#]+)\.md(#[^)]*)?\)/g, (_, p, hash) => `](../${p.replace(/^\.\.\/\.\.\//, '')}/${hash ?? ''})`);
		const target = path.join(dir, `${rel}.md`);
		fs.mkdirSync(path.dirname(target), { recursive: true });
		fs.writeFileSync(target, `---\ntitle: ${JSON.stringify(title)}\n---\n\n${text}`);
		pages.push(rel);
	}
	versions.push({ slug, label, current, ref, pages });
}

if (releases.length > 0) {
	exportDocs(releases[0], 'latest', `${releases[0].slice(1)} (latest)`, true);
	for (const tag of releases.slice(1)) exportDocs(tag, tag.slice(1, tag.lastIndexOf('.')), tag.slice(1), false);
}
exportDocs(`origin/${devBranch}`, 'dev', 'development', releases.length === 0);

fs.writeFileSync('src/versions.json', JSON.stringify(versions, null, 2) + '\n');
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`Docs exported: ${versions.map((v) => `${v.label} (${v.pages.length} pages)`).join(', ')}`);
