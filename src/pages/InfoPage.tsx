import { Link, useParams } from 'react-router-dom';
import { useTitle } from '../hooks';
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, Mail, Phone, MapPin, Clock3, FileText, Globe2, FileQuestion, Building2, BriefcaseBusiness, HeartPulse, BadgeCheck, Rocket } from 'lucide-react';

type SectionBlock = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type Stat = {
  label: string;
  value: string;
  note: string;
};

type InfoPageConfig = {
  eyebrow: string;
  title: string;
  subtitle: string;
  intro: string;
  stats: Stat[];
  sections: SectionBlock[];
  sidebarTitle: string;
  sidebarItems: Array<{ label: string; value: string }>;
  footerNote: string;
};

const infoPages: Record<string, InfoPageConfig> = {
  'company/about': {
    eyebrow: 'Company',
    title: 'About MediGuide',
    subtitle: 'AI-powered healthcare navigation for international travelers in India.',
    intro:
      'MediGuide is a student-led healthcare technology initiative created to help international travelers find trusted doctors, understand their options, and access care with confidence.',
    stats: [
      { label: 'Founded', value: '2026', note: 'Built between February and May 2026' },
      { label: 'Core Platform', value: 'MERN', note: 'React, Node.js, Express, MongoDB' },
      { label: 'Coverage', value: 'India', note: 'Designed for travelers across major cities' },
    ],
    sections: [
      {
        title: 'Who We Are',
        paragraphs: [
          'MediGuide was developed by Bachelor of Computer Applications students at Lovely Professional University, Punjab, under the supervision of Ms. Rohini, Associate Professor at the School of Computer Applications.',
        ],
      },
      {
        title: 'Our Mission',
        paragraphs: [
          'Our mission is to make quality healthcare accessible to every international traveler in India, regardless of language, city, or time of day.',
        ],
      },
      {
        title: 'What We Do',
        paragraphs: [
          'We combine an AI symptom checker, verified doctor discovery, appointment booking, video consultation, in-app chat, and prescription history into one secure journey.',
        ],
      },
      {
        title: 'Our Values',
        paragraphs: [
          'We believe healthcare access should be simple, trustworthy, multilingual, and built around real-world traveler needs.',
        ],
      },
    ],
    sidebarTitle: 'Platform Snapshot',
    sidebarItems: [
      { label: 'Trust', value: 'Verified doctor network' },
      { label: 'Support', value: 'Multilingual traveler experience' },
      { label: 'Security', value: 'Privacy-first account handling' },
      { label: 'Care Flow', value: 'Symptom to consultation to follow-up' },
    ],
    footerNote: 'MediGuide is built to reduce uncertainty and guide travelers toward trusted care.',
  },
  'company/partner-with-us': {
    eyebrow: 'Company',
    title: 'Partner With MediGuide',
    subtitle: 'A verified healthcare platform connecting international travelers with trusted providers across India.',
    intro:
      'MediGuide gives healthcare providers and partners a professional channel to reach international travelers who are actively looking for trusted medical support.',
    stats: [
      { label: 'Doctors', value: 'Verified', note: 'Admin review before listing' },
      { label: 'Institutions', value: 'Clinics + Hospitals', note: 'Network expansion ready' },
      { label: 'Partners', value: 'Travel + Insurance', note: 'Integration-friendly positioning' },
    ],
    sections: [
      {
        title: 'Why Partner With MediGuide?',
        paragraphs: [
          'International travelers are a high-intent patient segment. MediGuide helps your practice or institution become visible to users who need care quickly and want clarity before booking.',
        ],
      },
      {
        title: 'For Doctors',
        paragraphs: [
          'Licensed doctors can use the Doctor Portal to manage profiles, availability, and appointments while being reviewed by our admin team for platform verification.',
        ],
      },
      {
        title: 'For Hospitals and Clinics',
        paragraphs: [
          'Healthcare institutions can onboard multiple doctors under one clinic profile and gain visibility among travelers seeking multi-specialty or location-based care.',
        ],
      },
      {
        title: 'For Insurance and Travel Partners',
        paragraphs: [
          'We welcome partnerships with insurers, travel providers, corporate travel teams, and tourism organizations that want to add trusted healthcare navigation to their services.',
        ],
      },
    ],
    sidebarTitle: 'Partnership Contact',
    sidebarItems: [
      { label: 'Doctor onboarding', value: 'Doctor Portal verification' },
      { label: 'Institutional growth', value: 'Clinic and hospital profiles' },
      { label: 'Channel partners', value: 'Insurance and travel integrations' },
      { label: 'Email', value: 'partners@mediguide.in' },
    ],
    footerNote: 'To discuss a partnership, contact partners@mediguide.in.',
  },
  'company/careers': {
    eyebrow: 'Company',
    title: 'Careers at MediGuide',
    subtitle: 'Join a mission-driven team building practical healthcare technology for travelers.',
    intro:
      'MediGuide is an early-stage, student-founded product team looking for people who care about healthcare access, product quality, and meaningful digital experiences.',
    stats: [
      { label: 'Team Style', value: 'Collaborative', note: 'Small, driven, and flexible' },
      { label: 'Focus Areas', value: 'Tech + Product', note: 'Engineering, UX, operations, partnerships' },
      { label: 'Application', value: 'Open', note: 'Send a CV and short note' },
    ],
    sections: [
      {
        title: 'Join Us',
        paragraphs: [
          'We value initiative, thoughtful execution, and a genuine desire to solve real problems for real users.',
        ],
      },
      {
        title: 'Areas We Are Looking to Grow',
        bullets: [
          'Full-stack developers with MERN experience',
          'Mobile app developers for Android and iOS',
          'AI and machine learning engineers',
          'UX designers and product managers',
          'Partnership and business development professionals',
        ],
        paragraphs: [
          'We are especially interested in people who can help us scale securely, improve usability, and support multilingual travelers.',
        ],
      },
      {
        title: 'How to Apply',
        paragraphs: [
          'There is no formal job board yet. If you are interested in contributing, send your CV and a short note about yourself to careers@mediguide.in.',
        ],
      },
    ],
    sidebarTitle: 'Work With Us',
    sidebarItems: [
      { label: 'Email', value: 'careers@mediguide.in' },
      { label: 'Culture', value: 'Honest, empathetic, quality-focused' },
      { label: 'Work style', value: 'Ownership and flexibility' },
      { label: 'Project stage', value: 'Early-stage startup' },
    ],
    footerNote: 'We review every application and respond when there is a potential fit.',
  },
  'company/contact': {
    eyebrow: 'Company',
    title: 'Contact MediGuide',
    subtitle: 'Reach the right team for patient support, doctor support, partnerships, careers, or academic inquiries.',
    intro:
      'We are here to help with questions about the platform, booking, video consultations, profile verification, and collaboration opportunities.',
    stats: [
      { label: 'General Inquiries', value: 'hello@', note: 'hello@mediguide.in' },
      { label: 'Response Time', value: '24-48h', note: 'Business days for general support' },
      { label: 'Emergency', value: '112 / 108', note: 'Use local emergency services immediately' },
    ],
    sections: [
      {
        title: 'General Inquiries',
        paragraphs: ['hello@mediguide.in'],
      },
      {
        title: 'Patient Support',
        paragraphs: ['support@mediguide.in'],
      },
      {
        title: 'Doctor and Clinic Support',
        paragraphs: ['doctors@mediguide.in'],
      },
      {
        title: 'Partnerships and Careers',
        paragraphs: ['partners@mediguide.in', 'careers@mediguide.in'],
      },
    ],
    sidebarTitle: 'Support Notes',
    sidebarItems: [
      { label: 'Academic inquiries', value: 'Lovely Professional University, Phagwara, Punjab' },
      { label: 'Faculty supervisor', value: 'Ms. Rohini, School of Computer Applications' },
      { label: 'Emergency help', value: 'Dial 112 for emergencies, 108 for ambulance services' },
      { label: 'Website', value: 'www.mediguide.in' },
    ],
    footerNote: 'Do not use the platform for emergencies. Contact local emergency services immediately.',
  },
  'legal/privacy': {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    subtitle: 'How MediGuide collects, uses, protects, and shares personal information.',
    intro:
      'This policy explains what data we collect, how we use it, how we protect it, and the rights available to users who interact with the platform.',
    stats: [
      { label: 'Last Updated', value: 'May 2026', note: 'Policy reviewed for the current release' },
      { label: 'Retention', value: '30 Days', note: 'After deletion, unless law requires otherwise' },
      { label: 'Security', value: 'Encrypted', note: 'HTTPS and password hashing in place' },
    ],
    sections: [
      {
        title: 'Information We Collect',
        paragraphs: [
          'We collect account, booking, and usage data needed to provide the service, including profile information, symptoms, appointment details, and device or location information when permitted.',
        ],
      },
      {
        title: 'How We Use It',
        paragraphs: [
          'We use data to manage accounts, recommend doctors, support bookings and consultations, improve the platform, and meet legal obligations.',
        ],
      },
      {
        title: 'Data Protection and Rights',
        paragraphs: [
          'We use industry-standard safeguards and give users the right to access, correct, erase, or restrict certain processing of their personal data.',
        ],
      },
    ],
    sidebarTitle: 'Privacy Summary',
    sidebarItems: [
      { label: 'Advertising', value: 'We do not use health data for ads' },
      { label: 'Sharing', value: 'Need-to-know basis only' },
      { label: 'Security', value: 'Role-based access controls' },
      { label: 'Contact', value: 'Use the support team for requests' },
    ],
    footerNote: 'For privacy requests, contact the support team through the Contact page.',
  },
  'legal/terms': {
    eyebrow: 'Legal',
    title: 'Terms of Service',
    subtitle: 'The rules that govern your use of the MediGuide platform and services.',
    intro:
      'These terms explain the nature of the service, user responsibilities, doctor verification, appointment rules, and limitations of liability.',
    stats: [
      { label: 'Eligibility', value: '18+', note: 'Users must be at least 18 years old' },
      { label: 'Role', value: 'Navigation', note: 'MediGuide is not a medical provider' },
      { label: 'Updates', value: 'Periodic', note: 'Continued use means acceptance of updates' },
    ],
    sections: [
      {
        title: 'Nature of the Service',
        paragraphs: [
          'MediGuide helps travelers identify doctors, book consultations, and communicate securely, but does not diagnose, prescribe, or act as a healthcare provider.',
        ],
      },
      {
        title: 'User Responsibilities',
        paragraphs: [
          'Users must provide accurate information, protect account credentials, and avoid unlawful or harmful use of the platform.',
        ],
      },
      {
        title: 'Liability and Changes',
        paragraphs: [
          'MediGuide is not liable for the conduct of medical professionals or for technical interruptions, and we may update or suspend the platform as needed.',
        ],
      },
    ],
    sidebarTitle: 'Terms Summary',
    sidebarItems: [
      { label: 'Booking', value: 'Direct agreement is with the doctor' },
      { label: 'Verification', value: 'Doctors are admin-reviewed' },
      { label: 'Advice', value: 'Always consult a licensed professional' },
      { label: 'Liability', value: 'Limited to the fullest extent permitted' },
    ],
    footerNote: 'Please read these terms before using the platform.',
  },
  'legal/help-center': {
    eyebrow: 'Legal',
    title: 'Help Center',
    subtitle: 'Step-by-step guidance for using MediGuide confidently.',
    intro:
      'This help center covers getting started, finding doctors, AI symptom checking, booking, video consultations, prescriptions, language switching, and support.',
    stats: [
      { label: 'Support', value: '24h', note: 'Business-day response target for help requests' },
      { label: 'Languages', value: 'Multilingual', note: 'Built for international travelers' },
      { label: 'Emergency', value: '112', note: 'Use local emergency services for urgent situations' },
    ],
    sections: [
      {
        title: 'Getting Started',
        paragraphs: [
          'Create an account, verify your email, and complete your profile to unlock the full experience.',
        ],
      },
      {
        title: 'Using the Platform',
        bullets: [
          'Use the Symptom Checker to get specialist guidance',
          'Search and book verified doctors by city, specialty, and language',
          'Join secure video consultations from confirmed appointments',
          'Review prescriptions and consultation history in your account',
        ],
        paragraphs: [
          'The platform is designed to simplify healthcare navigation, but it is not a diagnostic tool or emergency service.',
        ],
      },
      {
        title: 'Contacting Support',
        paragraphs: ['For help not covered here, contact support@mediguide.in. For emergencies, dial 112.'],
      },
    ],
    sidebarTitle: 'Help Resources',
    sidebarItems: [
      { label: 'Patient support', value: 'support@mediguide.in' },
      { label: 'Doctor support', value: 'doctors@mediguide.in' },
      { label: 'Partnerships', value: 'partners@mediguide.in' },
      { label: 'Careers', value: 'careers@mediguide.in' },
    ],
    footerNote: 'For life-threatening situations, contact emergency services first.',
  },
};

