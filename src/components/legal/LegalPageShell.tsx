import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { BookOpenText, ChevronRight, ScrollText } from 'lucide-react';

type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

type LegalPageShellProps = {
  title: string;
  subtitle: string;
  metaLabel: string;
  metaValue: string;
  sections: LegalSection[];
  sidebarTitle?: string;
  sidebarSummary?: string;
  topNotice?: ReactNode;
};

export default function LegalPageShell({
  title,
  subtitle,
  metaLabel,
  metaValue,
  sections,
  sidebarTitle = 'Table of Contents',
  sidebarSummary = 'Jump to any section below.',
  topNotice,
}: LegalPageShellProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0.1, 0.2, 0.3, 0.4],
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <main className="bg-white pt-20">
      <div className="mx-auto max-w-screen-xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-3xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-teal-700">
                <ScrollText className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.24em]">{sidebarTitle}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600">{sidebarSummary}</p>
              <nav className="mt-6 space-y-1">
                {sections.map((section) => {
                  const isActive = activeSection === section.id;
                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-teal-50 font-semibold text-teal-700 ring-1 ring-teal-100'
                          : 'text-gray-600 hover:bg-white hover:text-gray-900'
                      }`}
                    >
                      <span className="pr-3">{section.title}</span>
                      <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'translate-x-0.5 text-teal-600' : 'text-gray-400'}`} />
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

          <div className="space-y-8">
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="rounded-3xl border-t-4 border-teal-600 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] ring-1 ring-gray-200 sm:p-8"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-teal-700">
                <BookOpenText className="h-4 w-4" />
                {metaLabel}
              </div>
              <div className="mt-4 flex flex-col gap-4 border-b border-gray-200 pb-6">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">{title}</h1>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-gray-600 sm:text-lg">{subtitle}</p>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 ring-1 ring-teal-100">
                  <span>{metaValue}</span>
                </div>
              </div>

              {topNotice ? <div className="mt-6">{topNotice}</div> : null}
            </motion.section>

            <div className="space-y-6">
              {sections.map((section, index) => (
                <motion.section
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.35, delay: index * 0.03 }}
                  className="scroll-mt-28 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-900">{section.title}</h2>
                  </div>
                  <div className="space-y-4 text-sm leading-7 text-gray-600 sm:text-base">{section.content}</div>
                </motion.section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
