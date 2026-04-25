# ⚡ Quick Start Guide

Get your Star Solutions website up and running in 5 minutes!

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 3: Test the Features

### 👀 Browse the Website
- **Home**: [http://localhost:3000](http://localhost:3000)
- **Pricing**: [http://localhost:3000/pricing](http://localhost:3000/pricing)
- **Blog**: [http://localhost:3000/blog](http://localhost:3000/blog)
- **About**: [http://localhost:3000/about](http://localhost:3000/about)
- **Contact**: [http://localhost:3000/contact](http://localhost:3000/contact)

### 📝 Try the Contact Form
1. Scroll to the contact section on home page
2. Fill out the form with your info
3. Click "Get Free Audit"
4. Form is submitted (currently stored in memory)

### 🔐 Access Admin Dashboard
1. Go to [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
2. Enter admin password: `StarSolutions2026!`
3. You'll see the admin dashboard
4. View form submissions (if you submitted any)
5. Click "View" on any submission to:
   - Update its status (New → Contacted → In Progress → Completed/Lost)
   - Add notes for follow-ups
   - Track client information

## Step 4: Make It Your Own

### Change Admin Password
Edit `.env.local`:
```
ADMIN_PASSWORD=YourNewPassword123!
```

### Update Brand Colors
Edit `tailwind.config.ts` and change:
```ts
colors: {
  primary: '#YOUR_COLOR',
  cta: '#YOUR_ORANGE_COLOR',
  // ... etc
}
```

### Update Content
- Logo text: Edit `components/Navbar.tsx`
- Home content: Edit `app/page.tsx`
- Links/pages: Edit `components/Navbar.tsx` and add new pages in `/app`

## Step 5: Deploy

### Deploy to Vercel (Free, 1 minute)
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
1. Push code to GitHub
2. Connect GitHub repo to Netlify
3. Netlify auto-builds and deploys

## Advanced: Connect Database

Currently form submissions are stored in memory (lost on refresh).

### Option 1: Firebase (Recommended)
1. Create Firebase project: [console.firebase.google.com](https://console.firebase.google.com)
2. Copy your config to `.env.local`
3. Update form submission API to use Firebase

### Option 2: MongoDB
1. Create MongoDB cluster: [mongodb.com/cloud](https://mongodb.com/cloud)
2. Install mongoose: `npm install mongoose`
3. Update API routes to use MongoDB

## Project Structure

```
app/                   ← Pages
├── page.tsx          ← Home page
├── pricing/          ← Pricing page
├── admin/            ← Admin area
│   ├── login/
│   └── dashboard/
└── api/              ← Backend routes
    └── submissions/

components/           ← Reusable components
├── Navbar.tsx
├── Footer.tsx
└── ContactForm.tsx

types.ts             ← TypeScript types
tailwind.config.ts   ← Style config
package.json         ← Dependencies
```

## Common Tasks

### Create a New Page
```bash
mkdir app/my-page
cat > app/my-page/page.tsx << 'EOF'
export default function MyPage() {
  return <div>Your content here</div>
}
EOF
```

### Add Navigation Link
Edit `components/Navbar.tsx` and add to `navLinks` array:
```tsx
{ href: '/my-page', label: 'My Page' }
```

### Create API Route
```bash
mkdir app/api/my-endpoint
cat > app/api/my-endpoint/route.ts << 'EOF'
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Hello' })
}
EOF
```

### Build for Production
```bash
npm run build
npm run start
```

## Need Help?

- **Error on startup?** Check Node version: `node -v` (need 18+)
- **Port already in use?** Run on different port: `npm run dev -- -p 3001`
- **Component not showing?** Check imports and file names
- **Styles not working?** Run: `npm run dev` to rebuild Tailwind

## Next Steps

1. ✅ Get it running locally
2. ✅ Test admin dashboard
3. ✅ Submit test form
4. ✅ Change admin password
5. ✅ Update brand colors/content
6. ✅ Add database (optional)
7. ✅ Deploy to Vercel/Netlify

## Deploy Checklist

- [ ] Changed admin password
- [ ] Updated brand colors
- [ ] Updated company info in footer
- [ ] Updated email/phone in footer
- [ ] Tested contact form
- [ ] Tested admin dashboard
- [ ] Configured domain name (if custom)
- [ ] Set up email notifications (optional)

---

**Ready to deploy?** Run:
```bash
npm run build
vercel --prod
```

**Questions?** Check [README.md](README.md) for full documentation.
