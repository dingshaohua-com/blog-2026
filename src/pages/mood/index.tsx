import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useCallback, useEffect, useState } from 'react';
import 'dayjs/locale/zh-cn';
import { getMood, type MoodRecord, normalizeMoodList } from '@/api/endpoints/mood';
import { Button } from '@/components/ui/button';
import { BLOG_H_COLOR } from '@/pages/blog/helper';
import { cn } from '@/utils/shadcn/utils';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const PAGE_SIZE = 14;

function moodFromNow(iso?: string): string {
  if (!iso?.trim()) return '—';
  const d = dayjs(iso);
  return d.isValid() ? d.fromNow() : iso;
}

export default function Mood() {
  const [items, setItems] = useState<MoodRecord[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (targetPage: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);
    try {
      const raw = await getMood({
        params: { current: targetPage, size: PAGE_SIZE },
      });
      const { items: next, total: t } = normalizeMoodList(raw);
      if (append) {
        setItems((prev) => [...prev, ...next]);
      } else {
        setItems(next);
      }
      setTotal(t);
      setPage(targetPage);
    } catch {
      setError('加载失败，请确认后端已启动（默认 http://localhost:8080/api）。');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void load(1, false);
  }, [load]);

  const hasMore = items.length < total;

  const handleMore = () => {
    void load(page + 1, true);
  };

  if (error && items.length === 0 && !loading) {
    return <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-destructive">{error}</div>;
  }

  return (
    <div className="mx-auto box-border min-h-0 w-full max-w-[900px] px-4 py-8 lg:py-10">
      {loading && items.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">加载中…</p>
      ) : items.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">暂无心情</p>
      ) : (
        <ul className="relative m-0 list-none p-0">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.id ?? `${item.createTime}-${index}`} className="relative flex gap-4 pb-10 pl-0 last:pb-0">
                <div className="relative flex w-5 shrink-0 flex-col items-center">
                  <span className="z-[1] mt-1.5 size-3 shrink-0 rounded-full ring-4 ring-[#f0f2f5]" style={{ backgroundColor: BLOG_H_COLOR }} aria-hidden />
                  {!isLast ? <span className="absolute top-5 bottom-0 w-px bg-border" aria-hidden /> : null}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="text-sm font-bold" style={{ color: BLOG_H_COLOR }}>
                    💕 {moodFromNow(item.createTime)}
                  </div>
                  <div
                    className={cn(
                      'mood-html mt-3 text-[15px] leading-relaxed text-foreground',
                      '[&_a]:break-all [&_a]:font-medium [&_a]:underline-offset-2 [&_a]:hover:underline',
                      '[&_img]:max-w-full [&_img]:rounded-md [&_p]:my-2 [&_p]:first:mt-0',
                      '[&_pre]:my-3 [&_pre]:max-h-[min(60vh,480px)] [&_pre]:overflow-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted/50 [&_pre]:p-3 [&_pre]:text-sm',
                    )}
                    dangerouslySetInnerHTML={{ __html: item.content ?? '' }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {hasMore ? (
        <div className="mt-2 flex justify-center border-t border-border pt-6">
          <Button type="button" variant="default" disabled={loadingMore} onClick={handleMore} className="min-w-[120px] border-0 font-semibold text-white hover:opacity-90" style={{ backgroundColor: BLOG_H_COLOR }}>
            {loadingMore ? '加载中…' : '查看更多'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
