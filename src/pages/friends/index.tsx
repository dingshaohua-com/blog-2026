import { useRequest } from 'ahooks';
import { Check, Copy, Mail } from 'lucide-react';
import { useCallback, useState } from 'react';
import { getAppInfo } from '@/api/endpoints/base';
import type { ModelAppInfo } from '@/api/model/modelAppInfo';
import { Button } from '@/components/ui/button';
import { BLOG_H_COLOR } from '@/pages/blog/helper';
import { cn } from '@/utils/shadcn/utils';
import FriendsComments from './comments';
import { extractFriends, extractMaster, type FriendItem, type FriendsContent, type MasterEntry } from './helper';

const FRIEND_PLACEHOLDER = 'https://cos.han96.com/blog/headers/avatar.jpg';

export default function Friends() {
  const { data: appInfo, loading } = useRequest(async () => {
    const raw = await getAppInfo();
    return raw != null ? (raw as ModelAppInfo) : null;
  });

  const content = (appInfo?.content ?? {}) as FriendsContent;
  const masterEntries = extractMaster(content);
  const friends = extractFriends(content);

  return (
    <div className="mx-auto box-border h-full w-full max-w-[900px] overflow-y-auto px-4 py-8 lg:py-10">
      <section aria-labelledby="friends-master" className="mb-10">
        <h2 id="friends-master" className="sr-only">
          站长信息（可复制）
        </h2>
        <div className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-6">
          {loading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">加载中…</p>
          ) : (
            <ul className="m-0 list-none space-y-1 p-0">
              {masterEntries.map((entry) => (
                <MasterRow key={entry.field} entry={entry} />
              ))}
            </ul>
          )}
        </div>
      </section>

      <section aria-labelledby="friends-list" className="mb-10">
        <h2 id="friends-list" className="mb-5 inline-flex items-center gap-2 rounded-r-xl py-1 pr-7 pl-2.5 text-xl leading-snug font-semibold text-white shadow-sm" style={{ backgroundColor: BLOG_H_COLOR }}>
          友人帐
        </h2>
        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">加载中…</p>
        ) : friends.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">暂无友链</p>
        ) : (
          <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {friends.map((item) => (
              <li key={`${item.name}-${item.url ?? ''}`}>
                <FriendCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="friends-comments">
        <h2 id="friends-comments" className="sr-only">
          留言板
        </h2>
        <FriendsComments />
      </section>
    </div>
  );
}

function MasterRow({ entry }: { entry: MasterEntry }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(entry.value);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      /** clipboard 不可用时静默 */
    }
  }, [entry.value]);

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-[15px]">
      <Mail className="size-4 shrink-0 opacity-70" aria-hidden />
      <b className="font-bold" style={{ color: BLOG_H_COLOR }}>
        const
      </b>
      <span className="inline-flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs leading-5 text-foreground/80">{entry.field}</span>
      <span className="min-w-0 flex-1 break-all text-foreground/90">{entry.value}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-foreground"
        aria-label={copied ? '已复制' : `复制 ${entry.field}`}
        onClick={() => {
          void handleCopy();
        }}
      >
        {copied ? <Check className="size-4 text-emerald-500" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      </Button>
    </li>
  );
}

function FriendCard({ item }: { item: FriendItem }) {
  const clickable = Boolean(item.url);

  const inner = (
    <div className={cn('flex h-full flex-col items-center rounded-xl border border-border bg-card px-3 py-5 text-center text-card-foreground shadow-sm transition-colors', clickable ? 'cursor-pointer hover:border-foreground/20 hover:bg-muted/50' : 'cursor-default')}>
      <img src={item.avatar?.trim() || FRIEND_PLACEHOLDER} alt={`${item.name} 头像`} className="size-16 rounded-full border border-border bg-background object-cover" loading="lazy" width={64} height={64} />
      <div className="mt-2 line-clamp-1 text-base leading-7 font-medium">{item.name}</div>
      {item.dec ? <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.dec}</div> : null}
    </div>
  );

  if (!clickable) return inner;

  return (
    <a href={item.url} target="_blank" rel="noreferrer noopener" aria-label={`访问 ${item.name} 的网站`} className="block focus-visible:rounded-xl focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none">
      {inner}
    </a>
  );
}
