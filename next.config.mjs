/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },

  /**
   * /pricing was a live page on the old site and is not one here. Anything
   * still pointing at it — an ad, an email, a search result — lands on the
   * contact page rather than on a 404.
   *
   * Temporary, not permanent: a 308 is cached hard by browsers and would be
   * awkward to undo if the pricing page comes back, which is the stated plan.
   * A 307 costs a redirect every time and keeps that door open.
   */
  async redirects() {
    return [
      { source: '/pricing', destination: '/contact', permanent: false },
      /* The Vercel production alias served a full copy of the site, which
         Google can index as a duplicate. Send it to the real domain (308).
         Matches this one host only, so preview deployments still work. */
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'starsolutions-eight.vercel.app' }],
        destination: 'https://www.starsolution.ai/:path*',
        permanent: true,
      },
    ];
  },
};
export default nextConfig;
