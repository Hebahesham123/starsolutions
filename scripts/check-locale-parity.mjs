/**
 * Does the Arabic content still mirror the English content?
 *
 *   node scripts/check-locale-parity.mjs
 *
 * English is read from Supabase at request time; Arabic is src/data/site.ar.json
 * in this repo. Nothing keeps them in step, so editing a solution or adding a
 * team member in /admin changes one locale and not the other — which is exactly
 * how the Arabic dataset went stale the first time, carrying a trading system
 * and two team members the English site did not have.
 *
 * This runs as `prebuild`, so the drift surfaces the next time the site is
 * deployed. Worth being honest about the limit: a content edit does not trigger
 * a build, so the gap between the edit and the warning is however long it is
 * until someone deploys. Catching it at edit time needs a Supabase webhook or a
 * scheduled job, not this.
 *
 * Errors are structural — an entry on one side and not the other, entries in a
 * different order, a field with no Arabic. Those mean a reader sees English
 * text on an Arabic page, or a page that does not exist. Warnings are prose
 * that is identical in both, which is usually a brand name and occasionally a
 * missed translation; a build is not the place to argue about that.
 *
 * SKIP_LOCALE_PARITY=1 downgrades everything to a warning, for the day an
 * urgent English-only fix has to ship past known Arabic drift.
 */
import { readFileSync, existsSync } from 'node:fs';

/* On Vercel the Supabase keys are already in the environment. Locally they are
   in .env.local, which plain node does not read — without this the check would
   compare against the seed on a laptop and against the database in CI, and
   disagree with itself. */
for (const file of ['.env.local', '.env']) {
  const path = new URL(`../${file}`, import.meta.url);
  if (!existsSync(path)) continue;
  for (const raw of readFileSync(path, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const at = line.indexOf('=');
    if (at < 1) continue;
    const name = line.slice(0, at).trim();
    const value = line.slice(at + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[name]) process.env[name] = value;
  }
}

const TABLES = {
  solutions: 'solutions',
  goals: 'goals',
  caseStudies: 'case_studies',
  systems: 'systems',
  automations: 'automations',
  team: 'team',
  testimonials: 'testimonials',
};

/** Prose. Everything else is structural and is copied from English verbatim. */
const TEXT = [
  'title', 'eyebrow', 'summary', 'short', 'tagline', 'badge', 'tag', 'type',
  'role', 'metric', 'metricLabel', 'before', 'after', 'kicker', 'note',
  'label', 'quote', 'name', 'company', 'result',
  /* Every one of these renders on a case card — the unit beside the figure,
     the caption under it, and the period after the delta. They were missing
     from this list, so five cards shipped reading "Orders after automation"
     and "in 6 weeks" in the middle of an Arabic page. */
  'kpiLabel', 'kpiUnit', 'period', 'delta',
];
const LISTS = ['points', 'stats'];

/** Names, not copy. Identical in both languages on purpose. */
const PROPER_NOUNS = new Set([
  'SEO Forge', 'Montre Co.', 'Beauty Bareg', 'Hollywood Clinics',
]);

/** Same length in both, checked by count rather than entry by entry. */
const PARALLEL = ['platforms', 'heroNodes', 'heroStats', 'process', 'nightLog', 'nightStats', 'figures'];

const soft = process.env.SKIP_LOCALE_PARITY === '1';
const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const keyOf = (row) => row.id ?? row.slug ?? row.name;

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));

/**
 * What a reader actually gets for a field the database has no column for.
 *
 * src/lib/content.ts fills those from the seed — `short` on automations is the
 * live example, since that migration has not been run — so a check that looked
 * only at the database rows would call a field absent that the page renders.
 * Same test it uses: a key missing entirely means no column, where a key
 * present and null means someone cleared it.
 */
function fillFromSeed(rows, seedRows) {
  const bySlug = new Map(seedRows.filter((r) => r.slug).map((r) => [r.slug, r]));
  return rows.map((row) => {
    const seeded = row.slug ? bySlug.get(row.slug) : undefined;
    if (!seeded) return row;
    const gaps = Object.entries(seeded).filter(([k]) => !(k in row));
    return gaps.length ? { ...row, ...Object.fromEntries(gaps) } : row;
  });
}

