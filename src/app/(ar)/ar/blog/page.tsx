import type { Metadata } from 'next';
import { BlogIndex } from '@/components/post/BlogIndex';
import { getDict } from '@/lib/i18n';
import { alternates, withSeo } from '@/lib/seo';

const t = getDict('ar');

export const metadata: Metadata = withSeo({
  alternates: alternates('ar', '/blog'), title: t('page.blog.title'), description: t('page.blog.lede') });

/* Live Arabic posts only; a publish in /admin revalidates this page at once. */
export const revalidate = 60;

export default function ArabicBlogIndexPage() {
  return <BlogIndex locale="ar" />;
}
