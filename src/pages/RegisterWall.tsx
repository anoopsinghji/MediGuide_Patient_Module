import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTitle } from '../hooks';
import { useAuthStore } from '../store/authStore';
import { CheckCircle2, Sparkles } from 'lucide-react';

const featureTitles: Record<string, string> = {
  booking: 'Book Appointments Instantly',
  chat: 'Start Secure Doctor Chat',
  prescriptions: 'View and Download Prescriptions',
  'secure-member-feature': 'Access Member-Only Healthcare Tools',
  'member-feature': 'Unlock Full MediGuide Experience',
};

const trustRibbon = [
  'Hospital-verified specialists',
  'Transparent fees before booking',
  'Multilingual support for travelers',
  'Secure consultations and records',
  'Fast booking in top Indian cities',
];

const testimonials = [
  {
    name: 'Emma, UK',
    quote: 'I booked a verified doctor in under 10 minutes while traveling in Bangalore.',
  },
  {
    name: 'Arjun, UAE',
    quote: 'The follow-up chat and prescription access felt premium and stress-free.',
  },
  {
    name: 'Sofia, Spain',
    quote: 'Clear pricing and trusted doctors made the whole process feel safe.',
  },
];

export default function RegisterWall() {
  useTitle('Join MediGuide');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [searchParams] = useSearchParams();

  const feature = searchParams.get('feature') || 'member-feature';
  const returnTo = searchParams.get('returnTo') || '/home';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnTo, { replace: true });
    }
  }, [isAuthenticated, navigate, returnTo]);

  const title = featureTitles[feature] || featureTitles['member-feature'];
  const encodedReturn = encodeURIComponent(returnTo);
  const registerTarget = `/register?returnTo=${encodedReturn}`;
  const loginTarget = `/login?returnTo=${encodedReturn}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl" />

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white"
        >
          ← Continue Browsing
        </button>

        <div className="trust-ribbon mb-8">
          <div className="trust-ribbon-track">
            {[...trustRibbon, ...trustRibbon].map((item, index) => (
              <span key={`${item}-${index}`} className="trust-ribbon-item">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" strokeWidth={2.1} />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <section className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
            <p className="text-xs tracking-[0.25em] uppercase text-cyan-200 mb-4">MediGuide Premium Access</p>
            <h1 className="text-4xl font-bold leading-tight mb-4">{title}</h1>
            <p className="text-slate-300 text-lg mb-8">
              Explore all doctor details for free. Create your account to unlock booking, chat, prescriptions,
              and continuity of care in one secure portal.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="text-2xl font-bold text-amber-300">200+</div>
                <div className="text-xs text-slate-300">Verified Doctors</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="text-2xl font-bold text-cyan-300">15+</div>
                <div className="text-xs text-slate-300">Cities Covered</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="text-2xl font-bold text-emerald-300">24/7</div>
                <div className="text-xs text-slate-300">AI Assistance</div>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-200">
              <p className="flex items-start gap-2.5"><CheckCircle2 className="w-4.5 h-4.5 text-emerald-300 mt-0.5" strokeWidth={2.2} />Instant appointment booking with verified doctors</p>
              <p className="flex items-start gap-2.5"><CheckCircle2 className="w-4.5 h-4.5 text-emerald-300 mt-0.5" strokeWidth={2.2} />Secure patient-doctor chat after confirmation</p>
              <p className="flex items-start gap-2.5"><CheckCircle2 className="w-4.5 h-4.5 text-emerald-300 mt-0.5" strokeWidth={2.2} />Digital prescriptions with PDF access</p>
              <p className="flex items-start gap-2.5"><CheckCircle2 className="w-4.5 h-4.5 text-emerald-300 mt-0.5" strokeWidth={2.2} />Follow-up continuity across your travel journey</p>
            </div>
          </section>

          <section className="rounded-3xl border border-amber-300/20 bg-gradient-to-b from-amber-200/15 to-orange-300/10 p-8 shadow-2xl">
            <p className="text-xs tracking-[0.2em] uppercase text-amber-200 mb-4">Get Started</p>
            <h2 className="text-3xl font-bold mb-2">Create your account</h2>
            <p className="text-slate-200 mb-8">
              Join in under 2 minutes and continue exactly where you left off.
            </p>

            <div className="space-y-4">
              <Link
                to={registerTarget}
                className="block w-full rounded-xl bg-amber-400 text-slate-900 font-bold text-center py-3 hover:bg-amber-300 transition"
              >
                Create Free Account
              </Link>
              <Link
                to={loginTarget}
                className="block w-full rounded-xl border border-slate-200/40 text-white font-semibold text-center py-3 hover:bg-white/10 transition"
              >
                I Already Have an Account
              </Link>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
              By continuing, you unlock secure medical interactions while preserving your browsing access to public content.
            </div>
          </section>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-xl hover:-translate-y-1 transition"
            >
              <p className="text-sm text-slate-200 leading-relaxed">"{item.quote}"</p>
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-amber-200">{item.name}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