/** The English content as the site serves it: Supabase where it reads Supabase. */
async function englishContent(seed) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  /* Service role only. The anon key reads through row-level security, so a
     policy that hides a row would make this report drift that is not there —
     a build failing for a reason that does not exist is worse than one that
     compares against the seed and says so. */
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const out = { ...seed, source: 'seed' };
  if (!url || !key) {
    console.log('  Supabase not configured here — comparing against src/data/site.json.');
    console.log('  That still catches drift committed to the repo, but not a row edited in /admin.');
    return out;
  }
  try {
    for (const [field, table] of Object.entries(TABLES)) {
      const res = await fetch(`${url}/rest/v1/${table}?select=*&order=sort_order`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
      if (!res.ok) throw new Error(`${table}: HTTP ${res.status}`);
      out[field] = fillFromSeed(await res.json(), seed[field] ?? []);
    }
    out.source = 'supabase';
    return out;
  } catch (err) {
    /* A build must not fail because the database was briefly unreachable. The
       seed is still a real comparison, and the reason is printed. */
    console.log(`  Could not reach Supabase (${err.message}) — comparing against src/data/site.json.`);
    return { ...seed, source: 'seed' };
  }
}

function compareCollection(name, en, ar) {
  const enKeys = en.map(keyOf);
  const arKeys = ar.map(keyOf);

  for (const k of enKeys) if (!arKeys.includes(k)) fail(`${name}: "${k}" is on the English site and has no Arabic entry`);
  for (const k of arKeys) if (!enKeys.includes(k)) fail(`${name}: "${k}" is in the Arabic data and not on the English site`);
  if (enKeys.join('|') !== arKeys.join('|') && enKeys.length === arKeys.length) {
    fail(`${name}: same entries, different order\n      en: ${enKeys.join(', ')}\n      ar: ${arKeys.join(', ')}`);
  }

  const arBy = new Map(ar.map((r) => [keyOf(r), r]));
  for (const row of en) {
    const mate = arBy.get(keyOf(row));
    if (!mate) continue;
    for (const field of TEXT) {
      const v = row[field];
      if (typeof v !== 'string' || !v.trim()) continue;
      const a = mate[field];
      if (typeof a !== 'string' || !a.trim()) {
        fail(`${name}/${keyOf(row)}: "${field}" has no Arabic (English reads "${v.slice(0, 48)}")`);
      } else if (a === v && /[A-Za-z]{4}/.test(v) && !PROPER_NOUNS.has(v.trim())) {
        /* An error, not a warning. A prose field whose Arabic is the English
           string, letter for letter, is one nobody translated — which is how
           the case cards shipped with English captions. A name that is the
           same in both languages belongs in PROPER_NOUNS, where saying so is
           deliberate. */
        fail(`${name}/${keyOf(row)}: "${field}" is still the English string — "${v.slice(0, 48)}"`);
      }
    }
    for (const field of LISTS) {
      const v = row[field];
      if (!Array.isArray(v) || !v.length) continue;
      const a = mate[field];
      if (!Array.isArray(a) || a.length !== v.length) {
        fail(`${name}/${keyOf(row)}: "${field}" has ${v.length} in English and ${Array.isArray(a) ? a.length : 0} in Arabic`);
      }
    }
  }
}

const seed = read('src/data/site.json');
const ar = read('src/data/site.ar.json');
const en = await englishContent(seed);

console.log(`\nLocale parity — English from ${en.source}, Arabic from src/data/site.ar.json\n`);

for (const name of [...Object.keys(TABLES), 'projects']) {
  compareCollection(name, en[name] ?? [], ar[name] ?? []);
}

