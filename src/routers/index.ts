import { lazy } from 'react';
import { createHashRouter } from 'react-router';
import Root from '@/components/root';

const router = createHashRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: lazy(() => import('@/pages/home')) },
      { path: '/blog', Component: lazy(() => import('@/pages/blog')) },
      { path: '/mood', Component: lazy(() => import('@/pages/mood')) },
      { path: '/about', Component: lazy(() => import('@/pages/about')) },
      { path: '/friends', Component: lazy(() => import('@/pages/friends')) },
    ],
  },
]);

export default router;
