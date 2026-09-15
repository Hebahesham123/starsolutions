-- Automations: add the `short` column the other content tables already have.
--
-- solutions, goals, systems and projects each carry both `summary` — the lede
-- on the detail page — and `short`, a single line for places that list the
-- entry beside others. automations was the one table that had only `summary`,
-- so the web diagram on the homepage had nothing to print but the full lede.
-- Three paragraphs of different lengths in three cards of the same width is
-- what that looks like, and clamping them to two lines only moved the problem:
-- every card then ended mid-sentence on an ellipsis.
--
-- Run this in the Supabase SQL editor. Until it is applied the site falls back
-- to `summary`, which is what it does today — so nothing breaks in between.
--
-- To reverse:  alter table public.automations drop column short;

alter table public.automations add column if not exists short text;

-- The copy itself, so a fresh database and a live one end up the same. Matched
-- on slug rather than id because slug is what the page routes on, and only
-- where short is still empty, so anything edited from /admin is left alone.
update public.automations set short =
  'Manage multiple numbers in one unified inbox.'
 where slug = 'whatsapp-ai-system' and coalesce(short, '') = '';

update public.automations set short =
  'An all-in-one, AI-powered platform that unifies customer messaging, order management, and support.'
 where slug = 'ecommerce-chatbot' and coalesce(short, '') = '';

update public.automations set short =
  'If it happens more than twice a week and follows rules, it can be automated. Tell us the details, and we''ll handle the rest.'
 where slug = 'custom-automations' and coalesce(short, '') = '';

update public.automations set short =
  'Your catalog and blog, turned into scripted, scheduled video.'
 where slug = 'youtube-ai-generator' and coalesce(short, '') = '';
