import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { ReactNode } from 'react';
import 'dayjs/locale/zh-cn';
import IconFont from '@/components/icon-font';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

/**
 * 自 2018-06 起的相对时长（不含「前/后」），与 blog-2022 me 页 `moment('2018-6').fromNow(true)` 等价。
 * 例如：6 年。
 */
const SINCE_2018_06 = '2018-06-01';
export const yearsSince201806 = (): string => dayjs(SINCE_2018_06).fromNow(true);

export type AboutSection = {
  id: string;
  /** 标题左侧的 IconFont 类型，对齐 blog-2022 me 页 */
  icon: ReactNode;
  title: string;
  rows: { label: string; content: ReactNode }[];
};

/** 关于花贝 + 关于本站，两组信息列表 */
export const buildAboutSections = (): AboutSection[] => {
  const since = yearsSince201806();
  return [
    {
      id: 'me',
      icon: <IconFont type="h-ghost" />,
      title: '关于花贝',
      rows: [
        { label: '关于名字', content: '花贝是家里小猫咪的名字，借来用用～' },
        { label: '关于位置', content: `${since}北漂生活，现在只想躺平` },
        { label: '关于工作', content: `从事前端开发工程师${since}，非专业对口` },
      ],
    },
    {
      id: 'site',
      icon: <IconFont type="h-mushroom" />,
      title: '关于本站',
      rows: [
        {
          label: '关于前端',
          content: (
            <>
              React 19 + React Router v7 + Tailwind v4 + shadcn/ui，全部由自己搭建，
              <a href="https://gitee.com/han96/blog-2022" target="_blank" rel="noreferrer noopener" className="font-medium underline-offset-2 hover:underline">
                点击查看源码
              </a>
            </>
          ),
        },
        { label: '关于后端', content: 'Go + GORM + MySQL，全部由男盆友搭建' },
        { label: '关于服务', content: '腾讯云服务器 + 腾讯云 COS + 腾讯云域名 + 阿里云数据库' },
      ],
    },
  ];
};
