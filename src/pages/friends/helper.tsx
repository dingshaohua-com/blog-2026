/**
 * 与 blog-2022 `pages/comment` 对齐：
 * - 站长信息（name / link / avatar / descr）
 * - 友链列表（friend 数组）
 * - 留言板（GET /comment?articleId=0&...）
 * 数据均来自 `GET /app-info` 的 `content` 字段（在 blog-2022 是 `payload.other` JSON 解析后的 info）。
 */
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import type { ModelComment } from '@/api/model/modelComment';
import type { ModelPageResultModelComment } from '@/api/model/modelPageResultModelComment';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

/* ------------------------------ 友链 / 站长信息 ------------------------------ */

export type FriendItem = {
  name: string;
  dec?: string;
  avatar?: string;
  url?: string;
};

export type MasterField = 'name' | 'link' | 'avatar' | 'descr';
export type MasterEntry = {
  field: MasterField;
  value: string;
};

/** `app-info.content` 中关于「友人帐」用到的字段 */
export interface FriendsContent {
  nickname?: string;
  link?: string;
  avatar?: string;
  dec?: string;
  friend?: unknown;
}

/** 兜底站长信息，与 blog-2022 comment 页硬编码保持一致 */
const FALLBACK_MASTER: Record<MasterField, string> = {
  name: '花贝',
  link: 'https://han96.com',
  avatar: 'https://cos.han96.com/blog/headers/avatar.jpg',
  descr: '一个社恐的前端开发从业者',
};

const MASTER_ORDER: MasterField[] = ['name', 'link', 'avatar', 'descr'];

export function extractMaster(content?: FriendsContent | null): MasterEntry[] {
  const c = content ?? {};
  const map: Record<MasterField, string> = {
    name: c.nickname?.trim() || FALLBACK_MASTER.name,
    link: c.link?.trim() || FALLBACK_MASTER.link,
    avatar: c.avatar?.trim() || FALLBACK_MASTER.avatar,
    descr: c.dec?.trim() || FALLBACK_MASTER.descr,
  };
  return MASTER_ORDER.map((field) => ({ field, value: map[field] }));
}

export function extractFriends(content?: FriendsContent | null): FriendItem[] {
  const raw = content?.friend;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((it) => {
      if (!it || typeof it !== 'object') return null;
      const o = it as Record<string, unknown>;
      const name = typeof o.name === 'string' ? o.name.trim() : '';
      if (!name) return null;
      return {
        name,
        dec: typeof o.dec === 'string' ? o.dec : undefined,
        avatar: typeof o.avatar === 'string' ? o.avatar : undefined,
        url: typeof o.url === 'string' ? o.url : undefined,
      } satisfies FriendItem;
    })
    .filter((x): x is FriendItem => x != null);
}

/* --------------------------------- 留言板 --------------------------------- */

/** 友人帐留言不挂任何文章，与 blog-2022 一致使用 0 */
export const FRIENDS_COMMENT_ARTICLE_ID = 0;
export const FRIENDS_COMMENT_PAGE_SIZE = 10;

/** 编辑器持久化字段，对应 blog-2022 localStorage `h-userInfo` */
export const COMMENTER_STORAGE_KEY = 'blog-2026:commenter';

export type CommenterDraft = {
  nickName: string;
  email: string;
  blogUrl: string;
  avatar: string;
};

export const EMPTY_COMMENTER: CommenterDraft = { nickName: '', email: '', blogUrl: '', avatar: '' };

export function readCommenter(): CommenterDraft {
  if (typeof window === 'undefined') return EMPTY_COMMENTER;
  try {
    const raw = window.localStorage.getItem(COMMENTER_STORAGE_KEY);
    if (!raw) return EMPTY_COMMENTER;
    const parsed = JSON.parse(raw) as Partial<CommenterDraft>;
    return {
      nickName: typeof parsed.nickName === 'string' ? parsed.nickName : '',
      email: typeof parsed.email === 'string' ? parsed.email : '',
      blogUrl: typeof parsed.blogUrl === 'string' ? parsed.blogUrl : '',
      avatar: typeof parsed.avatar === 'string' ? parsed.avatar : '',
    };
  } catch {
    return EMPTY_COMMENTER;
  }
}

export function saveCommenter(value: CommenterDraft): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(COMMENTER_STORAGE_KEY, JSON.stringify(value));
  } catch {
    /** 私密浏览 / 空间满 时忽略 */
  }
}

