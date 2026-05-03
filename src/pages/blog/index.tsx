import { useRequest } from 'ahooks';
import { useEffect, useMemo, useState } from 'react';
import { getArticle, getArticleId } from '@/api/endpoints/article';
import { getAppInfo } from '@/api/endpoints/base';
import type { ModelAppInfo } from '@/api/model/modelAppInfo';
import type { ModelArticleVO } from '@/api/model/modelArticleVO';
import type { AboutContent } from '@/pages/home/helper';
import BlogDetail from './blog-detail';
import BlogList from './blog-list';
import { BLOG_PAGE_SIZE, normalizeArticleList } from './helper';

export default function Blog() {
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: appInfo } = useRequest(async () => {
    const raw = await getAppInfo();
    return raw != null ? (raw as ModelAppInfo) : null;
  });

  const nickname = useMemo(() => {
    const c = (appInfo?.content ?? {}) as AboutContent;
    return c.nickname?.trim() || '本站';
  }, [appInfo]);

  const {
    data: listPayload,
    loading: listLoading,
    error: listError,
  } = useRequest(
    async () => {
      const raw = await getArticle({
        params: { current: page, size: BLOG_PAGE_SIZE },
      });
      return normalizeArticleList(raw);
    },
    { refreshDeps: [page] },
  );

  useEffect(() => {
    const records = listPayload?.records ?? [];
    if (records.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) => {
      if (prev != null && records.some((r) => r.id === prev)) return prev;
      const first = records[0]?.id;
      return typeof first === 'number' ? first : null;
    });
  }, [listPayload]);

  const { data: articleDetail, loading: detailLoading } = useRequest(
    async () => {
      if (selectedId == null) return null;
      const raw = await getArticleId(selectedId);
      return (raw ?? null) as ModelArticleVO | null;
    },
    { refreshDeps: [selectedId], ready: selectedId != null },
  );

  if (listError) {
    return <div className="mx-auto max-w-lg px-2 py-10 text-center text-sm text-destructive">加载文章列表失败，请确认后端已启动（默认 http://localhost:8080/api）。</div>;
  }

  const records = listPayload?.records ?? [];
  const total = listPayload?.total ?? 0;

  return (
    <div className="blog-mark mx-auto box-border flex h-full min-h-0 w-full max-w-[1200px] flex-col gap-6 px-4 py-5 lg:flex-row lg:gap-[30px] lg:px-[60px] lg:py-[30px]">
      <BlogList records={records} listLoading={listLoading} selectedId={selectedId} onSelectId={setSelectedId} page={page} total={total} onPageChange={setPage} />
      <BlogDetail articleDetail={articleDetail} detailLoading={detailLoading} selectedId={selectedId} nickname={nickname} />
    </div>
  );
}
