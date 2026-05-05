import { useEffect, useState } from 'react';
import { useTitle } from '../hooks';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  FileText,
  Globe,
  Search,
  Settings2,
  Stethoscope,
  TriangleAlert,
  UserPlus,
  Video,
} from 'lucide-react';

type FaqItem = {
  question: string;
  answer: string;
};

type HelpCategory = {
  icon: typeof UserPlus;
  title: string;
  description: string;
  faqs: FaqItem[];
};

const categories: HelpCategory[] = [
  {
    icon: UserPlus,
    title: 'Getting Started',
    description: 'Account creation, registration steps, and login help',
    faqs: [
      {
        question: 'How do I create a MediGuide account?',
        answer:
          'Visit our website and click Create Account. Complete the five-step registration: enter your name, email, password, preferred language, nationality, and optional health details. Verify your email and log in.',
      },
      {
        question: 'Can I use MediGuide without creating an account?',
        answer:
          'You can browse the home page and view doctor listings. However, booking appointments, using the Symptom Checker, and accessing chat require a registered account.',
      },
    ],
  },
  {
    icon: Stethoscope,
    title: 'AI Symptom Checker',
    description: 'How to use the symptom analysis tool and understand results',
    faqs: [
      {
        question: 'How does the AI Symptom Checker work?',
        answer:
          'Navigate to Symptom Checker from the top menu. Type your symptoms in plain language or select from the common symptoms list. Optionally select your city. Click Analyze with AI to see urgency level, the recommended specialist type, and nearby verified doctors.',
      },
      {
        question: 'Is the Symptom Checker a medical diagnosis?',
        answer:
          'No. It is a navigation aid only and must not be used as a substitute for professional medical advice. Always consult a licensed doctor for any health concern.',
      },
    ],
  },
  {
    icon: Search,
    title: 'Finding Doctors',
    description: 'Search filters, doctor profiles, and how to choose the right doctor',
    faqs: [
      {
        question: 'How do I search for a specific type of doctor?',
        answer:
          'Go to Find Doctors from the navigation menu. Use filters to narrow results by city, specialty, language spoken, minimum rating, and availability. Results show only verified doctors.',
      },
      {
        question: 'What does the Verified badge mean?',
        answer:
          'A Verified badge means the doctor&apos;s profile has been reviewed and approved by the MediGuide admin team. It does not constitute medical certification.',
      },
    ],
  },
  {
    icon: CalendarDays,
    title: 'Booking Appointments',
    description: 'How to book, reschedule, and cancel appointments',
    faqs: [
      {
        question: 'How do I book an appointment?',
        answer:
          'Select a doctor and click Book Now. Choose your preferred date, time slot, and consultation mode (in-clinic or video call). Review fees and click Book Appointment. You will receive instant confirmation on screen and via email.',
      },
      {
        question: 'Can I reschedule or cancel?',
        answer:
          'Yes. Go to My Appointments and click Reschedule or Cancel next to your booking. Cancellation terms depend on the individual doctor&apos;s policy.',
      },
    ],
  },
  {
    icon: Video,
    title: 'Video Consultations',
    description: 'Setting up and joining your video call with a doctor',
    faqs: [
      {
        question: 'How do I join a video consultation?',
        answer:
          'Go to My Appointments and click Join Video next to your confirmed appointment. Allow camera and microphone access when prompted. Ensure a stable internet connection. The doctor will join at the scheduled time.',
      },
      {
        question: 'What if my video call disconnects?',
        answer:
          'Refresh the page and rejoin using the same link. If the issue persists, contact support@mediguide.in with your appointment ID.',
      },
    ],
  },
  {
    icon: FileText,
    title: 'Prescriptions',
    description: 'Viewing and downloading your prescriptions and medical records',
    faqs: [
      {
        question: 'Where can I find my prescriptions?',
        answer:
          'Navigate to My Prescriptions from the top menu. You can view all prescriptions by doctor, hospital, and date. Each prescription can be viewed in detail or downloaded as PDF.',
      },
      {
        question: 'Can I share my prescription with another doctor?',
        answer:
          'Yes. Download the PDF from My Prescriptions and share it directly with any healthcare provider.',
      },
    ],
  },
  {
    icon: Settings2,
    title: 'Account Settings',
    description: 'Managing your profile, password, and notification preferences',
    faqs: [
      {
        question: 'How do I update my profile?',
        answer:
          'Click on your name in the top navigation and select My Profile. You can edit personal details, preferred language, current location, emergency contact, blood group, and existing medical conditions.',
      },
      {
        question: 'How do I change my password?',
        answer:
          'Go to My Profile and select Change Password. Enter your current password and then your new password twice to confirm.',
      },
    ],
  },
  {
    icon: Globe,
    title: 'Language Support',
    description: 'Switching languages and multilingual features',
    faqs: [
      {
        question: 'How do I change the platform language?',
        answer:
          'Click the globe icon in the top navigation bar. Select your preferred language from the dropdown. The platform instantly updates all text to your chosen language without requiring a page refresh.',
      },
      {
        question: 'Which languages are supported?',
        answer:
          'MediGuide currently supports English, Hindi, Spanish, French, German, and Punjabi, with more languages being added regularly.',
      },
    ],
  },
];

export default function HelpCenter() {
  useTitle('Help Center');
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const emergencyFaq = search.trim().toLowerCase().includes('emergency');
  const visibleCategories = categories.filter((category) => {
    const haystack = `${category.title} ${category.description} ${category.faqs.map((faq) => `${faq.question} ${faq.answer}`).join(' ')}`.toLowerCase();
    return haystack.includes(search.trim().toLowerCase());
  });

  return (
    <main className="bg-white pt-20">
      <section className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white">
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">Help Center</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">How can we help you?</h1>
            <p className="mt-4 text-base leading-7 text-white/85 sm:text-lg">
              Find answers, guides and support for your MediGuide experience.
            </p>
            <div className="mt-8 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-gray-900 shadow-lg shadow-teal-950/15 ring-1 ring-white/20">
              <Search className="h-5 w-5 text-teal-600" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search for answers..."
                className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleCategories.map((category, index) => {
            const expanded = openIndex === index;
            const Icon = category.icon;
            return (
              <motion.article
                key={category.title}
                layout
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(expanded ? null : index)}
                  className="flex w-full items-start gap-4 p-6 text-left"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">{category.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-gray-600">{category.description}</p>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {expanded ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-gray-200 px-6 pb-6"
                    >
                      <div className="space-y-4 pt-5">
                        {category.faqs.map((faq) => (
                          <div key={faq.question} className="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-100">
                            <p className="text-sm font-semibold text-gray-900">{faq.question}</p>
                            <p className="mt-2 text-sm leading-6 text-gray-600">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </div>

        {visibleCategories.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-gray-200 bg-gray-50 px-6 py-10 text-center text-sm text-gray-600">
            No help articles matched your search. Try a different keyword.
          </div>
        ) : null}
      </section>

      <section className="border-t border-gray-200 bg-[#fff7ed]">
        <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 rounded-2xl border border-orange-200 bg-orange-100 px-4 py-4 text-orange-900 sm:flex-row sm:items-center">
            <TriangleAlert className="h-5 w-5 flex-shrink-0 text-orange-600" />
            <p className="text-sm leading-6">
              For medical emergencies in India dial 112 immediately. For ambulance services dial 108. Do not use MediGuide for emergency situations.
            </p>
          </div>
          {emergencyFaq ? (
            <p className="mt-3 text-sm text-orange-900/80">
              Emergency-related support is always redirected to local emergency services first.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
