import { Calendar, ChevronLeft, ChevronRight, FolderOpen } from 'lucide-react';
import type { ModelArticleVO } from '@/api/model/modelArticleVO';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/shadcn/utils';
import { BLOG_H_BORDER, BLOG_H_COLOR, BLOG_PAGE_SIZE, BLOG_PANEL_BG, blogPanelBorderStyle, blogPanelShellClass, formatBlogDateTime, scrollBlogListToTop } from './helper';

export type BlogListProps = {
  records: ModelArticleVO[];
  listLoading: boolean;
  selectedId: number | null;
  onSelectId: (id: number) => void;
  page: number;
  total: number;
  onPageChange: (page: number) => void;
};

export default function BlogList({ records, listLoading, selectedId, onSelectId, page, total, onPageChange }: BlogListProps) {
  const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));

  return (
    <aside className={cn(blogPanelShellClass, 'flex min-h-[280px] shrink-0 flex-col lg:h-[calc(100dvh-8rem)] lg:w-[300px]')} style={blogPanelBorderStyle}>
      <div className="shrink-0 border-b py-1.5 text-center text-sm font-bold leading-normal text-white" style={{ backgroundColor: BLOG_H_COLOR, borderColor: BLOG_H_BORDER }}>
        Blogs
      </div>
      <div className="flex min-h-0 flex-1 flex-col" style={{ backgroundColor: BLOG_PANEL_BG }}>
        {listLoading ? (
          <p className="px-3 py-8 text-center text-xs text-[#333]/80">加载中…</p>
        ) : records.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-[#333]/80">暂无文章</p>
        ) : (
          <ul className="min-h-0 flex-1 list-none space-y-0 overflow-y-auto overscroll-contain p-2" id="blog-list">
            {records.map((item) => {
              const id = item.id;
              const active = id != null && id === selectedId;
              return (
                <li key={id ?? item.title} className="mb-3.5 last:mb-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof id === 'number') onSelectId(id);
                    }}
                    disabled={typeof id !== 'number'}
                    className={cn('w-full cursor-pointer rounded-none border-r-[5px] border-solid px-2 py-0.5 text-left transition-colors', active ? 'bg-[#74759b0f]' : 'hover:bg-black/[0.03]', typeof id !== 'number' && 'cursor-not-allowed opacity-60')}
                    style={{ borderRightColor: active ? BLOG_H_COLOR : 'transparent' }}
                  >
                    <div className="line-clamp-2 text-sm font-bold leading-snug text-[#333]">{item.title ?? '无标题'}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-1 text-[11px] leading-5 text-[#333]">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <Calendar className="size-3 shrink-0 opacity-80" aria-hidden />
                        {formatBlogDateTime(item.createTime)}
                      </span>
                      {item.typeName ? (
                        <>
                          <span className="px-0.5 text-[#333]/35" aria-hidden>
                            |
                          </span>
                          <span className="inline-flex items-center gap-1 font-semibold">
                            <FolderOpen className="size-3 shrink-0 opacity-80" aria-hidden />
                            {item.typeName}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {total > BLOG_PAGE_SIZE ? (
          <div className="flex shrink-0 items-center justify-between gap-2 border-t px-2 py-2" style={{ borderColor: BLOG_H_BORDER }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 border-[#333] bg-white/90 px-2 text-[#333] hover:bg-[#74759b]/10"
              disabled={page <= 1}
              onClick={() => {
                onPageChange(Math.max(1, page - 1));
                scrollBlogListToTop();
              }}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="text-[11px] font-semibold text-[#333]/80">
              {page} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 border-[#333] bg-white/90 px-2 text-[#333] hover:bg-[#74759b]/10"
              disabled={page >= totalPages}
              onClick={() => {
                onPageChange(Math.min(totalPages, page + 1));
                scrollBlogListToTop();
              }}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
