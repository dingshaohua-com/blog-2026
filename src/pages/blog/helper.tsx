import type { ModelArticleVO } from '@/api/model/modelArticleVO';

/** 对齐 blog-2022（craco）：@h-color #74759b */
export const BLOG_H_COLOR = '#74759b';
export const BLOG_H_BORDER = '#333';
export const BLOG_PANEL_BG = 'rgba(255, 255, 255, 0.82)';

export const BLOG_PAGE_SIZE = 10;

export const blogPanelShellClass = 'box-border overflow-hidden rounded-[20px] border shadow-sm';

export const blogPanelBorderStyle = { borderColor: BLOG_H_BORDER } as const;

export type ArticleListPayload = {
  /** 与 UI 一致：由后端 `list` 或旧字段 `records` 归一化而来 */
  records: ModelArticleVO[];
  total: number;
  current: number;
  size: number;
  /** 后端分页：是否还有下一页（无则仅依赖 total 推算） */
  hasMore?: boolean;
};

export function normalizeArticleList(raw: unknown): ArticleListPayload {
  if (Array.isArray(raw)) {
    const records = raw as ModelArticleVO[];
    return { records, total: records.length, current: 1, size: records.length || BLOG_PAGE_SIZE };
  }
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    const fromList = Array.isArray(o.list) ? (o.list as ModelArticleVO[]) : null;
    const fromRecords = Array.isArray(o.records) ? (o.records as ModelArticleVO[]) : null;
    const records = fromList ?? fromRecords ?? [];
    const hasListOrRecords = fromList != null || fromRecords != null;
    const hasPagingShape = hasListOrRecords || 'total' in o || 'current' in o || 'size' in o || 'hasMore' in o;

    if (hasPagingShape) {
      const total = typeof o.total === 'number' ? o.total : records.length;
      const current = typeof o.current === 'number' ? o.current : 1;
      const size = typeof o.size === 'number' ? o.size : BLOG_PAGE_SIZE;
      const hasMore = typeof o.hasMore === 'boolean' ? o.hasMore : undefined;
      return { records, total, current, size, hasMore };
    }
  }
  return { records: [], total: 0, current: 1, size: BLOG_PAGE_SIZE };
}

export function formatBlogDateTime(iso?: string): string {
  if (!iso?.trim()) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

export function scrollBlogListToTop(): void {
  document.getElementById('blog-list')?.scrollTo(0, 0);
}

/**
 * 与 blog-2022 `MdPreview` 一致：github 预览主题 + 代码高亮（hljs）+ 超长代码块折叠（details）
 * @see md-editor-rt MdPreviewProps：codeFoldable、autoFoldThreshold
 */
export const blogMdPreviewProps = {
  previewTheme: 'github' as const,
  theme: 'light' as const,
  language: 'zh-CN' as const,
  codeFoldable: true,
  /** 超过此行数自动折叠，与库默认一致 */
  autoFoldThreshold: 30,
  showCodeRowNumber: false,
} as const;
