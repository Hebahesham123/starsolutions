/**
 * English left on an Arabic page.
 *
 *   npm run start            # in another terminal
 *   npm run check:ar-text
 *
 * Walks every Arabic route and reports visible text that has no Arabic in it.
 * Three rounds of this were found by hand from screenshots — the automations
 * sub-heading, the contact form, the comparison labels, the crumb on every
 * detail page — because a string only has to be missed once at the call site
 * to ship, and nothing about the page looks wrong until someone reads it.
 *
 * Names are not copy: the brand lockup, platform names, the address and the
 * discount code are the same in both languages and are listed below. Anything
 * inside lang="en" is skipped, which is how the dated mock of the old website
 * on a project page declares itself a picture rather than prose.
 */
import { chromium } from 'playwright';
const B = process.env.BASE ?? 'http://localhost:3000';
const ROUTES = ['/ar', '/ar/solutions', '/ar/goals', '/ar/systems', '/ar/automations',
  '/ar/case-studies', '/ar/team', '/ar/work', '/ar/about', '/ar/contact',
  '/ar/process', '/ar/results',
  '/ar/solutions/revenue-automation', '/ar/goals/increase-revenue',
  '/ar/systems/seo-forge', '/ar/automations/ecommerce-chatbot',
  '/ar/case-studies/beauty-brand', '/ar/team/heba-hesham', '/ar/work/hollywood-clinics'];

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
const found = new Map();
for (const route of ROUTES) {
  await p.goto(B + route, { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  const hits = await p.evaluate(() => {
    /* Names that are the same in any language. */
    const ALLOW = new RegExp(`^(${["star","solution","star solution","starsolution","starsolution\\.ai","automate","connect","grow","shopify","whatsapp","meta","meta ads","ads","google","google ads","google analytics 4","google tag manager","google search console","microsoft clarity","tiktok","n8n","openai","openai api","ai agent","next\\.js","api","apis","webhooks","ui/ux","seo","qr","cloud api","sms","vip","roas","ga4","saas","cod","eta","p&l","crm","html","css","js","seo forge","montre co\\.","beauty bareg","hollywood clinics","info@starsolution\\.ai","star15","©\\s*\\d{4}\\s*starsolution\\.ai\\s*—?"].join("|")})$`, "i");
    const out = [];
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walk.nextNode())) {
      const el = n.parentElement;
      if (!el || el.closest('script,style,noscript')) continue;
      if (el.closest('[lang="en"]')) continue;            // marked English on purpose
      if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue;
      const t = n.textContent.trim();
      if (!t || t.length < 3) continue;
      if (/[\u0600-\u06FF]/.test(t)) continue;            // contains Arabic, fine
      const letters = t.replace(/[^A-Za-z]/g, '');
      if (letters.length < 3) continue;                   // numbers, symbols, units
      if (ALLOW.test(t)) continue;
      out.push({ text: t.slice(0, 90), cls: String(el.className || el.tagName).slice(0, 38) });
    }
    return out;
  });
  for (const h of hits) {
    const key = h.text;
    if (!found.has(key)) found.set(key, { ...h, routes: [] });
    found.get(key).routes.push(route);
  }
}
console.log(found.size ? `${found.size} untranslated string(s) on Arabic pages:` : 'no untranslated text on any Arabic page');
for (const [text, v] of found) {
  console.log(`\n  "${text}"`);
  console.log(`     in .${v.cls}   on ${v.routes.length} page(s): ${v.routes.slice(0, 4).join(', ')}`);
}
await b.close();
