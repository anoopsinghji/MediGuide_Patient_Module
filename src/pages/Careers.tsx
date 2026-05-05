import { useEffect, useState, type FormEvent } from 'react';
import { useTitle } from '../hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Lightbulb, Upload, Users, X, Zap } from 'lucide-react';

type Role = {
  title: string;
  department: string;
  departmentTone: string;
  type: string;
  location: string;
  description: string;
};

type ApplicationForm = {
  fullName: string;
  email: string;
  role: string;
  coverNote: string;
};

const cultureCards = [
  {
    icon: Lightbulb,
    title: 'Ownership Mindset',
    body: 'We trust our team to take responsibility and make thoughtful decisions.',
  },
  {
    icon: Users,
    title: 'Diverse Perspectives',
    body: 'The best solutions come from teams with varied backgrounds and experiences.',
  },
  {
    icon: Heart,
    title: 'Mission Driven',
    body: 'Every line of code and every design decision is grounded in our mission to help people.',
  },
  {
    icon: Zap,
    title: 'Move with Purpose',
    body: 'We work fast, learn faster, and always keep the user&apos;s wellbeing at the center.',
  },
];

const roles: Role[] = [
  {
    title: 'Full-Stack Developer',
    department: 'Engineering',
    departmentTone: 'blue',
    type: 'Full-time',
    location: 'Remote / Phagwara',
    description:
      'Build and maintain the MediGuide patient, doctor, and admin portals using the MERN stack. Collaborate on API design, database architecture, and performance optimisation.',
  },
  {
    title: 'Mobile App Developer',
    department: 'Engineering',
    departmentTone: 'blue',
    type: 'Full-time',
    location: 'Remote',
    description:
      'Develop and launch the MediGuide mobile application for Android and iOS. Implement GPS-based location, push notifications, and a seamless appointment booking experience.',
  },
  {
    title: 'UX Designer',
    department: 'Design',
    departmentTone: 'purple',
    type: 'Full-time / Intern',
    location: 'Remote',
    description:
      'Design intuitive, accessible, and multilingual interfaces for users who may be stressed or unwell. Conduct user research and create high-fidelity prototypes.',
  },
  {
    title: 'AI / ML Engineer',
    department: 'Engineering',
    departmentTone: 'blue',
    type: 'Intern',
    location: 'Remote',
    description:
      'Enhance the AI Symptom Checker by transitioning from rule-based logic to machine learning models trained on medical symptom datasets. Work on NLP for multilingual symptom input.',
  },
  {
    title: 'Business Development Executive',
    department: 'Business',
    departmentTone: 'green',
    type: 'Full-time',
    location: 'Phagwara / Remote',
    description:
      'Grow MediGuide&apos;s network of verified medical professionals and institutional partners. Manage relationships with hospitals, insurance providers, and travel companies across India.',
  },
];

const departmentClass: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700 ring-blue-100',
  purple: 'bg-purple-50 text-purple-700 ring-purple-100',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
};

export default function Careers() {
  useTitle('Careers');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [application, setApplication] = useState<ApplicationForm>({
    fullName: '',
    email: '',
    role: '',
    coverNote: '',
  });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (selectedRole) {
      setApplication((prev) => ({ ...prev, role: selectedRole.title }));
      setSuccess('');
    }
  }, [selectedRole]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess('Application ready to submit. This is a UI-only flow for now.');
  };

  const scrollToRoles = () => {
    document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="bg-white pt-20">
      <section className="bg-gradient-to-r from-teal-700 to-teal-800 text-white">
        <div className="mx-auto max-w-screen-xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Build Healthcare Tech That Matters</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/80 sm:text-lg">
              Join the team behind MediGuide and help make quality healthcare accessible to every international traveler in India.
            </p>
            <button
              type="button"
              onClick={scrollToRoles}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
            >
              View Open Roles
            </button>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">Our Culture</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">A team that builds with purpose</h2>
          <p className="mt-6 max-w-4xl text-base leading-8 text-gray-600 sm:text-lg">
            We are not a large corporation with a rigid hierarchy — we are a small, driven team that values initiative, creativity, and a genuine desire to make a positive impact. We believe the best ideas come from diverse perspectives and we actively seek team members who bring different backgrounds and ways of thinking. Flexibility and ownership are core to how we work.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {cultureCards.map((card) => {
              const Icon = card.icon;
              return (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.3 }}
                  className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-gray-900">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600">{card.body}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="roles" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">Open Roles</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Current Opportunities</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {roles.map((role) => (
              <article key={role.title} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{role.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-gray-600">{role.description}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${departmentClass[role.departmentTone]}`}>
                    {role.department}
                  </span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-gray-600">
                  <span className="rounded-full bg-gray-100 px-3 py-1">{role.type}</span>
                  <span className="rounded-full bg-gray-100 px-3 py-1">{role.location}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  Apply
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border-l-4 border-teal-600 bg-gray-50 p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">Open Application</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Don&apos;t see your role?</h2>
            <p className="mt-5 max-w-4xl text-base leading-8 text-gray-600 sm:text-lg">
              We are always interested in hearing from talented people who share our mission. If you believe you can contribute to MediGuide in a way not listed above, send us your CV and a short note about yourself and what you would like to build with us.
            </p>
            <a href="mailto:careers@mediguide.in" className="mt-6 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800">
              careers@mediguide.in
            </a>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedRole ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8"
            onClick={() => setSelectedRole(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="absolute right-4 top-4 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>

              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">Application</p>
              <h3 className="mt-4 pr-10 text-2xl font-semibold tracking-tight text-gray-900">Apply for {selectedRole.title}</h3>
              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Full Name</span>
                  <input
                    value={application.fullName}
                    onChange={(event) => setApplication((prev) => ({ ...prev, fullName: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Email</span>
                  <input
                    type="email"
                    value={application.email}
                    onChange={(event) => setApplication((prev) => ({ ...prev, email: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Role</span>
                  <input
                    value={selectedRole.title}
                    readOnly
                    className="mt-2 w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Resume Upload</span>
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-dashed border-gray-300 px-4 py-4 text-sm text-gray-600">
                    <Upload className="h-5 w-5 text-teal-600" />
                    <span>Upload PDF, DOCX, or image file</span>
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Cover Note</span>
                  <textarea
                    rows={5}
                    value={application.coverNote}
                    onChange={(event) => setApplication((prev) => ({ ...prev, coverNote: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none"
                  />
                </label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button type="submit" className="inline-flex items-center justify-center rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
                    Submit Application
                  </button>
                  {success ? <p className="text-sm font-medium text-emerald-600">{success}</p> : null}
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
