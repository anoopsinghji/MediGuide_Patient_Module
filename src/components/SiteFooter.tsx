import { Link } from 'react-router-dom';
import { HeartHandshake, ShieldCheck } from 'lucide-react';

const legalLinks = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
  { to: '/help', label: 'Help Center' },
];

const companyLinks = [
  { to: '/about', label: 'About' },
  { to: '/partner', label: 'Partner With Us' },
  { to: '/careers', label: 'Careers' },
  { to: '/contact', label: 'Contact' },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto max-w-screen-xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-300 ring-1 ring-teal-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-semibold text-white">MediGuide</p>
                <p className="text-sm text-slate-400">Healthcare navigation for travelers in India</p>
              </div>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-400">
              MediGuide helps international travelers discover verified doctors, understand their care options, and book consultations with confidence across India.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200">
              <HeartHandshake className="h-4 w-4" />
              Trusted care, clear guidance, multilingual support
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-100">Legal</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-400">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-100">Company</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-400">
              {companyLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 text-sm text-slate-500">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 MediGuide. Built for clarity, safety, and trust.</p>
            <p>Lovely Professional University, Punjab, India</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
