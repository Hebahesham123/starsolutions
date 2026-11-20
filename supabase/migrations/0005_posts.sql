-- 0005_posts.sql — blog posts move from src/data/posts*.json into Supabase.
--
-- Run AFTER admin.sql (it uses public.is_admin() and public.touch_updated_at()).
-- Then run 0006_posts_seed.sql straight after, in the same sitting: the site
-- reads this table as soon as it exists, so an empty table means an empty blog.
-- Safe to run more than once.
--
-- One row per article. Shared fields are columns; each language's text lives
-- in its own jsonb column (`en`, `ar`), switched on by `en_enabled` /
-- `ar_enabled`. The same slug serves /blog/<slug> and /ar/blog/<slug>.
--
-- `en` / `ar` hold:
--   title, subtitle, category, summary (text[]), body (Markdown), faq_title,
--   faq ([{q,a}]), sources ([{title,url}]), cta ({heading,text,button_label,button_href}),
--   cover_alt, meta_title, meta_description, focus_keyword, canonical, noindex,
--   og_title, og_description, og_image ({src,width,height}), extra_jsonld (text)
-- The admin validates that shape before every save.

create table if not exists public.posts (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique
                       check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- Old slugs of this post; a request for one is redirected (308) to `slug`.
  previous_slugs     text[] not null default '{}',
  status             text not null default 'draft'
                       check (status in ('draft', 'published', 'scheduled')),
  -- When the post goes (or went) live. Null on a published post = live now.
  publish_at         timestamptz,
  -- The date shown on the page and used as datePublished.
  published_on       date,
  -- Moves only when the content changes: "Updated", dateModified, sitemap lastmod.
  content_updated_at timestamptz,
  -- Shared keywords (any language), for matching related articles.
  tags               text[] not null default '{}',
  -- A team member's slug (public.team.slug / site.ar.json team).
  author_slug        text,
  -- [{ "section": "solutions" | "automations" | "systems", "slug": "..." }]
  related_services   jsonb not null default '[]'::jsonb,
  -- { "src": "...webp", "width": 1600, "height": 900 }
  cover              jsonb,
  show_toc           boolean not null default true,
  en_enabled         boolean not null default false,
  ar_enabled         boolean not null default false,
  en                 jsonb not null default '{}'::jsonb,
  ar                 jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists posts_live_idx on public.posts (status, publish_at);
create index if not exists posts_previous_slugs_idx on public.posts using gin (previous_slugs);

-- updated_at on every write (bookkeeping only; the page uses content_updated_at).
drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- ---------- access ----------
-- Visitors (anon key) see only live posts: published or scheduled, and whose
-- publish time has passed. Drafts and future posts are invisible to every
-- public read — pages, sitemap, API, agents — at the database, not just in code.
alter table public.posts enable row level security;

drop policy if exists "public read live posts" on public.posts;
create policy "public read live posts" on public.posts
  for select using (
    (status in ('published', 'scheduled') and (publish_at is null or publish_at <= now()))
    or public.is_admin()
  );

drop policy if exists "admins write posts" on public.posts;
create policy "admins write posts" on public.posts
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- images ----------
-- Public bucket for post images (covers, gallery, OG). Anyone can view a file
-- by its URL; only admins can upload, replace or delete.
insert into storage.buckets (id, name, public)
values ('blog', 'blog', true)
on conflict (id) do update set public = true;

drop policy if exists "blog images admin insert" on storage.objects;
create policy "blog images admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'blog' and public.is_admin());

drop policy if exists "blog images admin update" on storage.objects;
create policy "blog images admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'blog' and public.is_admin());

drop policy if exists "blog images admin delete" on storage.objects;
create policy "blog images admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'blog' and public.is_admin());
