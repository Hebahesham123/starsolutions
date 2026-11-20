import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { rscSupabase } from '@/lib/admin/session';
import { normalizeRow } from '@/lib/post-utils';
import { AdminHeader } from '../../../AdminHeader';
import { PostEditor } from '../PostEditor';
import { editorData } from '../editor-data';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Edit post' };

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const { data } = await rscSupabase().from('posts').select('*').eq('id', params.id).maybeSingle();
  if (!data) notFound();
  const row = normalizeRow(data);
  return (
    <>
      <AdminHeader
        title={row.en.title || row.ar.title || row.slug}
        subtitle={`/blog/${row.slug}`}
        action={<Link href="/admin/posts" className="btn btn-ghost btn-sm"><Icon name="left" className="h-4 w-4" /> All posts</Link>}
      />
      <div className="admin-body">
        <PostEditor id={row.id ?? params.id} initial={row} {...await editorData()} />
      </div>
    </>
  );
}
