'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="py-10 border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-heading font-bold text-heading">Start Solution<span className="text-primary">.ai</span></span>
            </div>
            <p className="text-sm text-muted">Automate your business, grow your revenue.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-heading mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/#solutions" className="hover:text-primary transition-colors">Solutions</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading font-bold text-heading mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold text-heading mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li className="hover:text-primary transition-colors">
                <a href="mailto:info@starsolution.ai">info@starsolution.ai</a>
              </li>
              <li className="hover:text-primary transition-colors">
                <a href="tel:+201234567890">+20 123 456 7890</a>
              </li>
              <li>USA & UAE</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">&copy; 2026 Start Solution .ai — All rights reserved.</p>
          <div className="flex items-center gap-4 text-muted">
            <a href="#" aria-label="Instagram" className="hover:text-primary transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
              </svg>
            </a>
            <a href="#" aria-label="TikTok" className="hover:text-primary transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.11v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.16 15.2a6.34 6.34 0 0010.86 4.46 6.21 6.21 0 001.83-4.46V8.76a8.26 8.26 0 004.79 1.53v-3.4a4.85 4.85 0 01-1.05-.2z" />
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-primary transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
