import { useRequest } from 'ahooks';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { getAppInfo } from '@/api/endpoints/base';
import type { ModelAppInfo } from '@/api/model/modelAppInfo';
import IconFont from '@/components/icon-font';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/utils/shadcn/utils';

const cosUrl = import.meta.env.VITE_COS_URL;

type AboutLinkItem = { name: string; icon: ReactNode; image: string } | { name: string; icon: ReactNode; url: string };

const ABOUTLINK: AboutLinkItem[] = [
  {
    name: 'wechat',
    icon: <IconFont type="h-wechat" />,
    image: `${cosUrl}blog/headers/wechat.png`,
  },
  {
    name: 'qq',
    icon: <IconFont type="h-qq" />,
    image: `${cosUrl}blog/headers/qq.png`,
  },
  {
    name: 'xiaochengxu',
    icon: <IconFont type="h-xiaochengxu" />,
    image: `${cosUrl}blog/headers/xcx.jpeg`,
  },
  {
    name: 'gitee',
    icon: <IconFont type="h-gitee" />,
    url: 'https://gitee.com/han96',
  },
  {
    name: 'csdn',
    icon: <IconFont type="h-csdn" />,
    url: 'https://blog.csdn.net/YanH_an',
  },
];

/** `GET /app-info` → `data.content` 里关于页用到的字段 */
interface AboutContent {
  avatar?: string;
  nickname?: string;
  dec?: string;
}

/** ABOUTLINK：Button 基底会把子 SVG 收成 size-4，这里用 ! 拉大 iconfont */
const aboutLinkIconBtnClass = cn('shrink-0 rounded-lg px-0 text-foreground hover:bg-muted !size-11 text-[32px] leading-none', '[&_.anticon]:inline-flex [&_.anticon]:items-center [&_.anticon]:justify-center [&_.anticon]:!text-[32px] [&_.anticon]:!leading-none', '[&_svg]:!size-8 [&_svg]:max-h-none [&_svg]:max-w-none');

export default function About() {
  const { data: appInfo, loading } = useRequest(async () => {
    const raw = await getAppInfo();
    return raw != null ? (raw as ModelAppInfo) : null;
  });

  if (loading) {
    return <div className="mx-auto mt-[10vh] max-w-[300px] px-2 text-center text-sm text-muted-foreground">加载中…</div>;
  }

  if (!appInfo) {
    return (
      <p className="mx-auto mt-[10vh] max-w-[300px] px-2 text-center">
        <Button variant="link" className="h-auto p-0 text-sm" asChild>
          <Link to="/">返回首页</Link>
        </Button>
      </p>
    );
  }

  const c = (appInfo.content ?? {}) as AboutContent;
  const avatar = c.avatar?.trim() ?? '';
  const nickname = c.nickname?.trim() ?? '';
  const dec = c.dec?.trim() ?? '';

  return (
    <div className="mx-auto mt-[10vh] w-full max-w-[300px] px-2">
      <article className={cn('overflow-hidden rounded-xl border border-border bg-card p-2.5 text-card-foreground shadow-sm', 'backdrop-blur-[5px]')}>
        {avatar ? (
          <div className="overflow-hidden rounded-lg">
            <img src={avatar} alt="头像" className="h-auto w-full object-cover" width={280} height={280} loading="lazy" />
          </div>
        ) : null}
        <div className="px-1 pt-2 text-center">
          {nickname ? <h1 className="text-[26px] leading-[58px] font-bold text-foreground">{nickname}</h1> : null}
          {dec ? <p className="text-sm text-primary">{dec}</p> : null}
        </div>
        <div className="mt-5 flex text-center">
          {ABOUTLINK.map((item) =>
            'url' in item ? (
              <div key={item.name} className="flex-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={aboutLinkIconBtnClass}
                  aria-label={item.name}
                  onClick={() => {
                    window.open(item.url, '_blank', 'noopener,noreferrer');
                  }}
                >
                  {item.icon}
                </Button>
              </div>
            ) : (
              <div key={item.name} className="flex-1">
                <HoverCard openDelay={150} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className={aboutLinkIconBtnClass} aria-label={`${item.name} 二维码`}>
                      {item.icon}
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="border-border">
                    <img src={item.image} alt={`${item.name} 二维码`} className="size-36 rounded-md object-cover" width={144} height={144} />
                  </HoverCardContent>
                </HoverCard>
              </div>
            ),
          )}
        </div>
      </article>
      <p className="mt-6 text-center">
        <Button variant="link" className="h-auto p-0 text-sm" asChild>
          <Link to="/">返回首页</Link>
        </Button>
      </p>
    </div>
  );
}
