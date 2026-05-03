import { useRequest } from 'ahooks';
import { Globe, Loader2, Mail, MessageSquare, Send, User, X } from 'lucide-react';
import { type FormEvent, type KeyboardEvent, useCallback, useEffect, useId, useRef, useState } from 'react';
import { getComment, postComment } from '@/api/endpoints/comment';
import type { ModelComment } from '@/api/model/modelComment';
import { Button } from '@/components/ui/button';
import { BLOG_H_COLOR } from '@/pages/blog/helper';
import { cn } from '@/utils/shadcn/utils';
import {
  buildReplyPrefix,
  type CommenterDraft,
  EMPTY_COMMENTER,
  flattenChildren,
  formatCommentTime,
  FRIENDS_COMMENT_ARTICLE_ID,
  FRIENDS_COMMENT_PAGE_SIZE,
  isQQNumber,
  normalizeCommentList,
  pickAvatar,
  readCommenter,
  type ReplyTarget,
  saveCommenter,
  textToSafeHtml,
} from './helper';

const DEFAULT_AVATAR = 'https://cos.han96.com/blog/headers/avatar.jpg';

const inputBaseClass = cn(
  'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors',
  'placeholder:text-muted-foreground/80',
  'focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40',
  'disabled:cursor-not-allowed disabled:opacity-60',
  '[&::-webkit-search-cancel-button]:hidden',
);

export default function FriendsComments() {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [reply, setReply] = useState<ReplyTarget>(null);
  const [listKey, setListKey] = useState(0);
  const [page, setPage] = useState(1);

  const {
    data: payload,
    loading,
    refresh,
  } = useRequest(
    async () => {
      const raw = await getComment({ articleId: FRIENDS_COMMENT_ARTICLE_ID, current: page, size: FRIENDS_COMMENT_PAGE_SIZE });
      return normalizeCommentList(raw);
    },
    { refreshDeps: [page, listKey] },
  );

  const list = payload?.list ?? [];
  const total = payload?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / FRIENDS_COMMENT_PAGE_SIZE));

  const handleReply = useCallback((target: ReplyTarget) => {
    setReply(target);
    if (target) {
      window.requestAnimationFrame(() => {
        editorRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      });
    }
  }, []);

  const handleSubmitted = useCallback(() => {
    setReply(null);
    if (page !== 1) setPage(1);
    else {
      setListKey((k) => k + 1);
      void refresh();
    }
  }, [page, refresh]);

  return (
    <div className="space-y-6">
      <div ref={editorRef}>
        <CommentEditor reply={reply} onCancelReply={() => setReply(null)} onSubmitted={handleSubmitted} />
      </div>

      <div className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="text-base font-semibold">{total} 条留言</h3>
          {totalPages > 1 ? (
            <span className="text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
          ) : null}
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">加载中…</p>
        ) : list.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">还没有留言，来抢个沙发？</p>
        ) : (
          <ul className="m-0 list-none space-y-5 p-0">
            {list.map((item) => (
              <CommentItem key={item.id ?? `${item.nickName}-${item.createTime}`} comment={item} onReply={handleReply} />
            ))}
          </ul>
        )}

        {totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-center gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                editorRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
              }}
            >
              上一页
            </Button>
            <span className="text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                editorRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
              }}
            >
              下一页
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* --------------------------------- 编辑器 --------------------------------- */

type CommentEditorProps = {
  reply: ReplyTarget;
  onCancelReply: () => void;
  onSubmitted: () => void;
};

