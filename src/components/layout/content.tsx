import { Outlet } from 'react-router';

export default function Content() {
  return (
    <div className="flex-1 overflow-auto bg-[#f0f2f5]">
      <div className="p-2 h-full">
        <Outlet />
      </div>
    </div>
  );
}
