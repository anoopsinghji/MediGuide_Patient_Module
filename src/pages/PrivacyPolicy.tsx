import { useEffect } from 'react';
import { useTitle } from '../hooks';
import LegalPageShell from '../components/legal/LegalPageShell';

export default function PrivacyPolicy() {
  useTitle('Privacy Policy');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <LegalPageShell
      title="Privacy Policy"
      subtitle="We are committed to protecting your personal information and your right to privacy."
      metaLabel="Last Updated"
      metaValue="May 2026"
      sections={[
        {
          id: 'introduction',
          title: 'Introduction',
          content: (
            <>
              <p>
                MediGuide is an AI-powered healthcare navigation platform built to help international travelers in India find trusted, verified doctors and medical facilities. We are fully committed to protecting the privacy of every user. This policy explains what personal information we collect, how we use it, how we store and protect it, and your rights regarding that information.
              </p>
              <p>
                By registering or using any MediGuide feature — including the AI Symptom Checker, doctor search, appointment booking, video consultation, or in-app chat — you agree to this policy and the way your information may be handled in order to deliver the service safely and effectively.
              </p>
            </>
          ),
        },
        {
          id: 'information-we-collect',
          title: 'Information We Collect',
          content: (
            <>
              <p>
                We collect two categories of data: information you provide directly and information gathered automatically. During registration, we may collect your full name, email address, phone number, nationality, preferred language, age, gender, blood group, emergency contact number, and any existing medical conditions you choose to share.
              </p>
              <p>
                During appointment booking, we collect details about your symptoms, your preferred consultation type, and your selected date and time. We also collect certain information automatically when you use the platform, such as your IP address, browser type, operating system, pages visited, and approximate location through GPS with permission or IP-based detection.
              </p>
            </>
          ),
        },
        {
          id: 'how-we-use-your-information',
          title: 'How We Use Your Information',
          content: (
            <>
              <p>
                We use the information we collect to register and manage your account; suggest appropriate doctors based on symptoms and location using our rule-based AI; facilitate bookings and video consultations; enable in-app chat between patients and doctors; send appointment confirmations and reminders; verify doctor profiles through our admin review process; improve our symptom matching rules and doctor recommendations; and comply with applicable laws.
              </p>
              <p>
                We do not use your health data for advertising and we never sell your information to third parties. Data is handled only for healthcare navigation, operational support, legal compliance, and service quality purposes.
              </p>
            </>
          ),
        },
        {
          id: 'data-sharing',
          title: 'Data Sharing',
          content: (
            <>
              <p>
                Your information is shared only on a need-to-know basis. When you book an appointment, relevant details are shared with your selected doctor so they can prepare for the consultation. Platform administrators may access anonymised usage data for support, quality assurance, and compliance monitoring.
              </p>
              <p>
                Trusted third-party technology providers — including cloud hosting, video infrastructure, and communication services — are contractually bound to confidentiality and process data only to deliver services on our behalf. We may disclose data if required by law or to protect the rights, property, or safety of MediGuide, its users, or the public.
              </p>
            </>
          ),
        },
        {
          id: 'data-retention-security',
          title: 'Data Retention & Security',
          content: (
            <>
              <p>
                Data is retained while your account remains active or for as long as needed to provide the service. You may request account deletion at any time, and we will remove personally identifiable information within 30 days except where retention is legally required.
              </p>
              <p>
                Security measures include HTTPS encryption, password hashing, and role-based access controls that limit internal access to authorised personnel. No system is completely risk-free, so we encourage you to use a strong password and contact us immediately if you suspect unauthorised access to your account.
              </p>
            </>
          ),
        },
        {
          id: 'your-rights',
          title: 'Your Rights',
          content: (
            <>
              <p>
                Depending on your country of residence, you may have the right to access personal data we hold about you, request correction of inaccurate data, request erasure of your personal data, object to or restrict certain processing, and lodge a complaint with a data protection authority.
              </p>
              <p>
                To exercise any of these rights, contact us at support@mediguide.in. We aim to respond to legitimate requests within 30 days and will guide you through any additional verification steps that may be required.
              </p>
            </>
          ),
        },
        {
          id: 'changes-to-this-policy',
          title: 'Changes to This Policy',
          content: (
            <>
              <p>
                We may update this policy periodically to reflect changes in our practices, legal requirements, or platform features. When material changes occur, we will notify you by email or through a prominent notice on our website.
              </p>
              <p>
                Continued use of MediGuide after a policy update constitutes acceptance of the revised version. We encourage you to review this page from time to time so you remain informed about how your information is handled.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