function CommentEditor({ reply, onCancelReply, onSubmitted }: CommentEditorProps) {
  const idPrefix = useId();
  const [draft, setDraft] = useState<CommenterDraft>(EMPTY_COMMENTER);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(readCommenter());
  }, []);

  const previewAvatar = pickAvatar(draft.email, draft.avatar) || DEFAULT_AVATAR;

  const updateField = (field: keyof CommenterDraft, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  /** 在 nickName 处按 Enter：若为 QQ 号则自动生成 email/avatar 并把光标焦点继续输入昵称 */
  const handleNickKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const num = draft.nickName.trim();
    if (!isQQNumber(num)) return;
    e.preventDefault();
    setDraft({
      nickName: '',
      email: `${num}@qq.com`,
      blogUrl: draft.blogUrl,
      avatar: `https://q1.qlogo.cn/g?b=qq&nk=${num}&s=100`,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const nickName = draft.nickName.trim();
    const email = draft.email.trim();
    const text = content.trim();
    if (!nickName) {
      setError('请填写昵称');
      return;
    }
    if (!text) {
      setError('请填写留言内容');
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('邮箱格式不正确');
      return;
    }

    const finalContent = `${buildReplyPrefix(reply?.nickName)}${textToSafeHtml(text)}`;
    const payload: ModelComment = {
      nickName,
      email,
      blogUrl: draft.blogUrl.trim() || undefined,
      avatar: pickAvatar(email, draft.avatar) || undefined,
      content: finalContent,
      replyArticleId: FRIENDS_COMMENT_ARTICLE_ID,
      ...(reply?.id ? { replyCmId: reply.id } : {}),
    };

    setSubmitting(true);
    try {
      await postComment(payload);
      saveCommenter({ ...draft, nickName, email });
      setContent('');
      onSubmitted();
    } catch {
      setError('发布失败，请稍后再试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="inline-flex items-center gap-2 text-base font-semibold">
          <MessageSquare className="size-4" aria-hidden style={{ color: BLOG_H_COLOR }} />
          留言板
        </h3>
        <span className="text-xs text-muted-foreground">在「昵称」处填 QQ 号，回车获取头像和邮箱</span>
      </div>

      <div className="flex gap-3 sm:gap-4">
        <Avatar src={previewAvatar} fallback={draft.nickName || '匿名'} className="size-10 sm:size-12" />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <FieldWithIcon icon={<User className="size-3.5" />}>
              <input
                id={`${idPrefix}-nickName`}
                className={inputBaseClass}
                placeholder="昵称（必填）"
                value={draft.nickName}
                onChange={(e) => {
                  updateField('nickName', e.target.value);
                }}
                onKeyDown={handleNickKeyDown}
                maxLength={32}
                style={{ paddingLeft: 30 }}
                aria-label="昵称"
                required
              />
            </FieldWithIcon>
            <FieldWithIcon icon={<Mail className="size-3.5" />}>
              <input
                id={`${idPrefix}-email`}
                type="email"
                className={inputBaseClass}
                placeholder="邮箱"
                value={draft.email}
                onChange={(e) => {
                  updateField('email', e.target.value);
                }}
                style={{ paddingLeft: 30 }}
                aria-label="邮箱"
              />
            </FieldWithIcon>
            <FieldWithIcon icon={<Globe className="size-3.5" />}>
              <input
                id={`${idPrefix}-blogUrl`}
                type="url"
                className={inputBaseClass}
                placeholder="网站（选填）"
                value={draft.blogUrl}
                onChange={(e) => {
                  updateField('blogUrl', e.target.value);
                }}
                style={{ paddingLeft: 30 }}
                aria-label="网站"
              />
            </FieldWithIcon>
          </div>

          <textarea
            id={`${idPrefix}-content`}
            className={cn(inputBaseClass, 'h-auto min-h-[110px] resize-y py-2 leading-relaxed')}
            placeholder={reply?.nickName ? `回复 @${reply.nickName} ……（支持换行 / 自动识别 URL）` : '说点什么吧……（支持换行 / 自动识别 URL）'}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
            }}
            maxLength={2000}
            aria-label="留言内容"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {reply?.nickName ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5">
                  回复 <strong className="font-medium text-foreground">@{reply.nickName}</strong>
                  <button
                    type="button"
                    onClick={onCancelReply}
                    className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
                    aria-label="取消回复"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ) : null}
              {error ? <span className="text-destructive">{error}</span> : null}
            </div>
            <Button type="submit" disabled={submitting || !draft.nickName.trim() || !content.trim()} className="font-semibold text-white" style={{ backgroundColor: BLOG_H_COLOR }}>
              {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
              {submitting ? '发布中…' : '发布'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function FieldWithIcon({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground">{icon}</span>
      {children}
    </div>
  );
}

/* --------------------------------- 列表项 --------------------------------- */

function CommentItem({ comment, onReply }: { comment: ModelComment; onReply: (target: ReplyTarget) => void }) {
  const children = flattenChildren(comment);
  const avatar = pickAvatar(comment.email, comment.avatar) || DEFAULT_AVATAR;

  return (
    <li className="space-y-3">
      <CommentRow comment={comment} avatar={avatar} canReply onReply={onReply} />
      {children.length > 0 ? (
        <ul className="m-0 list-none space-y-3 rounded-xl bg-muted/40 p-3 pl-4 sm:pl-5">
          {children.map((sub) => {
            const subAvatar = pickAvatar(sub.email, sub.avatar) || DEFAULT_AVATAR;
            return (
              <li key={sub.id ?? `${sub.nickName}-${sub.createTime}`}>
                <CommentRow comment={sub} avatar={subAvatar} compact canReply onReply={onReply} />
              </li>
            );
          })}
        </ul>
      ) : null}
    </li>
  );
}

type CommentRowProps = {
  comment: ModelComment;
  avatar: string;
  canReply?: boolean;
  compact?: boolean;
  onReply?: (target: ReplyTarget) => void;
};

function CommentRow({ comment, avatar, canReply = false, compact = false, onReply }: CommentRowProps) {
  return (
    <div className="flex gap-3">
      <Avatar src={avatar} fallback={comment.nickName ?? '匿名'} className={compact ? 'size-8' : 'size-10'} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {comment.blogUrl ? (
            <a href={comment.blogUrl} target="_blank" rel="noreferrer noopener" className="text-sm font-semibold text-foreground hover:underline" style={{ color: BLOG_H_COLOR }}>
              {comment.nickName ?? '匿名'}
            </a>
          ) : (
            <span className="text-sm font-semibold text-foreground">{comment.nickName ?? '匿名'}</span>
          )}
          <span className="text-xs text-muted-foreground">{formatCommentTime(comment.createTime)}</span>
          {canReply && comment.id != null ? (
            <button
              type="button"
              className="ml-auto text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                if (comment.id != null) onReply?.({ id: comment.id, nickName: comment.nickName ?? '匿名' });
              }}
            >
              回复
            </button>
          ) : null}
        </div>
        <div
          className={cn(
            'mood-html mt-1 text-[15px] leading-relaxed text-foreground/90',
            '[&_a]:break-all [&_a]:font-medium [&_a]:underline-offset-2 [&_a]:hover:underline',
            '[&_img]:max-w-full [&_img]:rounded-md [&_p]:my-1.5 [&_p]:first:mt-0',
            '[&_pre]:my-2 [&_pre]:max-h-[min(60vh,360px)] [&_pre]:overflow-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted/50 [&_pre]:p-3 [&_pre]:text-sm',
          )}
          dangerouslySetInnerHTML={{ __html: comment.content ?? '' }}
        />
      </div>
    </div>
  );
}

/* --------------------------------- 头像 --------------------------------- */

function Avatar({ src, fallback, className }: { src?: string; fallback: string; className?: string }) {
  const [errored, setErrored] = useState(false);
  const useFallback = !src || errored;
  const initial = fallback.trim().slice(0, 1) || '?';

  return (
    <span className={cn('relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-sm font-medium text-foreground', className)} aria-hidden>
      {useFallback ? (
        <span>{initial}</span>
      ) : (
        <img
          src={src}
          alt=""
          className="size-full object-cover"
          loading="lazy"
          onError={() => {
            setErrored(true);
          }}
        />
      )}
    </span>
  );
}
