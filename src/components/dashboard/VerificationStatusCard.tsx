import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Clock, Edit2 } from 'lucide-react';

interface VerificationStatusCardProps {
  onboardingStatus: 'pending' | 'verified' | 'rejected';
  name: string;
  specialty: string;
  verificationNotes?: string;
  onEditProfile?: () => void;
}

export function VerificationStatusCard({
  onboardingStatus,
  name,
  specialty,
  verificationNotes,
  onEditProfile,
}: VerificationStatusCardProps) {
  const getStatusConfig = () => {
    switch (onboardingStatus) {
      case 'verified':
        return {
          icon: ShieldCheck,
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          title: 'Profile Verified',
          desc: 'Your profile is verified and visible to patients',
        };
      case 'rejected':
        return {
          icon: AlertTriangle,
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          title: 'Verification Rejected',
          desc: verificationNotes || 'Please review the comments and resubmit',
        };
      case 'pending':
        return {
          icon: Clock,
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          title: 'Verification Pending',
          desc: 'Your profile is under review. This usually takes 2-3 days.',
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className={`${config.bg} ${config.border} ${config.text} rounded-2xl border p-6`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          <StatusIcon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h3 className="font-semibold text-base">{config.title}</h3>
              <p className="text-sm mt-1 opacity-90">{config.desc}</p>
            </div>
            {onEditProfile && (
              <button
                onClick={onEditProfile}
                className={`flex-shrink-0 p-2 rounded-lg ${config.bg} hover:opacity-80 transition-opacity`}
                title="Edit profile"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs space-y-1 pt-3 border-t border-current border-opacity-20">
            <div className="font-medium">{name}</div>
            <div className="opacity-75">{specialty}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
