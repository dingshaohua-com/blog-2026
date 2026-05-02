import { createRoot } from 'react-dom/client';
import router from './routers';
import '@/assets/styles/golbal.css';
import { RouterProvider } from 'react-router/dom';


const root = createRoot(document.querySelector('#root')!);
root.render(
  <RouterProvider router={router} />,
);