export type CommentListPayload = {
  list: ModelComment[];
  total: number;
  current: number;
  size: number;
  hasMore: boolean;
};

/** 兼容数组返回 / `{ list, total, ... }` 分页对象 / 旧版 `records` 形态 */
export function normalizeCommentList(raw: unknown): CommentListPayload {
  if (Array.isArray(raw)) {
    const list = raw as ModelComment[];
    return { list, total: list.length, current: 1, size: list.length || FRIENDS_COMMENT_PAGE_SIZE, hasMore: false };
  }
  if (raw && typeof raw === 'object') {
    const o = raw as ModelPageResultModelComment & Record<string, unknown>;
    const fromList = Array.isArray(o.list) ? (o.list as ModelComment[]) : null;
    const fromRecords = Array.isArray((o as { records?: unknown }).records) ? ((o as { records?: ModelComment[] }).records ?? null) : null;
    const list = fromList ?? fromRecords ?? [];
    const total = typeof o.total === 'number' ? o.total : list.length;
    const current = typeof o.current === 'number' ? o.current : 1;
    const size = typeof o.size === 'number' ? o.size : FRIENDS_COMMENT_PAGE_SIZE;
    const computedHasMore = current * size < total;
    const hasMore = typeof o.hasMore === 'boolean' ? o.hasMore : computedHasMore;
    return { list, total, current, size, hasMore };
  }
  return { list: [], total: 0, current: 1, size: FRIENDS_COMMENT_PAGE_SIZE, hasMore: false };
}

export function formatCommentTime(iso?: string): string {
  if (!iso?.trim()) return '—';
  const d = dayjs(iso);
  return d.isValid() ? d.fromNow() : iso;
}

export type ReplyTarget = { id: number; nickName: string } | null;

/** 转义 HTML，防 XSS（用于把用户文本嵌入 dangerouslySetInnerHTML 的内容） */
function escapeHtml(input: string): string {
  return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** 把裸 URL 转成 <a target="_blank">；先 escape 再做 linkify，避免被注入 */
function linkify(escapedText: string): string {
  return escapedText.replace(/(https?:\/\/[^\s<]+)/g, (m) => `<a href="${m}" target="_blank" rel="noreferrer noopener">${m}</a>`);
}

/** plain-text → 渲染安全的 HTML：转义 + 换行 <br/> + URL linkify */
export function textToSafeHtml(plain: string): string {
  return linkify(escapeHtml(plain).replace(/\r?\n/g, '<br/>'));
}

/** 与 blog-2022 一致：回复时在 content 前面拼一段 "回复 @xxx" 的 HTML */
export function buildReplyPrefix(nickName?: string): string {
  if (!nickName?.trim()) return '';
  return `<div style="font-size:12px;">回复 <a style="padding-right:20px;">@${escapeHtml(nickName.trim())}</a></div>`;
}

/** 邮箱是 QQ 邮箱时，自动生成 QQ 头像 URL */
export function pickAvatar(email?: string, avatar?: string): string {
  const trimmed = avatar?.trim();
  if (trimmed) return trimmed;
  if (!email) return '';
  const [num, domain] = email.split('@');
  if (domain?.toLowerCase() === 'qq.com' && /^[1-9][0-9]{4,9}$/.test(num)) {
    return `https://q1.qlogo.cn/g?b=qq&nk=${num}&s=100`;
  }
  return '';
}

/**
 * 后端 children 可能多层嵌套：树形 → 扁平按时间升序，与 blog-2022 仅 1 层 child 的视觉一致。
 */
export function flattenChildren(comment: ModelComment): ModelComment[] {
  const flat: ModelComment[] = [];
  const stack: ModelComment[] = [...(comment.children ?? [])];
  while (stack.length) {
    const cur = stack.shift();
    if (!cur) continue;
    flat.push(cur);
    if (Array.isArray(cur.children) && cur.children.length) {
      stack.push(...cur.children);
    }
  }
  return flat.sort((a, b) => {
    const ta = a.createTime ? dayjs(a.createTime).valueOf() : 0;
    const tb = b.createTime ? dayjs(b.createTime).valueOf() : 0;
    return ta - tb;
  });
}

/** 用 5-10 位数字判断 QQ 号，用于编辑器昵称回车的"自动生成头像/邮箱" */
export function isQQNumber(value: string): boolean {
  return /^[1-9][0-9]{4,9}$/.test(value);
}
