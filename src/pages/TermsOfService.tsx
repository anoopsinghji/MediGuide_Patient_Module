import { useEffect } from 'react';
import { useTitle } from '../hooks';
import { TriangleAlert } from 'lucide-react';
import LegalPageShell from '../components/legal/LegalPageShell';

export default function TermsOfService() {
  useTitle('Terms of Service');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <LegalPageShell
      title="Terms of Service"
      subtitle="Please read these terms carefully before using MediGuide."
      metaLabel="Effective Date"
      metaValue="May 2026"
      topNotice={
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
            <p className="text-sm leading-6">
              MediGuide is a navigation platform, not a medical provider. Always consult a licensed doctor for medical advice, diagnosis, or treatment.
            </p>
          </div>
        </div>
      }
      sections={[
        {
          id: 'acceptance-of-terms',
          title: 'Acceptance of Terms',
          content: (
            <>
              <p>
                These Terms govern your access to and use of MediGuide including its website, AI Symptom Checker, doctor search, appointment booking, video consultation, and in-app messaging. By creating an account or using any part of the platform, you confirm you are at least 18 years of age, have read these Terms, and agree to be bound by them.
              </p>
              <p>If you do not agree, discontinue use immediately.</p>
            </>
          ),
        },
        {
          id: 'nature-of-the-service',
          title: 'Nature of the Service',
          content: (
            <>
              <p>
                MediGuide is a healthcare navigation and connectivity platform. It helps international travelers identify appropriate medical specialists based on reported symptoms, locate verified nearby providers, and facilitate appointment booking and consultations.
              </p>
              <p>
                MediGuide is not a medical provider, hospital, diagnostic laboratory, or healthcare institution. The platform does not practice medicine, provide diagnoses, prescribe treatments, or offer any clinical services. The AI Symptom Checker is a navigation aid only and must not be interpreted as a medical opinion or clinical assessment.
              </p>
            </>
          ),
        },
        {
          id: 'user-accounts-and-responsibilities',
          title: 'User Accounts and Responsibilities',
          content: (
            <>
              <p>
                You must provide accurate, complete, and current information during registration and update it promptly when changes occur. You are solely responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.
              </p>
              <p>
                You agree not to use the platform for unlawful purposes, impersonate any person or entity, submit false or fraudulent information, attempt to access or disrupt the platform&apos;s systems, harvest other users&apos; data, or engage in harmful conduct. Notify us immediately of any unauthorised account access.
              </p>
            </>
          ),
        },
        {
          id: 'doctor-verification-and-listings',
          title: 'Doctor Verification and Listings',
          content: (
            <>
              <p>
                All doctor profiles undergo admin verification before appearing on the platform. However, MediGuide does not independently certify medical qualifications and cannot guarantee the quality or outcomes of any consultation or treatment.
              </p>
              <p>
                Users are strongly encouraged to independently verify a doctor&apos;s credentials with the relevant medical council before proceeding with any consultation or treatment.
              </p>
            </>
          ),
        },
        {
          id: 'appointments-and-consultations',
          title: 'Appointments and Consultations',
          content: (
            <>
              <p>
                MediGuide facilitates in-clinic visits and video consultations. When you book an appointment you enter into a direct agreement with the doctor. MediGuide is not a party to that agreement and accepts no liability for the doctor&apos;s conduct, advice, diagnosis, or treatment.
              </p>
              <p>
                Appointment fees are set by individual doctors and displayed at the time of booking. Refund and cancellation terms are subject to the doctor&apos;s own policies.
              </p>
            </>
          ),
        },
        {
          id: 'limitation-of-liability',
          title: 'Limitation of Liability',
          content: (
            <>
              <p>
                To the fullest extent permitted by applicable law, MediGuide, its founders, directors, employees, affiliates, and technology partners shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of the platform or any medical services booked through it.
              </p>
              <p>
                This includes harm resulting from reliance on the AI Symptom Checker, inaccuracies in doctor listings, technical failures, or the conduct of medical professionals found through the platform.
              </p>
            </>
          ),
        },
        {
          id: 'modifications-and-termination',
          title: 'Modifications and Termination',
          content: (
            <>
              <p>
                MediGuide reserves the right to modify, suspend, or discontinue any aspect of the platform at any time with or without notice. We may terminate or suspend your account if you violate these Terms or engage in harmful conduct.
              </p>
              <p>
                These Terms may be updated periodically. Continued use following notification constitutes acceptance of the revised Terms.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
