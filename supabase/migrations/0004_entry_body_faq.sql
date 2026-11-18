-- Automations and systems: optional long-form `body` (Markdown) and `faq`.
--
-- The detail page renders `body` after the "What you get" list with the blog's
-- Markdown renderer, then `faq` with the shared Faq component (which also
-- writes the FAQPage JSON-LD). See src/lib/entry-content.ts.
--
-- Until this is applied, and for any row where the columns are empty, the copy
-- comes from src/data/entry-content.json (keyed by section, slug and language),
-- which is where /automations/whatsapp-ai-system's text lives today. Nothing
-- breaks in between. Once a row has a body here, it wins over the file.
--
-- `faq` is a JSON array of { "q": "...", "a": "..." }.
--
-- Run this in the Supabase SQL editor.
-- To reverse:  alter table public.<table> drop column body, drop column faq;

alter table public.automations add column if not exists body text;
alter table public.automations add column if not exists faq jsonb;
alter table public.systems add column if not exists body text;
alter table public.systems add column if not exists faq jsonb;
