'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Lang = 'en' | 'ar'

export const translations = {
  en: {
    nav: {
      solutions: 'Solutions', results: 'Results', howItWorks: 'How It Works',
      ourWork: 'Our Work', blog: 'Blog', about: 'About', freeAudit: 'Free Audit',
    },
    hero: {
      badge: 'AI Business Automation — Live',
      h1a: 'More Orders.', h1b: 'More Revenue.', h1c: 'Less Work.',
      sub: 'We automate your Shopify, social media & marketing — so your business grows',
      subStrong: 'while you sleep',
      cta1: 'Get Free Growth Plan', cta2: 'See Results',
      scroll: 'Scroll to explore',
      liveDash: 'Live Dashboard',
      todayRevenue: "Today's Revenue",
      vsLastWeek: '+32% vs last week',
      orders: 'Orders', visitors: 'Visitors',
      revenueTrend: 'Revenue Trend',
      liveRevenueToday: 'Live Revenue Today',
    },
    stats: {
      badge: 'Proven Results',
      heading: 'Numbers that speak for themselves',
      sub: "Real data from businesses we've scaled with AI automation",
      avgRevenue: 'Avg Revenue Growth',
      businesses: 'Businesses Scaled',
      savedWeek: 'Saved Per Week',
      followersGrown: 'Followers Grown',
      aov: 'Avg Order Value Increase',
      support: 'Customer Support Automated',
      adSpend: 'Ad Spend Reduction',
    },
    charts: {
      badge: 'Growth Analytics',
      heading: 'See the difference automation makes',
      monthlyRevenue: 'Monthly Revenue',
      beforeAfter: 'Before vs After automation',
      avgBadge: '+132% avg',
      orderVolume: 'Order Volume Growth',
      months: '12-month trajectory',
      dailyOrders: 'Daily Orders',
      conversion: 'Conversion Rate',
      repeat: 'Repeat Buyers',
      before: 'Before', after: 'After',
    },
    beforeAfter: {
      badge: 'Transformation',
      heading: 'Before vs After — Your Business',
      beforeBtn: '😰 Before',
      afterBtn: '🚀 After',
      cta: 'I Want The "After" Version →',
      before: [
        { icon: '😩', title: 'Manual Order Processing', desc: 'Spending 4-5 hours daily copying orders to spreadsheets.' },
        { icon: '📉', title: 'Low Social Engagement', desc: 'Posting inconsistently, losing followers, no strategy.' },
        { icon: '💸', title: 'Wasting Ad Budget', desc: 'Running ads without optimization — high cost, low returns.' },
        { icon: '😤', title: 'Overwhelmed by Support', desc: 'Answering the same 20 questions manually all day.' },
        { icon: '🤷', title: 'No Growth Data', desc: "Flying blind — no dashboard, no idea what's working." },
        { icon: '😴', title: 'Zero Revenue While Sleeping', desc: 'Store goes silent at night. Revenue stops when you stop.' },
      ],
      after: [
        { icon: '⚡', title: 'Fully Automated Fulfillment', desc: 'Orders auto-confirmed, suppliers notified, tracking sent.' },
        { icon: '📈', title: '10x Social Growth', desc: 'Auto-posting & engagement automation growing followers daily.' },
        { icon: '🎯', title: 'AI-Optimized Ad Spend', desc: 'ML shifts budget to winning ads — 4.2x ROAS.' },
        { icon: '🤖', title: 'AI Handles 80% of Support', desc: 'Chatbot answers instantly 24/7. Only complex cases reach you.' },
        { icon: '📊', title: 'Real-Time Dashboard', desc: 'Revenue, orders, ROAS, CAC — all live on your phone.' },
        { icon: '💰', title: 'Revenue While You Sleep', desc: 'Automated store takes orders at 3 AM. Wake up to money.' },
      ],
    },
    solutions: {
      badge: 'What We Do',
      heading: 'Complete AI Automation Suite',
      items: [
        { icon: '💰', title: 'Revenue Automation', desc: 'AI-optimized pricing, upsells & abandoned cart recovery — 24/7.', badge: '+45% AOV' },
        { icon: '📦', title: 'Order Fulfillment', desc: 'From order to delivery — automated fulfillment, tracking & notifications.', badge: '0 manual work' },
        { icon: '❤️', title: 'Social Media Growth', desc: 'Auto-posting, engagement automation & content scheduling for Instagram & TikTok.', badge: '10x followers' },
        { icon: '🛍️', title: 'Shopify Optimization', desc: 'Speed, SEO, CRO — we make your store convert more visitors to buyers.', badge: '+38% CVR' },
        { icon: '🎯', title: 'AI Smart Ads', desc: 'Machine learning manages Meta & Google Ads — better ROAS, lower CPA.', badge: '4.2x ROAS' },
        { icon: '🤖', title: 'AI Customer Support', desc: 'Chatbot answers 80% of questions instantly on WhatsApp & website.', badge: '80% automated' },
      ],
    },
    sleep: {
      heading: 'Make Money While You Sleep',
      sub: "Your AI works 24/7. Here's what happens while you're asleep:",
      revenueLabel: 'Revenue generated tonight',
      live: 'LIVE — updates every few seconds',
      ordersProcessed: 'Orders processed',
      messagesAnswered: 'Messages answered',
      adsOptimized: 'Ads optimized',
      postsPublished: 'Posts published',
      timeline: [
        { time: '2:14 AM', title: 'New order — $139.99', desc: 'Payment confirmed. Supplier notified. Tracking sent.', icon: '🛍️', color: 'bg-green-500/15 border-green-500/25' },
        { time: '2:31 AM', title: 'Customer asked about order', desc: 'AI chatbot replied in 1.8s. Resolved.', icon: '🤖', color: 'bg-primary/15 border-primary/25' },
        { time: '3:07 AM', title: 'Cart abandoned — $89', desc: 'Automated email + discount sent. Recovered.', icon: '💰', color: 'bg-orange-500/15 border-orange-500/25' },
        { time: '4:15 AM', title: 'Ad budget auto-optimized', desc: 'AI shifted $200 to top-performing ad set.', icon: '🎯', color: 'bg-purple-500/15 border-purple-500/25' },
        { time: '5:00 AM', title: 'TikTok post published', desc: 'AI-generated caption, trending hashtags, peak time.', icon: '📱', color: 'bg-pink-500/15 border-pink-500/25' },
      ],
    },
    how: {
      badge: 'Simple Process',
      heading: '3 steps to automated growth',
      steps: [
        { num: '01', title: 'Free Audit', desc: 'We analyze your store, ads, workflows & social. You get a detailed growth report — free.', icon: '🔍', color: 'bg-primary' },
        { num: '02', title: 'We Build', desc: 'Custom AI automation built and integrated into your existing tools in under 14 days.', icon: '⚙️', color: 'bg-primary-dark' },
        { num: '03', title: 'You Grow', desc: 'Watch orders, revenue & followers increase on autopilot. We monitor & optimize.', icon: '🚀', color: 'bg-cta' },
      ],
    },
    work: {
      badge: 'Portfolio',
      heading: 'Our Work & Projects',
      sub: "Real websites, systems, and AI automations we've built for our clients.",
      liveWebsites: 'Live Websites',
      customSystems: 'Custom Systems & Dashboards',
      aiAutomations: 'AI Automations & Integrations',
      visitSite: 'Visit Live Site',
      demoAvailable: 'Demo Available',
      contactDemo: 'Contact us to request a live demo',
      websites: [
        { title: 'Montre Co.', desc: 'Premium watches e-commerce store — Shopify build with custom UI, product pages & checkout flow.', url: 'https://montre-co.com/', tag: 'E-commerce', color: 'from-blue-500 to-blue-700', icon: '⌚' },
        { title: 'Beauty Bareg', desc: 'Beauty brand website — full store design, product catalog, social integration & mobile-first experience.', url: 'https://beauty-bareg.net/', tag: 'Beauty & Fashion', color: 'from-pink-500 to-pink-700', icon: '💄' },
      ],
      systems: [
        { title: 'Accounting System', desc: 'Full accounting dashboard — invoicing, expense tracking, financial reports, and multi-user access. Built for SMEs.', tag: 'SaaS System', color: 'from-green-500 to-green-700', icon: '📊' },
        { title: 'SEO Forge', desc: 'Advanced SEO automation platform — keyword research, content generation, rank tracking and site audits powered by AI.', tag: 'AI + SEO', color: 'from-purple-500 to-purple-700', icon: '🔍' },
        { title: 'Courier System', desc: 'End-to-end delivery management — order dispatch, driver tracking, real-time status updates and automated notifications.', tag: 'Logistics', color: 'from-orange-500 to-orange-700', icon: '🚚' },
        { title: 'Trading System', desc: 'Smart trading dashboard — live market data, portfolio tracking, buy/sell signals and automated trade execution.', tag: 'Fintech', color: 'from-blue-500 to-blue-700', icon: '📈' },
        { title: 'Google Analytics System', desc: 'Custom analytics dashboard pulling GA4 data — traffic insights, conversion funnels, real-time reports and automated alerts.', tag: 'Analytics', color: 'from-yellow-500 to-orange-500', icon: '📉' },
      ],
      automations: [
        { icon: '💳', title: 'Stripe Payment Automation', color: 'from-indigo-500 to-indigo-700' },
        { icon: '💬', title: 'WhatsApp AI System', color: 'from-green-500 to-green-700' },
        { icon: '📦', title: 'Courier & Delivery System', color: 'from-orange-500 to-orange-700' },
        { icon: '▶️', title: 'YouTube AI Generator', color: 'from-red-500 to-red-700' },
        { icon: '🛍️', title: 'E-commerce Chatbot', color: 'from-blue-500 to-blue-700' },
        { icon: '⚙️', title: 'Custom Automations', color: 'from-primary to-primary-dark' },
      ],
    },
    reviews: {
      badge: 'Client Reviews',
      heading: 'What our clients say',
      fromClients: 'from 150+ clients',
      swipe: 'Swipe to see more',
      items: [
        { quote: 'Orders went from 20/day to 85/day in 6 weeks. Everything runs automatically while I sleep.', author: 'Omar Hassan', role: 'E-commerce Owner, Cairo', avatar: 'OH' },
        { quote: 'Instagram went from 2K to 18K followers in 3 months. The AI posts content better than I ever did.', author: 'Layla Mohammed', role: 'Beauty Brand Founder', avatar: 'LM' },
        { quote: 'Shopify conversion rate jumped from 1.8% to 4.2%. Ad spend dropped 35%. Genuinely good.', author: 'Ahmed Farouk', role: 'Shopify Store Owner', avatar: 'AF' },
        { quote: 'The chatbot handles 80% of my customer queries. I used to spend 4 hours a day on WhatsApp.', author: 'Nadia El-Sayed', role: 'Fashion Brand, Dubai', avatar: 'NE' },
        { quote: 'ROAS went from 1.8x to 4.5x. The AI ad optimization paid for everything in the first month.', author: 'Karim Mansour', role: 'Electronics Store', avatar: 'KM' },
        { quote: 'Revenue up 280% in 4 months. I feel in control for the first time with the live dashboard.', author: 'Sara Al-Rashid', role: 'Home Decor Brand', avatar: 'SR' },
      ],
    },
    partners: { label: 'Platforms We Automate' },
    team: {
      badge: 'Our Team',
      heading: 'The people behind your growth',
      sub: 'Specialists in automation, AI, e-commerce & digital marketing.',
      members: [
        { name: 'Heba Hesham', role: 'Senior Web Developer', init: 'HH', color: 'from-blue-500 to-blue-700' },
        { name: 'Hams', role: 'Software Engineer', init: 'HA', color: 'from-purple-500 to-purple-700' },
        { name: 'Mera', role: 'Software Engineer', init: 'ME', color: 'from-orange-500 to-orange-700' },
        { name: 'Ganna', role: 'Content Creator', init: 'GA', color: 'from-pink-500 to-pink-700' },
        { name: 'Ebtsam', role: 'Social Media Creator', init: 'EB', color: 'from-green-500 to-green-700' },
        { name: 'Amira', role: 'Customer Support', init: 'AM', color: 'from-red-500 to-red-700' },
        { name: 'Jumana', role: 'Customer Support', init: 'JU', color: 'from-teal-500 to-teal-700' },
      ],
    },
    contact: {
      badge: 'Get Started Today',
      heading: 'Ready to grow?',
      sub: "Free audit of your business. We'll show you exactly where AI can double your revenue.",
      cta1: 'Get Free Audit →',
      cta2: '💬 WhatsApp Us',
    },
    newsletter: {
      badge: '🎁 Exclusive Offer',
      heading: 'Get 15% Off Your First Service',
      sub: 'Join 2,000+ business owners. Subscribe and get your discount code instantly.',
      placeholder: 'Enter your email address...',
      button: 'Claim 15% Discount',
      note: 'No spam. Unsubscribe anytime. Code: ',
      code: 'STAR15',
      subscribers: 'Subscribers',
      discount: 'Instant Discount',
      spam: 'Spam Emails',
    },
    popup: {
      badge: '⏳ Limited Time Offer',
      heading: "Don't miss out!",
      sub: 'Get 15% off your first service — enter your email to claim your exclusive discount.',
      placeholder: 'Your email address...',
      button: 'Claim 15% Off Now',
      skip: "No thanks, I'll pay full price",
    },
    welcomePopup: {
      badge: '👋 Welcome!',
      heading: "You're eligible for",
      highlight: '15% OFF',
      sub: 'Subscribe now and get an exclusive discount on any service we offer.',
      placeholder: 'Your email address...',
      button: 'Get My 15% Discount',
      skip: 'Maybe later',
    },
    toast: {
      messages: [
        '🛍️ Ahmed from Dubai just booked a free audit',
        '💬 Sara from Riyadh requested WhatsApp automation',
        "📈 Omar's store revenue grew 3x this month",
        '🤖 New chatbot setup completed for a fashion brand',
        '⚡ Layla just claimed her 15% discount',
        '🚀 New Shopify automation live for a client',
      ],
    },
    thankYou: 'Thank you! Your discount code is:',
  },

  ar: {
    nav: {
      solutions: 'الحلول', results: 'النتائج', howItWorks: 'كيف يعمل',
      ourWork: 'أعمالنا', blog: 'المدونة', about: 'من نحن', freeAudit: 'تدقيق مجاني',
    },
    hero: {
      badge: 'أتمتة الأعمال بالذكاء الاصطناعي — مباشر',
      h1a: 'طلبات أكثر.', h1b: 'إيرادات أعلى.', h1c: 'جهد أقل.',
      sub: 'نقوم بأتمتة متجرك وسوشيال ميديا وتسويقك — لينمو عملك',
      subStrong: 'حتى وأنت نائم',
      cta1: 'احصل على خطة نمو مجانية', cta2: 'شاهد النتائج',
      scroll: 'مرر للاستكشاف',
      liveDash: 'لوحة التحكم المباشرة',
      todayRevenue: 'إيرادات اليوم',
      vsLastWeek: '+32% مقارنة بالأسبوع الماضي',
      orders: 'الطلبات', visitors: 'الزوار',
      revenueTrend: 'مسار الإيرادات',
      liveRevenueToday: 'الإيرادات المباشرة اليوم',
    },
    stats: {
      badge: 'نتائج مثبتة',
      heading: 'أرقام تتحدث عن نفسها',
      sub: 'بيانات حقيقية من شركات نمّيناها باستخدام الأتمتة الذكية',
      avgRevenue: 'متوسط نمو الإيرادات',
      businesses: 'شركة تم تنميتها',
      savedWeek: 'ساعة موفّرة أسبوعياً',
      followersGrown: 'متابع تم اكتسابه',
      aov: 'زيادة متوسط قيمة الطلب',
      support: 'دعم العملاء المؤتمت',
      adSpend: 'تخفيض في ميزانية الإعلانات',
    },
    charts: {
      badge: 'تحليلات النمو',
      heading: 'شاهد الفرق الذي تصنعه الأتمتة',
      monthlyRevenue: 'الإيرادات الشهرية',
      beforeAfter: 'قبل وبعد الأتمتة',
      avgBadge: '+132% متوسط',
      orderVolume: 'نمو حجم الطلبات',
      months: 'مسار 12 شهراً',
      dailyOrders: 'طلبات يومية',
      conversion: 'معدل التحويل',
      repeat: 'المشترون المتكررون',
      before: 'قبل', after: 'بعد',
    },
    beforeAfter: {
      badge: 'التحوّل',
      heading: 'قبل وبعد — عملك التجاري',
      beforeBtn: '😰 قبل',
      afterBtn: '🚀 بعد',
      cta: 'أريد النسخة "بعد" ←',
      before: [
        { icon: '😩', title: 'معالجة الطلبات يدوياً', desc: 'تقضي 4-5 ساعات يومياً في نسخ الطلبات إلى جداول البيانات.' },
        { icon: '📉', title: 'تفاعل منخفض على السوشيال', desc: 'نشر غير منتظم، فقدان متابعين، لا استراتيجية واضحة.' },
        { icon: '💸', title: 'إهدار ميزانية الإعلانات', desc: 'تشغيل إعلانات بدون تحسين — تكلفة عالية، عوائد منخفضة.' },
        { icon: '😤', title: 'غرق في طلبات الدعم', desc: 'الإجابة على نفس 20 سؤالاً يدوياً طوال اليوم.' },
        { icon: '🤷', title: 'لا بيانات للنمو', desc: 'تتحرك عشوائياً — لا لوحة تحكم، لا تعرف ما الذي ينجح.' },
        { icon: '😴', title: 'صفر إيرادات أثناء النوم', desc: 'يتوقف متجرك ليلاً. توقف أنت، توقفت الإيرادات.' },
      ],
      after: [
        { icon: '⚡', title: 'تنفيذ مؤتمت بالكامل', desc: 'تأكيد تلقائي للطلبات، إخطار الموردين، وإرسال التتبع.' },
        { icon: '📈', title: 'نمو 10x على السوشيال', desc: 'نشر تلقائي وأتمتة التفاعل تنمّي متابعيك يومياً.' },
        { icon: '🎯', title: 'إنفاق إعلاني محسّن بالذكاء', desc: 'الذكاء الاصطناعي يوجّه الميزانية للإعلانات الرابحة — 4.2x ROAS.' },
        { icon: '🤖', title: 'ذكاء اصطناعي يتولى 80% من الدعم', desc: 'الشات بوت يرد فوراً 24/7. الحالات المعقدة فقط تصلك.' },
        { icon: '📊', title: 'لوحة تحكم لحظية', desc: 'الإيرادات، الطلبات، ROAS، CAC — كلها مباشرة على هاتفك.' },
        { icon: '💰', title: 'إيرادات أثناء نومك', desc: 'متجرك يستقبل طلبات في 3 صباحاً. تستيقظ على مال.' },
      ],
    },
    solutions: {
      badge: 'ماذا نفعل',
      heading: 'مجموعة الأتمتة الذكية الكاملة',
      items: [
        { icon: '💰', title: 'أتمتة الإيرادات', desc: 'تسعير محسّن بالذكاء الاصطناعي، عروض إضافية واسترداد عربات متروكة — 24/7.', badge: '+45% AOV' },
        { icon: '📦', title: 'تنفيذ الطلبات', desc: 'من الطلب حتى التسليم — تنفيذ آلي، تتبع وإشعارات.', badge: 'صفر جهد يدوي' },
        { icon: '❤️', title: 'نمو السوشيال ميديا', desc: 'نشر تلقائي وأتمتة التفاعل وجدولة المحتوى لإنستغرام وتيك توك.', badge: '10x متابعين' },
        { icon: '🛍️', title: 'تحسين شوبيفاي', desc: 'السرعة، SEO، CRO — نجعل متجرك يحوّل أكثر زوار إلى مشترين.', badge: '+38% CVR' },
        { icon: '🎯', title: 'إعلانات ذكية بالذكاء الاصطناعي', desc: 'تعلم آلي يدير إعلانات ميتا وجوجل — ROAS أفضل، تكلفة أقل.', badge: '4.2x ROAS' },
        { icon: '🤖', title: 'دعم عملاء بالذكاء الاصطناعي', desc: 'شات بوت يجيب على 80% من الأسئلة فوراً على واتساب والموقع.', badge: '80% مؤتمت' },
      ],
    },
    sleep: {
      heading: 'اكسب المال أثناء نومك',
      sub: 'الذكاء الاصطناعي يعمل 24/7. إليك ما يحدث أثناء نومك:',
      revenueLabel: 'الإيرادات المحققة الليلة',
      live: 'مباشر — يتحدث كل بضع ثوانٍ',
      ordersProcessed: 'طلب تمت معالجته',
      messagesAnswered: 'رسالة تمت الإجابة عليها',
      adsOptimized: 'إعلان تم تحسينه',
      postsPublished: 'منشور تم نشره',
      timeline: [
        { time: '2:14 صباحاً', title: 'طلب جديد — $139.99', desc: 'تأكيد الدفع، إخطار المورد، إرسال التتبع.', icon: '🛍️', color: 'bg-green-500/15 border-green-500/25' },
        { time: '2:31 صباحاً', title: 'عميل سأل عن طلبه', desc: 'شات بوت الذكاء الاصطناعي رد في 1.8 ثانية. تمت المعالجة.', icon: '🤖', color: 'bg-primary/15 border-primary/25' },
        { time: '3:07 صباحاً', title: 'عربة متروكة — $89', desc: 'إيميل آلي + خصم أُرسل. تم الاسترداد.', icon: '💰', color: 'bg-orange-500/15 border-orange-500/25' },
        { time: '4:15 صباحاً', title: 'تحسين تلقائي لميزانية الإعلانات', desc: 'الذكاء الاصطناعي نقل $200 للإعلان الأفضل أداءً.', icon: '🎯', color: 'bg-purple-500/15 border-purple-500/25' },
        { time: '5:00 صباحاً', title: 'منشور تيك توك نُشر', desc: 'كابشن بالذكاء الاصطناعي، هاشتاقات رائجة، وقت الذروة.', icon: '📱', color: 'bg-pink-500/15 border-pink-500/25' },
      ],
    },
    how: {
      badge: 'العملية البسيطة',
      heading: '٣ خطوات للنمو الآلي',
      steps: [
        { num: '٠١', title: 'تدقيق مجاني', desc: 'نحلل متجرك، إعلاناتك، سير العمل والسوشيال. تحصل على تقرير نمو مفصّل — مجاناً.', icon: '🔍', color: 'bg-primary' },
        { num: '٠٢', title: 'نبني لك', desc: 'أتمتة ذكاء اصطناعي مخصصة ومدمجة في أدواتك الحالية خلال 14 يوماً.', icon: '⚙️', color: 'bg-primary-dark' },
        { num: '٠٣', title: 'أنت تنمو', desc: 'شاهد الطلبات والإيرادات والمتابعين يزدادون تلقائياً. نحن نراقب ونحسّن.', icon: '🚀', color: 'bg-cta' },
      ],
    },
    work: {
      badge: 'معرض أعمالنا',
      heading: 'أعمالنا ومشاريعنا',
      sub: 'مواقع حقيقية، أنظمة وأتمتة ذكاء اصطناعي بنيناها لعملائنا.',
      liveWebsites: 'مواقع مباشرة',
      customSystems: 'أنظمة ولوحات تحكم مخصصة',
      aiAutomations: 'أتمتة وتكاملات بالذكاء الاصطناعي',
      visitSite: 'زيارة الموقع المباشر',
      demoAvailable: 'عرض توضيحي متاح',
      contactDemo: 'تواصل معنا لطلب عرض توضيحي مباشر',
      websites: [
        { title: 'Montre Co.', desc: 'متجر إلكتروني للساعات الفاخرة — بُني على شوبيفاي بواجهة مخصصة وصفحات منتجات وتدفق دفع متميز.', url: 'https://montre-co.com/', tag: 'تجارة إلكترونية', color: 'from-blue-500 to-blue-700', icon: '⌚' },
        { title: 'Beauty Bareg', desc: 'موقع علامة تجارية للجمال — تصميم متجر كامل، كتالوج منتجات، تكامل سوشيال وتجربة موبايل أولاً.', url: 'https://beauty-bareg.net/', tag: 'الجمال والأزياء', color: 'from-pink-500 to-pink-700', icon: '💄' },
      ],
      systems: [
        { title: 'نظام المحاسبة', desc: 'لوحة تحكم محاسبية كاملة — فواتير، تتبع نفقات، تقارير مالية، وصول متعدد المستخدمين. مخصص للشركات الصغيرة.', tag: 'نظام SaaS', color: 'from-green-500 to-green-700', icon: '📊' },
        { title: 'SEO Forge', desc: 'منصة أتمتة SEO متقدمة — بحث كلمات مفتاحية، توليد محتوى، تتبع ترتيب وتدقيق مواقع بالذكاء الاصطناعي.', tag: 'ذكاء اصطناعي + SEO', color: 'from-purple-500 to-purple-700', icon: '🔍' },
        { title: 'نظام التوصيل', desc: 'إدارة توصيل شاملة — إرسال الطلبات، تتبع السائقين، تحديثات حالة فورية وإشعارات آلية.', tag: 'اللوجستيات', color: 'from-orange-500 to-orange-700', icon: '🚚' },
        { title: 'نظام التداول', desc: 'لوحة تداول ذكية — بيانات سوق مباشرة، تتبع المحفظة، إشارات شراء/بيع وتنفيذ تداول آلي.', tag: 'تكنولوجيا مالية', color: 'from-blue-500 to-blue-700', icon: '📈' },
        { title: 'نظام تحليلات جوجل', desc: 'لوحة تحليلات مخصصة تسحب بيانات GA4 — رؤى حركة المرور، مسارات التحويل، تقارير فورية وتنبيهات آلية.', tag: 'التحليلات', color: 'from-yellow-500 to-orange-500', icon: '📉' },
      ],
      automations: [
        { icon: '💳', title: 'أتمتة مدفوعات سترايب', color: 'from-indigo-500 to-indigo-700' },
        { icon: '💬', title: 'نظام واتساب الذكي', color: 'from-green-500 to-green-700' },
        { icon: '📦', title: 'نظام التوصيل والشحن', color: 'from-orange-500 to-orange-700' },
        { icon: '▶️', title: 'مولّد فيديو يوتيوب', color: 'from-red-500 to-red-700' },
        { icon: '🛍️', title: 'شات بوت التجارة الإلكترونية', color: 'from-blue-500 to-blue-700' },
        { icon: '⚙️', title: 'أتمتة مخصصة', color: 'from-primary to-primary-dark' },
      ],
    },
    reviews: {
      badge: 'آراء العملاء',
      heading: 'ماذا يقول عملاؤنا',
      fromClients: 'من أكثر من 150 عميل',
      swipe: 'اسحب للمزيد',
      items: [
        { quote: 'ارتفعت طلباتي من 20 إلى 85 طلباً يومياً في 6 أسابيع. كل شيء يعمل تلقائياً أثناء نومي.', author: 'عمر حسن', role: 'صاحب متجر إلكتروني، القاهرة', avatar: 'OH' },
        { quote: 'انستغرام من 2 ألف إلى 18 ألف متابع في 3 أشهر. الذكاء الاصطناعي ينشر محتوى أفضل مني.', author: 'ليلى محمد', role: 'مؤسسة علامة تجارية للجمال', avatar: 'LM' },
        { quote: 'معدل التحويل من 1.8% إلى 4.2%. الإنفاق الإعلاني انخفض 35%. نتائج حقيقية.', author: 'أحمد فاروق', role: 'صاحب متجر شوبيفاي', avatar: 'AF' },
        { quote: 'الشات بوت يتولى 80% من استفسارات عملائي. كنت أقضي 4 ساعات يومياً على واتساب.', author: 'نادية السيد', role: 'علامة أزياء، دبي', avatar: 'NE' },
        { quote: 'ROAS من 1.8x إلى 4.5x. تحسين الإعلانات بالذكاء الاصطناعي غطّى كل التكاليف في أول شهر.', author: 'كريم منصور', role: 'متجر إلكترونيات', avatar: 'KM' },
        { quote: 'الإيرادات ارتفعت 280% في 4 أشهر. أشعر بالسيطرة للمرة الأولى مع لوحة التحكم المباشرة.', author: 'سارة الراشد', role: 'علامة ديكور منزلي', avatar: 'SR' },
      ],
    },
    partners: { label: 'المنصات التي نقوم بأتمتتها' },
    team: {
      badge: 'فريقنا',
      heading: 'الأشخاص وراء نجاحك',
      sub: 'متخصصون في الأتمتة والذكاء الاصطناعي والتجارة الإلكترونية والتسويق الرقمي.',
      members: [
        { name: 'هبة هشام', role: 'مطورة ويب أولى', init: 'HH', color: 'from-blue-500 to-blue-700' },
        { name: 'حمس', role: 'مهندسة برمجيات', init: 'HA', color: 'from-purple-500 to-purple-700' },
        { name: 'ميرا', role: 'مهندسة برمجيات', init: 'ME', color: 'from-orange-500 to-orange-700' },
        { name: 'جنا', role: 'منشئة محتوى', init: 'GA', color: 'from-pink-500 to-pink-700' },
        { name: 'ابتسام', role: 'منشئة سوشيال ميديا', init: 'EB', color: 'from-green-500 to-green-700' },
        { name: 'أميرة', role: 'دعم عملاء', init: 'AM', color: 'from-red-500 to-red-700' },
        { name: 'جمانة', role: 'دعم عملاء', init: 'JU', color: 'from-teal-500 to-teal-700' },
      ],
    },
    contact: {
      badge: 'ابدأ اليوم',
      heading: 'مستعد للنمو؟',
      sub: 'تدقيق مجاني لعملك. سنريك بالضبط أين يمكن للذكاء الاصطناعي أن يضاعف إيراداتك.',
      cta1: 'احصل على تدقيق مجاني ←',
      cta2: '💬 تواصل عبر واتساب',
    },
    newsletter: {
      badge: '🎁 عرض حصري',
      heading: 'احصل على خصم 15% على خدمتك الأولى',
      sub: 'انضم لأكثر من 2,000 صاحب عمل. اشترك واحصل على كود الخصم فوراً.',
      placeholder: 'أدخل بريدك الإلكتروني...',
      button: 'احصل على خصم 15%',
      note: 'لا رسائل مزعجة. يمكنك الإلغاء في أي وقت. الكود: ',
      code: 'STAR15',
      subscribers: 'مشترك',
      discount: 'خصم فوري',
      spam: 'رسائل مزعجة',
    },
    popup: {
      badge: '⏳ عرض لفترة محدودة',
      heading: 'لا تفوّت الفرصة!',
      sub: 'احصل على خصم 15% على خدمتك الأولى — أدخل بريدك للحصول على الخصم الحصري.',
      placeholder: 'بريدك الإلكتروني...',
      button: 'احصل على خصم 15% الآن',
      skip: 'لا شكراً، سأدفع السعر كاملاً',
    },
    welcomePopup: {
      badge: '👋 أهلاً بك!',
      heading: 'أنت مؤهل للحصول على',
      highlight: 'خصم 15%',
      sub: 'اشترك الآن واحصل على خصم حصري على أي خدمة نقدمها.',
      placeholder: 'بريدك الإلكتروني...',
      button: 'احصل على خصمي 15%',
      skip: 'ربما لاحقاً',
    },
    toast: {
      messages: [
        '🛍️ أحمد من دبي طلب للتو تدقيقاً مجانياً',
        '💬 سارة من الرياض طلبت أتمتة واتساب',
        '📈 إيرادات متجر عمر نمت 3x هذا الشهر',
        '🤖 تم إعداد شات بوت جديد لعلامة أزياء',
        '⚡ ليلى حصلت للتو على خصم 15%',
        '🚀 أتمتة شوبيفاي جديدة مباشرة لعميل',
      ],
    },
    thankYou: 'شكراً! كود خصمك هو:',
  },
}

const LanguageContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
  t: typeof translations.en
  isRtl: boolean
}>({ lang: 'en', setLang: () => {}, t: translations.en, isRtl: false })

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('ss_lang') as Lang
    if (saved === 'ar' || saved === 'en') {
      setLangState(saved)
      document.documentElement.lang = saved
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr'
    }
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('ss_lang', l)
    document.documentElement.lang = l
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang], isRtl: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
