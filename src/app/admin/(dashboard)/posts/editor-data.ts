import { getTeam } from '@/lib/content';
import { getContent } from '@/lib/i18n';
import { serviceLookup } from '@/lib/post-services';
import { normalizeRow, type PostRow } from '@/lib/post-utils';
import { rscSupabase } from '@/lib/admin/session';
import type { EditorProps } from './PostEditor';

/** What the editor needs besides the post: authors, link targets, known categories. */
export async function editorData(): Promise<Omit<EditorProps, 'id' | 'initial'>> {
  const [team, en, ar, { data }] = await Promise.all([
    getTeam(), serviceLookup('en'), serviceLookup('ar'),
    rscSupabase().from('posts').select('en, ar'),
  ]);
  const rows = ((data ?? []) as Record<string, unknown>[]).map((r) => normalizeRow(r) as PostRow);
  const cats = (l: 'en' | 'ar') => Array.from(new Set(rows.map((r) => r[l].category).filter(Boolean))).sort();
  return {
    authors: team.filter((m) => !m.hidden).map((m) => ({ slug: m.slug, name: m.title })),
    services: { en, ar },
    categories: { en: cats('en'), ar: cats('ar') },
    whatsapp: { en: getContent('en').contact.whatsapp, ar: getContent('ar').contact.whatsapp },
  };
}
