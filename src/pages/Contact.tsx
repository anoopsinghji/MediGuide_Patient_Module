import { useEffect, useState, type FormEvent } from 'react';
import { useTitle } from '../hooks';
import { motion } from 'framer-motion';
import { Clock3, Handshake, HeartPulse, Mail, MapPin, Stethoscope, TriangleAlert } from 'lucide-react';

type ContactFormState = {
  fullName: string;
  email: string;
  subject: string;
  message: string;
};

export default function Contact() {
  useTitle('Contact Us');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [form, setForm] = useState<ContactFormState>({
    fullName: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormState, string>>>({});
  const [success, setSuccess] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof ContactFormState, string>> = {};

    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!form.email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!form.subject.trim()) nextErrors.subject = 'Subject is required.';
    if (form.message.trim().length < 20) nextErrors.message = 'Please enter at least 20 characters.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSuccess('');
      return;
    }

    setSuccess('Thank you! We will get back to you within 24 hours.');
    setErrors({});
  };

  const contactCards = [
    {
      icon: Mail,
      label: 'General Inquiries',
      email: 'hello@mediguide.in',
      subtext: 'For all general questions about MediGuide',
    },
    {
      icon: HeartPulse,
      label: 'Patient Support',
      email: 'support@mediguide.in',
      subtext: 'Help with bookings, accounts, and consultations',
    },
    {
      icon: Stethoscope,
      label: 'Doctors & Clinics',
      email: 'doctors@mediguide.in',
      subtext: 'Profile, verification, and portal support',
    },
    {
      icon: Handshake,
      label: 'Partnerships',
      email: 'partners@mediguide.in',
      subtext: 'Institutional and integration partnerships',
    },
  ];

  return (
    <main className="bg-white pt-20">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-900">
            <div className="flex items-start gap-3">
              <TriangleAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-sm leading-6">
                MediGuide cannot help in medical emergencies. If you or someone around you needs urgent medical help in India, call 112 for emergency services or 108 for ambulance immediately.
              </p>
            </div>
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">Contact Us</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">Get In Touch</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-gray-600 sm:text-lg">
            We typically respond within 24 hours on business days. For medical emergencies dial 112.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Send us a message</h2>
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Full Name *</span>
                <input
                  value={form.fullName}
                  onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none"
                />
                {errors.fullName ? <span className="mt-1 block text-sm text-red-600">{errors.fullName}</span> : null}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Email Address *</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none"
                />
                {errors.email ? <span className="mt-1 block text-sm text-red-600">{errors.email}</span> : null}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Subject *</span>
                <select
                  value={form.subject}
                  onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none"
                >
                  <option>General Inquiry</option>
                  <option>Patient Support</option>
                  <option>Doctor or Clinic Support</option>
                  <option>Partnership Inquiry</option>
                  <option>Career Application</option>
                  <option>Technical Issue</option>
                  <option>Other</option>
                </select>
                {errors.subject ? <span className="mt-1 block text-sm text-red-600">{errors.subject}</span> : null}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Message *</span>
                <textarea
                  rows={6}
                  value={form.message}
                  onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none"
                />
                {errors.message ? <span className="mt-1 block text-sm text-red-600">{errors.message}</span> : null}
              </label>

              <button type="submit" className="inline-flex w-full items-center justify-center rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
                Send Message
              </button>
              {success ? <p className="text-sm font-medium text-emerald-600">{success}</p> : null}
            </form>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              {contactCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <motion.article
                    key={card.label}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    className="rounded-3xl border border-gray-200 bg-gray-50 p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{card.label}</h3>
                        <p className="mt-1 text-sm text-teal-700">{card.email}</p>
                        <p className="mt-2 text-sm leading-6 text-gray-600">{card.subtext}</p>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Lovely Professional University</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">Phagwara, Punjab — 144411, India</p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">Supervisor: Ms. Rohini (UID: 33939), School of Computer Applications</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-600 shadow-sm">
              <div className="flex items-center gap-3 text-gray-700">
                <Clock3 className="h-5 w-5 text-teal-700" />
                <p className="font-semibold text-gray-900">Response Time</p>
              </div>
              <p className="mt-3 leading-7">
                Business hours: Monday to Friday, 9:00 AM to 6:00 PM IST. We aim to respond to all messages within 24 to 48 hours.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
