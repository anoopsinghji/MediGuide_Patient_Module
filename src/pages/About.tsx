import { useEffect } from 'react';
import { useTitle } from '../hooks';
import { motion } from 'framer-motion';
import { Globe2, Heart, ShieldCheck, Stethoscope, UsersRound, Zap } from 'lucide-react';

const featureCards = [
  {
    icon: Stethoscope,
    title: 'AI Symptom Checker',
    body: 'Our rule-based AI engine analyses your symptoms and instantly identifies the most appropriate medical specialist — no medical knowledge required from you.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Doctors Only',
    body: 'Every doctor on MediGuide is reviewed and approved by our admin team before appearing on the platform. You only see professionals you can trust.',
  },
  {
    icon: Globe2,
    title: 'Multilingual Support',
    body: 'Our platform supports multiple languages so travelers from around the world can navigate their healthcare journey comfortably in their own language.',
  },
];

const team = [
  { name: 'Anoop Singh', role: 'Full Stack Developer', id: '12302545', initials: 'AS' },
  { name: 'Priyansh Bhandari', role: 'Backend Developer', id: '12303682', initials: 'PB' },
  { name: 'Anshu Kumari', role: 'Frontend Developer', id: '12301652', initials: 'AK' },
  { name: 'Sumit Kumar Singh', role: 'AI & Systems Developer', id: '12303106', initials: 'SS' },
];

const values = [
  {
    icon: Heart,
    title: 'Accessibility First',
    body: 'Healthcare should be available to every person, regardless of nationality, language, or familiarity with a local system.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust and Transparency',
    body: 'Every doctor on our platform is verified. Every recommendation is explainable. We never compromise on the reliability of information we show our users.',
  },
  {
    icon: Zap,
    title: 'Speed When It Matters',
    body: 'When someone is sick and scared in an unfamiliar city, every second counts. Our platform is designed to get people to the right help as fast as possible.',
  },
  {
    icon: UsersRound,
    title: 'Human at the Core',
    body: 'Technology is our tool, not our purpose. Our purpose is people — their health, their confidence, and their safety while traveling.',
  },
];

const badges = ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'WebRTC', 'Socket.IO'];

export default function About() {
  useTitle('About Us');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="bg-white pt-20">
      <section className="bg-gradient-to-r from-teal-700 to-teal-800 text-white">
        <div className="mx-auto max-w-screen-xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-4xl"
          >
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Healthcare Navigation, Reimagined for the World&apos;s Travelers
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/80 sm:text-lg">
              MediGuide connects international travelers in India with trusted, verified doctors — in seconds, in your language, wherever you are.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white">
                Verified Doctors
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white">
                Pan-India Coverage
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">Our Mission</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            Making healthcare accessible to every traveler, everywhere in India
          </h2>
          <p className="mt-6 text-base leading-8 text-gray-600 sm:text-lg">
            MediGuide was born from a simple observation: when people travel, they bring everything except their doctor. India welcomes millions of international visitors every year for tourism, business, education, and medical travel. But when a traveler falls ill far from home — facing an unfamiliar healthcare system, an unknown language, and no trusted contacts — the experience can be overwhelming and dangerous. MediGuide was built to change that. We give every traveler a trusted, intelligent companion for their healthcare needs in India.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">What We Do</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need, in one place
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {featureCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
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

      <section className="bg-white py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">Our Technology</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Built on a modern, reliable stack</h2>
          </div>
          <p className="mt-6 max-w-4xl text-base leading-8 text-gray-600 sm:text-lg">
            MediGuide is built on the MERN stack — MongoDB, Express.js, React.js, and Node.js — using REST APIs for seamless frontend-backend communication. Real-time video consultations are powered by WebRTC. In-app messaging uses Socket.IO. Our AI Symptom Checker employs a structured rule-based logic engine that maps symptom combinations to appropriate doctor specialisations reliably and transparently.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {badges.map((badge) => (
              <span key={badge} className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">Our Story</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Started at LPU, Built for the World</h2>
            <p className="mt-6 text-base leading-8 text-gray-600 sm:text-lg">
              MediGuide was developed as a capstone project by four BCA students at Lovely Professional University, Punjab, between February and May 2026, under the supervision of Ms. Rohini. What began as an academic project quickly became something more — a genuinely useful platform we believe can make a real difference for travelers who need medical help in India.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {team.map((member) => (
              <motion.article
                key={member.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-lg font-semibold text-white">
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    <span className="mt-1 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-100">
                      {member.role}
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600">Enrollment No. {member.id}</p>
              </motion.article>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-teal-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Supervisor</p>
            <p className="mt-3 text-lg font-semibold text-gray-900">Ms. Rohini</p>
            <p className="mt-1 text-sm leading-6 text-gray-600">UID: 33939 · Associate Professor, School of Computer Applications, Lovely Professional University</p>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">Our Values</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">The principles that guide us</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <motion.article
                  key={value.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.3 }}
                  className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-gray-900">{value.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600">{value.body}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
