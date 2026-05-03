import Content from '@/components/layout/content';
import Header from '@/components/layout/head';

export default function Root(): React.JSX.Element {
  return (
    <div className="flex h-dvh flex-col">
      <Header />
      <Content />
    </div>
  );
}
