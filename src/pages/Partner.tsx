import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTitle } from '../hooks';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, ShieldCheck, Hospital, Globe2 } from 'lucide-react';

type TabKey = 'doctor' | 'hospital' | 'partner';

type PartnerForm = {
  fullName: string;
  organisationName: string;
  email: string;
  phone: string;
  partnershipType: string;
  message: string;
};

const benefits = {
  doctor: [
    'Free profile registration',
    'Admin-verified badge on your profile',
    'In-clinic and video consultation bookings',
    'Integrated in-app chat with patients',
    'Patient prescription management tools',
    'Dashboard with appointment analytics',
  ],
  hospital: [
    'Clinic-level profile and branding',
    'Manage multiple doctors in one panel',
    'Consolidated appointment dashboard',
    'Analytics and consultation reports',
    'Priority placement in search results',
    'Dedicated partnership manager',
  ],
  partner: [
    'White-label integration options',
    'API access for booking integration',
    'Dedicated account management',
    'Co-branded patient communications',
    'Comprehensive reporting dashboard',
  ],
};

export default function Partner() {
  useTitle('Partner With Us');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeTab, setActiveTab] = useState<TabKey>('doctor');
  const [form, setForm] = useState<PartnerForm>({
    fullName: '',
    organisationName: '',
    email: '',
    phone: '',
    partnershipType: 'Individual Doctor',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PartnerForm, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof PartnerForm, string>> = {};

    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!form.organisationName.trim()) nextErrors.organisationName = 'Organisation name is required.';
    if (!form.email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!form.message.trim()) nextErrors.message = 'Please tell us about your organisation.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSubmitted(false);
      return;
    }

    setSubmitted(true);
    setErrors({});
  };

  const TabContent = () => {
    if (activeTab === 'doctor') {
      return (
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">For Doctors</p>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">Build your international patient base</h3>
            <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600">
              If you are a licensed medical professional practicing in India, MediGuide gives you a dedicated portal to manage your profile, set availability, and receive appointment requests from verified international users. Your profile displays your specialisation, clinic, experience, languages spoken, and consultation fees — giving travelers everything they need to choose you with confidence.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              {benefits.doctor.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
                Register as a Doctor <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
            <div className="flex items-center gap-3 text-teal-700">
              <ShieldCheck className="h-5 w-5" />
              <p className="text-sm font-semibold uppercase tracking-[0.24em]">Verified Growth</p>
            </div>
            <p className="mt-4 text-sm leading-7 text-gray-600">
              Join a platform designed to present your practice professionally to travelers who already need care and want clear, verified options before booking.
            </p>
          </div>
        </div>
      );
    }

    if (activeTab === 'hospital') {
      return (
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">For Hospitals & Clinics</p>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">Onboard your entire team</h3>
            <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600">
              Healthcare institutions — including multi-specialty hospitals, clinics, and diagnostic centers — can onboard their full team onto MediGuide. Our Clinic Onboarding feature automatically groups doctors under one clinic profile. Institutions gain enhanced visibility among medical tourists and international business travelers, a structured appointment management system, and access to analytics showing consultation trends and patient demographics.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              {benefits.hospital.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-teal-600 px-5 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50">
                Contact Our Team <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-teal-700">
              <Hospital className="h-5 w-5" />
              <p className="text-sm font-semibold uppercase tracking-[0.24em]">Clinic Network</p>
            </div>
            <p className="mt-4 text-sm leading-7 text-gray-600">
              Organise specialists under one verified institution profile and present a unified, traveler-friendly front door to your services.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">For Insurance & Travel Partners</p>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">Offer your clients seamless healthcare access</h3>
          <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600">
            We welcome integration partnerships with international health insurance providers, travel insurance companies, corporate travel managers, and tourism boards that want to offer clients seamless access to verified healthcare in India. If your organisation needs to provide healthcare navigation to a traveler segment, we would welcome a conversation about how MediGuide can be embedded into your existing offerings.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-gray-600">
            {benefits.partner.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
              Get In Touch <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-teal-700">
            <Globe2 className="h-5 w-5" />
            <p className="text-sm font-semibold uppercase tracking-[0.24em]">Integration Ready</p>
          </div>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            Partner channels can connect to a healthcare workflow that is clear, trusted, and easy to explain to travelers at the point of need.
          </p>
        </div>
      </div>
    );
  };

  return (
    <main className="bg-white pt-20">
      <section className="bg-gradient-to-r from-teal-700 to-teal-800 text-white">
        <div className="mx-auto max-w-screen-xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Grow With MediGuide</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/80 sm:text-lg">
              Join India&apos;s trusted healthcare navigation network and connect with thousands of international patients actively seeking medical care.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50">
                Register as a Doctor
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/70 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Contact Our Team
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">Why MediGuide</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            Reach patients who are actively looking for you
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              'International-Ready Patients',
              'Verified Network',
              'Pan-India Coverage',
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                <p className="text-lg font-semibold text-gray-900">{item}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-4xl text-base leading-8 text-gray-600">
            MediGuide connects international travelers — one of the highest-value patient segments — directly to verified healthcare providers. Our users are actively seeking medical assistance and are highly motivated to book quickly. Joining MediGuide positions your practice as an international-ready healthcare provider trusted by travelers from around the world.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 rounded-3xl border border-gray-200 bg-white p-2 shadow-sm">
            {[
              { key: 'doctor', label: 'For Doctors' },
              { key: 'hospital', label: 'For Hospitals & Clinics' },
              { key: 'partner', label: 'For Insurance & Travel Partners' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  activeTab === tab.key ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <TabContent />
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">How It Works</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Getting started is simple</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Register',
                body: 'Submit your profile details and professional credentials through the Doctor Portal or contact our team for institutional onboarding.',
              },
              {
                step: '02',
                title: 'Get Verified',
                body: 'Our admin team reviews your submission. Most profiles are reviewed within 2 to 3 business days. You will be notified by email upon approval.',
              },
              {
                step: '03',
                title: 'Start Receiving Patients',
                body: 'Your profile goes live on the platform. International travelers searching for your speciality in your city will find you immediately.',
              },
            ].map((item) => (
              <div key={item.step} className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                <div className="inline-flex rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white">{item.step}</div>
                <h3 className="mt-5 text-xl font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">Contact Form</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Ready to partner with MediGuide?</h2>
            <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
              <label className="md:col-span-1">
                <span className="text-sm font-medium text-gray-700">Full Name *</span>
                <input
                  value={form.fullName}
                  onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none"
                />
                {errors.fullName ? <span className="mt-1 block text-sm text-red-600">{errors.fullName}</span> : null}
              </label>
              <label className="md:col-span-1">
                <span className="text-sm font-medium text-gray-700">Organisation Name *</span>
                <input
                  value={form.organisationName}
                  onChange={(event) => setForm((prev) => ({ ...prev, organisationName: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none"
                />
                {errors.organisationName ? <span className="mt-1 block text-sm text-red-600">{errors.organisationName}</span> : null}
              </label>
              <label className="md:col-span-1">
                <span className="text-sm font-medium text-gray-700">Email Address *</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none"
                />
                {errors.email ? <span className="mt-1 block text-sm text-red-600">{errors.email}</span> : null}
              </label>
              <label className="md:col-span-1">
                <span className="text-sm font-medium text-gray-700">Phone Number</span>
                <input
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none"
                />
              </label>
              <label className="md:col-span-2">
                <span className="text-sm font-medium text-gray-700">Partnership Type</span>
                <select
                  value={form.partnershipType}
                  onChange={(event) => setForm((prev) => ({ ...prev, partnershipType: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none"
                >
                  <option>Individual Doctor</option>
                  <option>Hospital or Clinic</option>
                  <option>Insurance Provider</option>
                  <option>Travel Company</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="md:col-span-2">
                <span className="text-sm font-medium text-gray-700">Message *</span>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                  placeholder="Tell us about your organisation and the type of partnership you are interested in"
                  className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-teal-500 focus:outline-none"
                />
                {errors.message ? <span className="mt-1 block text-sm text-red-600">{errors.message}</span> : null}
              </label>
              <div className="md:col-span-2">
                <button type="submit" className="inline-flex items-center justify-center rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
                  Send Partnership Enquiry
                </button>
                {submitted ? <p className="mt-3 text-sm text-emerald-600">Thank you. We will review your enquiry and reply soon.</p> : null}
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