/* The two halves of the dictionary must not swap.
 *
 * Editing src/lib/i18n.ts by script is easy to get wrong: LOCALE_META has an
 * `ar: {` of its own twenty lines above the one inside STRINGS, and anchoring
 * on the first match rewrites the English dictionary with Arabic text while
 * leaving the Arabic one untouched. The site then serves Arabic to English
 * readers, and every check that compares content rather than chrome still
 * passes — which is exactly what happened, twice, before this existed.
 */
{
  const src = readFileSync(new URL('../src/lib/i18n.ts', import.meta.url), 'utf8');
  const lines = src.split(/\r?\n/);
  const stringsAt = lines.findIndex((l) => /^const STRINGS/.test(l));
  const arAt = lines.findIndex((l, i) => i > stringsAt && /^ {2}ar: \{/.test(l));
  const endAt = lines.findIndex((l, i) => i > arAt && /^ {2}\},/.test(l));
  const arabic = /[\u0600-\u06FF]/;
  /* The language switch is written in the language it switches *to*, on both
     sides — an English page offers "عربي" and an Arabic one offers "English".
     Those two are the exception this looks for and must not report. */
  const entryOf = (line) => {
    const m = line.match(/^\s*'([^']+)':\s*(["'])([\s\S]*)\2,\s*$/);
    return m ? { key: m[1], value: m[3] } : null;
  };
  const translatable = (e) => e && !e.key.startsWith('lang.');
  if (stringsAt < 0 || arAt < 0 || endAt < 0) {
    fail('i18n.ts: could not find the two dictionary blocks to check them');
  } else {
    const enHoldsArabic = lines.slice(stringsAt, arAt).map(entryOf)
      .filter((e) => translatable(e) && arabic.test(e.value))
      .map((e) => `${e.key} = ${e.value}`);
    const arHoldsLatin = lines.slice(arAt, endAt).map(entryOf)
      .filter((e) => translatable(e) && /[A-Za-z]{4}/.test(e.value) && !arabic.test(e.value))
      .map((e) => `${e.key} = ${e.value}`);
    if (enHoldsArabic.length) {
      fail(`i18n.ts: ${enHoldsArabic.length} English entr(ies) hold Arabic text`
        + ` — "${enHoldsArabic[0].slice(0, 40)}"`);
    }
    if (arHoldsLatin.length) {
      fail(`i18n.ts: ${arHoldsLatin.length} Arabic entr(ies) hold Latin-only text`
        + ` — "${arHoldsLatin[0].slice(0, 40)}"`);
    }
  }
}

/* The contact block is not a collection and was checked by nothing: the
   Arabic said "USA and UAE" while the English said "Cairo, Egypt", in the
   footer of every Arabic page. */
for (const field of ['locations']) {
  const a = en.contact?.[field];
  const b = ar.contact?.[field];
  if (typeof a === 'string' && a.trim() && a === b) {
    fail(`contact: "${field}" is still the English string — "${a}"`);
  }
  if (typeof a === 'string' && a.trim() && !b) {
    fail(`contact: "${field}" has no Arabic (English reads "${a}")`);
  }
}
for (const key of ['email', 'phone', 'whatsapp', 'offer']) {
  /* These are the same value in both by design — an address is an address. */
  if (en.contact?.[key] !== ar.contact?.[key]) {
    fail(`contact: "${key}" differs between locales — en "${en.contact?.[key]}", ar "${ar.contact?.[key]}"`);
  }
}

for (const key of PARALLEL) {
  const a = en[key];
  const b = ar[key];
  if (Array.isArray(a) && Array.isArray(b) && a.length !== b.length) {
    fail(`${key}: ${a.length} in English, ${b.length} in Arabic`);
  }
}
{
  const a = Object.keys(en.charts ?? {}).sort().join(',');
  const b = Object.keys(ar.charts ?? {}).sort().join(',');
  if (a !== b) fail(`charts: keys differ\n      en: ${a}\n      ar: ${b}`);
}

for (const w of warnings) console.log(`  warn   ${w}`);
for (const e of errors) console.log(`  DRIFT  ${e}`);

if (!errors.length) {
  console.log(`  Every entry matches. ${warnings.length} warning(s).\n`);
  process.exit(0);
}

console.log(`\n  ${errors.length} difference(s) between the two locales.`);
console.log('  Fix src/data/site.ar.json so it mirrors the English content, entry for entry.');
console.log('  To ship anyway, set SKIP_LOCALE_PARITY=1 for this build.\n');
process.exit(soft ? 0 : 1);
