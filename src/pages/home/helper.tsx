import type { ReactNode } from 'react';
import IconFont from '@/components/icon-font';
import { cn } from '@/utils/shadcn/utils';

export const cosUrl = import.meta.env.VITE_COS_URL;

export type AboutLinkItem = { name: string; icon: ReactNode; image: string } | { name: string; icon: ReactNode; url: string };

export const ABOUTLINK: AboutLinkItem[] = [
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

/** ABOUTLINK：Button 基底会把子 SVG 收成 size-4，这里用 ! 拉大 iconfont */
export const aboutLinkIconBtnClass = cn(
  'shrink-0 rounded-lg px-0 text-foreground hover:bg-muted !size-11 text-[32px] leading-none',
  '[&_.anticon]:inline-flex [&_.anticon]:items-center [&_.anticon]:justify-center [&_.anticon]:!text-[32px] [&_.anticon]:!leading-none',
  '[&_svg]:!size-8 [&_svg]:max-h-none [&_svg]:max-w-none',
);

/** `GET /app-info` → `data.content` 里关于页用到的字段 */
export interface AboutContent {
  avatar?: string;
  nickname?: string;
  dec?: string;
}
