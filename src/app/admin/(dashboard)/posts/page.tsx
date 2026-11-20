import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { rscSupabase } from '@/lib/admin/session';
import { cairoDateOf, formatDate } from '@/lib/dates';
import { displayStatus, normalizeRow, type PostRow, type PostStatus } from '@/lib/post-utils';
import { AdminHeader } from '../../AdminHeader';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Posts' };

type Search = { q?: string; status?: string; lang?: string; category?: string; deleted?: string };

const STATUS_LABEL: Record<PostStatus, string> = { draft: 'Draft', published: 'Published', scheduled: 'Scheduled' };
const STATUS_CLASS: Record<PostStatus, string> = { draft: 'is-new', published: 'is-closed', scheduled: 'is-in_progress' };

const langsOf = (r: PostRow) => (r.en_enabled && r.ar_enabled ? 'both' : r.en_enabled ? 'en' : r.ar_enabled ? 'ar' : 'none');
const LANG_LABEL: Record<string, string> = { both: 'EN + AR', en: 'EN', ar: 'AR', none: '—' };
const titleOf = (r: PostRow) => r.en.title || r.ar.title || r.slug;
const categoryOf = (r: PostRow) => r.en.category || r.ar.category || '';

export default async function PostsListPage({ searchParams }: { searchParams: Search }) {
  const { data, error } = await rscSupabase().from('posts').select('*').order('published_on', { ascending: false, nullsFirst: true });
  const all = ((data ?? []) as Record<string, unknown>[]).map(normalizeRow);

  const q = (searchParams.q ?? '').trim().toLowerCase();
  const rows = all.filter((r) => {
    if (q && !`${r.slug} ${r.en.title} ${r.ar.title} ${r.tags.join(' ')}`.toLowerCase().includes(q)) return false;
    if (searchParams.status && displayStatus(r) !== searchParams.status) return false;
    if (searchParams.lang && langsOf(r) !== searchParams.lang) return false;
    if (searchParams.category && categoryOf(r) !== searchParams.category && r.ar.category !== searchParams.category) return false;
    return true;
  });
  const categories = Array.from(new Set(all.map(categoryOf).filter(Boolean))).sort();
  const live = all.filter((r) => displayStatus(r) === 'published').length;

  return (
    <>
      <AdminHeader
        title="Posts"
        subtitle={error ? 'Could not load posts.' : `${all.length} post${all.length === 1 ? '' : 's'}, ${live} live.`}
        action={
          <Link href="/admin/posts/new" className="btn btn-primary btn-sm">
            <Icon name="check" className="h-4 w-4" /> New post
          </Link>
        }
      />
      <div className="admin-body">
        {searchParams.deleted && <p className="admin-alert is-ok">Post deleted.</p>}
        {error && (
          <p className="admin-alert is-error">
            {error.message}. If the table is missing, run <code>supabase/migrations/0005_posts.sql</code> then{' '}
            <code>0006_posts_seed.sql</code> in the Supabase SQL editor.
          </p>
        )}

        <form className="admin-toolbar post-filters" method="get">
          <label className="admin-search">
            <Icon name="search" />
            <input type="search" name="q" defaultValue={searchParams.q} placeholder="Search title, slug or tag" aria-label="Search posts" />
          </label>
          <select name="status" defaultValue={searchParams.status ?? ''} className="admin-select" aria-label="Status">
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
          </select>
          <select name="lang" defaultValue={searchParams.lang ?? ''} className="admin-select" aria-label="Languages">
            <option value="">All languages</option>
            <option value="both">EN + AR</option>
            <option value="en">English only</option>
            <option value="ar">Arabic only</option>
          </select>
          <select name="category" defaultValue={searchParams.category ?? ''} className="admin-select" aria-label="Category">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" className="btn btn-ghost btn-sm">Filter</button>
        </form>

        {!error && rows.length === 0 && (
          <p className="admin-empty">{all.length ? 'No posts match these filters.' : 'No posts yet. Create the first one.'}</p>
        )}

        {rows.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Languages</th>
                  <th>Status</th>
                  <th>Category</th>
                  <th>Published</th>
                  <th>Updated</th>
                  <th className="admin-table-end">Edit</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const status = displayStatus(r);
                  return (
                    <tr key={r.id}>
                      <th scope="row">
                        <Link href={`/admin/posts/${r.id}`}>{titleOf(r)}</Link>
                        <span className="admin-sub">/{r.slug}</span>
                      </th>
                      <td><span className="post-lang-badge">{LANG_LABEL[langsOf(r)]}</span></td>
                      <td>
                        <span className={`admin-status ${STATUS_CLASS[status]}`}>{STATUS_LABEL[status]}</span>
                        {status === 'scheduled' && r.publish_at && (
                          <span className="admin-sub">{formatDate(cairoDateOf(r.publish_at), 'en')}</span>
                        )}
                      </td>
                      <td className="admin-muted">{categoryOf(r) || '—'}</td>
                      <td className="admin-muted">{r.published_on ? formatDate(r.published_on, 'en') : '—'}</td>
                      <td className="admin-muted">{r.content_updated_at ? formatDate(cairoDateOf(r.content_updated_at), 'en') : '—'}</td>
                      <td className="admin-table-end"><Link href={`/admin/posts/${r.id}`} className="admin-link">Edit</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
