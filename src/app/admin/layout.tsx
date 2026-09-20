import type { Metadata } from 'next';
import './admin.css';
import { LocaleDocument } from '@/components/LocaleDocument';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · StarSolution admin' },
  robots: { index: false, follow: false },
};

/**
 * Wraps everything under /admin, including the login page, which is why the
 * stylesheet is imported here rather than in the (dashboard) group.
 *
 * It renders the document itself now. There is no app/layout.tsx any more —
 * each locale group owns its own `<html>` so `lang` and `dir` can be static —
 * and /admin is a third group with neither locale's chrome. What it did
 * inherit from the old shared root was the stylesheets, and LocaleDocument
 * still brings those.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <LocaleDocument locale="en">{children}</LocaleDocument>;
}