function formatPageKey(section?: string, page?: string) {
  return `${section || ''}/${page || ''}`.replace(/^\//, '');
}

export default function InfoPage() {
  const { section, page } = useParams();
  const pageKey = formatPageKey(section, page);
  const config = infoPages[pageKey] || infoPages['legal/help-center'];

  useTitle(config.title);

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/home" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white shadow-2xl">
          <div className="absolute inset-0 opacity-25 pointer-events-none">
            <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-cyan-400 blur-3xl" />
            <div className="absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-amber-400 blur-3xl" />
          </div>

          <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] p-8 md:p-10 lg:p-12">
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-cyan-200 mb-4">{config.eyebrow}</p>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight max-w-3xl">{config.title}</h1>
              <p className="mt-4 text-lg text-slate-200 max-w-2xl">{config.subtitle}</p>
              <p className="mt-6 text-slate-300 max-w-3xl leading-7">{config.intro}</p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {config.stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 shadow-[0_8px_30px_rgba(0,0,0,0.14)]">
                    <div className="text-2xl font-bold text-cyan-200">{stat.value}</div>
                    <div className="text-sm font-semibold text-white mt-1">{stat.label}</div>
                    <div className="text-xs text-slate-300 mt-1">{stat.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-3xl border border-white/10 bg-black/20 backdrop-blur-xl p-6 md:p-7">
              <div className="flex items-center gap-2 text-cyan-200 text-sm font-semibold mb-5">
                <ShieldCheck className="w-4 h-4" /> Trusted platform summary
              </div>
              <div className="space-y-4">
                {config.sidebarItems.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-300">{item.label}</div>
                    <div className="mt-1 text-sm text-white/90 leading-6">{item.value}</div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
          <section className="space-y-6">
            {config.sections.map((block) => (
              <article key={block.title} className="rounded-3xl border border-slate-200 bg-white p-6 md:p-7 shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-teal-800 font-semibold mb-4">
                  <Sparkles className="w-4 h-4" /> {block.title}
                </div>
                <div className="space-y-4 text-slate-700 leading-7">
                  {block.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {block.bullets ? (
                    <ul className="grid gap-3 pt-2">
                      {block.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-slate-700 border border-slate-100">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 text-teal-600 flex-shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            ))}
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Contact</h2>
              <div className="space-y-4 text-sm text-slate-700">
                <div className="flex gap-3"><Mail className="h-4 w-4 text-teal-600 mt-1" /> hello@mediguide.in</div>
                <div className="flex gap-3"><Phone className="h-4 w-4 text-teal-600 mt-1" /> support@mediguide.in</div>
                <div className="flex gap-3"><MapPin className="h-4 w-4 text-teal-600 mt-1" /> Lovely Professional University, Punjab</div>
                <div className="flex gap-3"><Clock3 className="h-4 w-4 text-teal-600 mt-1" /> Business-day support response target</div>
                <div className="flex gap-3"><Globe2 className="h-4 w-4 text-teal-600 mt-1" /> www.mediguide.in</div>
              </div>
            </div>

            <div className="rounded-3xl border border-teal-200 bg-teal-50 p-6 shadow-sm">
              <div className="flex items-center gap-2 font-semibold text-teal-800 mb-3">
                <FileText className="w-4 h-4" /> Important Note
              </div>
              <p className="text-sm text-teal-900/90 leading-7">{config.footerNote}</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}