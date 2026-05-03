import { MdPreview } from 'md-editor-rt';
import { useMemo } from 'react';
import 'md-editor-rt/lib/preview.css';
import type { ModelArticleVO } from '@/api/model/modelArticleVO';
import { cn } from '@/utils/shadcn/utils';
import { BLOG_H_BORDER, BLOG_H_COLOR, BLOG_PANEL_BG, blogMdPreviewProps, blogPanelBorderStyle, blogPanelShellClass } from './helper';

export type BlogDetailProps = {
  articleDetail: ModelArticleVO | null | undefined;
  detailLoading: boolean;
  selectedId: number | null;
  nickname: string;
};

export default function BlogDetail({ articleDetail, detailLoading, selectedId, nickname }: BlogDetailProps) {
  const title = articleDetail?.title ?? (selectedId ? '加载中…' : '请选择文章');

  const previewId = useMemo(() => `blog-article-md-${articleDetail?.id ?? selectedId ?? 'none'}`, [articleDetail?.id, selectedId]);

  const content = articleDetail?.content?.trim() ?? '';

  return (
    <section className={cn(blogPanelShellClass, 'flex min-h-0 min-w-0 flex-1 flex-col lg:h-[calc(100dvh-8rem)]')} style={blogPanelBorderStyle}>
      <div className="shrink-0 border-b px-3 text-center text-xl font-bold leading-10 text-white" style={{ backgroundColor: BLOG_H_COLOR, borderColor: BLOG_H_BORDER }}>
        <span className="line-clamp-2">@{title}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5" id="blog-article" style={{ backgroundColor: BLOG_PANEL_BG }}>
        {detailLoading && selectedId != null ? (
          <p className="text-center text-sm text-[#333]/70">加载正文…</p>
        ) : content !== '' ? (
          <>
            <div className="blog-md-preview min-w-0 [&_.md-editor]:!h-auto [&_.md-editor]:!min-h-0 [&_.md-editor]:!border-0 [&_.md-editor]:!bg-transparent [&_.md-editor-preview]:!px-0 [&_.md-editor-preview]:!py-0">
              <MdPreview key={previewId} id={previewId} value={content} {...blogMdPreviewProps} />
            </div>
            <footer className="mt-5 py-2.5 text-sm leading-7 text-[#333]" style={{ borderTop: `3px solid ${BLOG_H_COLOR}` }}>
              <p>
                版权属于：
                <span className="font-semibold" style={{ color: BLOG_H_COLOR }}>
                  @{nickname}
                </span>
              </p>
              <p className="mt-1">
                作品采用
                <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer" style={{ color: BLOG_H_COLOR }} className="underline-offset-2 hover:underline">
                  CC BY-NC-SA 4.0
                </a>
                许可协议，转载请注明来自
                <span className="font-semibold" style={{ color: BLOG_H_COLOR }}>
                  @{nickname}
                </span>
                。
              </p>
            </footer>
          </>
        ) : selectedId != null ? (
          <p className="text-center text-sm text-[#333]/70">暂无正文</p>
        ) : (
          <p className="text-center text-sm text-[#333]/70">在左侧列表中选择一篇文章</p>
        )}
      </div>
    </section>
  );
}
