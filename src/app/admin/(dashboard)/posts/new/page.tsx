import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { emptyLang, type PostRow } from '@/lib/post-utils';
import { AdminHeader } from '../../../AdminHeader';
import { PostEditor } from '../PostEditor';
import { editorData } from '../editor-data';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'New post' };

export default async function NewPostPage() {
  const initial: PostRow = {
    slug: '', previous_slugs: [], status: 'draft', publish_at: null, published_on: null, content_updated_at: null,
    tags: [], author_slug: null, related_services: [], cover: null, show_toc: true,
    en_enabled: true, ar_enabled: true, en: emptyLang(), ar: emptyLang(),
  };
  return (
    <>
      <AdminHeader
        title="New post"
        subtitle="Saved as a draft until you publish or schedule it."
        action={<Link href="/admin/posts" className="btn btn-ghost btn-sm"><Icon name="left" className="h-4 w-4" /> All posts</Link>}
      />
      <div className="admin-body">
        <PostEditor id={null} initial={initial} {...await editorData()} />
      </div>
    </>
  );
}
