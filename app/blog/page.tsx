'use client'

import Link from 'next/link'

export default function Blog() {
  const blogPosts = [
    {
      slug: 'how-to-automate-shopify-orders',
      title: '10 Ways AI Can Increase Your Shopify Revenue in 30 Days',
      excerpt: 'Learn how AI automation can help you recover abandoned carts, optimize pricing, and boost your average order value.',
      author: 'Ahmed Hassan',
      date: 'Mar 15, 2026',
      category: 'Automation',
      readTime: '5 min read',
    },
    {
      slug: 'instagram-growth-strategy-2026',
      title: 'The Ultimate Instagram Growth Strategy for E-commerce Brands',
      excerpt: 'Discover how to grow your Instagram followers from 0 to 10K in 90 days using AI and automation.',
      author: 'Layla Omar',
      date: 'Mar 10, 2026',
      category: 'Social Media',
      readTime: '7 min read',
    },
    {
      slug: 'facebook-ads-optimization',
      title: 'How to Cut Your Facebook Ad Costs by 40% with AI',
      excerpt: 'Stop wasting money on ads. Let AI optimize your campaigns for maximum ROI.',
      author: 'Omar Hassan',
      date: 'Mar 5, 2026',
      category: 'Ads',
      readTime: '6 min read',
    },
    {
      slug: 'chatbot-customer-service',
      title: 'The Complete Guide to AI Chatbots for Customer Service',
      excerpt: 'How to handle 80% of customer inquiries automatically and still maintain a personal touch.',
      author: 'Heba Ahmed',
      date: 'Feb 28, 2026',
      category: 'Customer Service',
      readTime: '8 min read',
    },
    {
      slug: 'marketing-automation-basics',
      title: 'Marketing Automation 101: A Beginner\'s Guide',
      excerpt: 'Everything you need to know about automating your marketing and saving 20+ hours per week.',
      author: 'Ahmed Hassan',
      date: 'Feb 20, 2026',
      category: 'Marketing',
      readTime: '9 min read',
    },
    {
      slug: 'tiktok-ecommerce-2026',
      title: 'TikTok for E-commerce: The Future of Social Selling',
      excerpt: 'Why TikTok is the fastest-growing platform for e-commerce and how to leverage it.',
      author: 'Layla Omar',
      date: 'Feb 15, 2026',
      category: 'Social Media',
      readTime: '6 min read',
    },
  ]

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header */}
      <section className="py-20 sm:py-28 bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 fade-up">
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Blog</p>
            <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-heading mb-4">
              Growth & Automation Tips
            </h1>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Expert insights on automating your business, scaling revenue, and growing your audience.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post, index) => (
              <Link
                key={index}
                href={`/blog/${post.slug}`}
                className={`bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-primary/30 card-hover fade-up ${
                  ['', 'd1', 'd2', 'd1', 'd2', 'd3'][index % 6]
                }`}
              >
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-cta/10 flex items-center justify-center">
                  <div className="text-6xl">📝</div>
                </div>
                <div className="p-6">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-3">
                    {post.category}
                  </span>
                  <h3 className="font-heading text-lg font-bold text-heading mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <div className="flex items-center gap-1">
                      <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold">
                        {post.author[0]}
                      </span>
                      <span>{post.author}</span>
                    </div>
                    <span>{post.readTime}</span>
                  </div>
                  <p className="text-xs text-muted mt-2">{post.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-surface">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl font-bold text-heading mb-4">Stay updated</h2>
          <p className="text-muted text-lg mb-6">Get the latest automation tips delivered to your inbox weekly.</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button className="px-6 py-3 bg-cta text-white font-bold rounded-lg hover:bg-cta-hover transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
