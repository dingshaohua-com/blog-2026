import { NavLink } from 'react-router';

const NAV_ITEMS = [
  { to: '/', label: '首页', end: true },
  { to: '/blog', label: '博客', end: false },
  { to: '/mood', label: '心情', end: false },
  { to: '/about', label: '关于', end: false },
  { to: '/friends', label: '友人帐', end: false },
] as const;

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background shadow-sm">
      <nav className="mx-auto flex h-14 max-w-5xl items-center gap-1 px-4" aria-label="主导航">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => {
              window.scrollTo(0, 0);
            }}
            className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
