import { BLOG_H_COLOR } from '@/pages/blog/helper';
import { buildAboutSections } from './helper';

export default function About() {
  const sections = buildAboutSections();

  return (
    <div className="mx-auto box-border h-full w-full max-w-[900px] overflow-y-auto px-4 py-8 lg:py-10">
      {sections.map((section) => (
        <section key={section.id} className="mb-10 text-center last:mb-0 lg:mb-[60px]">
          <h2
            className="mb-5 inline-flex items-center gap-2 rounded-r-xl border py-1 pr-7 pl-2.5 text-xl leading-snug font-semibold text-white shadow-sm"
            style={{
              backgroundColor: BLOG_H_COLOR,
              borderColor: BLOG_H_COLOR,
            }}
          >
            <span className="inline-flex items-center text-2xl leading-none [&_svg]:size-5">{section.icon}</span>
            {section.title}
          </h2>
          <div className="space-y-1">
            {section.rows.map((row) => (
              <div key={row.label} className="flex flex-col items-center gap-1 px-2 py-2.5 text-[15px] sm:flex-row sm:justify-center sm:gap-5">
                <span className="shrink-0 text-base font-medium" style={{ color: BLOG_H_COLOR }}>
                  {row.label}
                </span>
                <span className="text-foreground/90 leading-relaxed">{row.content}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
