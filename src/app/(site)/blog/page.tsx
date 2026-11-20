import type { Metadata } from 'next';
import { BlogIndex } from '@/components/post/BlogIndex';
import { alternates, withSeo } from '@/lib/seo';

export const metadata: Metadata = withSeo({
  alternates: alternates('en', '/blog'), title: 'Blog' });

/* Live posts only; a publish in /admin revalidates this page at once. */
export const revalidate = 60;

export default function BlogIndexPage() {
  return <BlogIndex locale="en" />;
}
