import Link from 'next/link';
import { Icon } from './Icon';
import { LogoStatic } from './ui/LogoStatic';
import { site } from '@/lib/content';

export function SiteFooter() {
  const { contact } = site;
  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="brand" aria-label="Star Solution — home">
              <LogoStatic size={34} showTagline={false} variant="dark" />
            </Link>
            <p>Automate your business, grow your revenue.</p>
            <Link href="/contact" className="btn btn-primary btn-sm mt-5">Get free audit</Link>
          </div>

          <nav aria-labelledby="fProduct">
            <h2 id="fProduct" className="footer-h">Product</h2>
            <ul>
              <li><Link href="/solutions">Solutions</Link></li>
              <li><Link href="/results">Results</Link></li>
              <li><Link href="/work">Our work</Link></li>
              <li><Link href="/blog">Blog</Link></li>
            </ul>
          </nav>

          <nav aria-labelledby="fCompany">
            <h2 id="fCompany" className="footer-h">Company</h2>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/team">Team</Link></li>
              <li><Link href="/case-studies">Case studies</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </nav>

          {/* Docs and the two legal pages came across from the previous site.
              Nothing linked to them here, and a page nothing links to is a page
              nobody finds — the footer is where these belong anyway. */}
          <nav aria-labelledby="fMore">
            <h2 id="fMore" className="footer-h">More</h2>
            <ul>
              <li><Link href="/docs">Docs</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/terms">Terms</Link></li>
            </ul>
          </nav>

          <div>
            <h2 className="footer-h">Contact</h2>
            <ul className="footer-contact">
              <li><Icon name="mail" /><a href={`mailto:${contact.email}`}>{contact.email}</a></li>
              <li><Icon name="phone" /><a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a></li>
              <li><Icon name="pin" /><span>{contact.locations}</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 StarSolution.ai — All rights reserved.</p>
          <p className="footer-code"><strong className="font-mono">{contact.offer}</strong> — 15% off first service</p>
        </div>
      </div>
    </footer>
  );
}
