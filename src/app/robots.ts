import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/schema';

/**
 * /robots.txt — everything public is crawlable; the dashboard and the API
 * are not. /admin is also behind a login, so this only stops crawlers
 * wasting their budget on redirects to the login page.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
