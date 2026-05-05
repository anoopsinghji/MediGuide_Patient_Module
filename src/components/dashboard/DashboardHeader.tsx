import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Clock } from 'lucide-react';

interface DashboardHeaderProps {
  doctorName: string;
  onboardingStatus: 'pending' | 'verified' | 'rejected';
  verificationNotes?: string;
}

export function DashboardHeader({
  doctorName,
  onboardingStatus,
  verificationNotes,
}: DashboardHeaderProps) {
  const getStatusStyle = () => {
    switch (onboardingStatus) {
      case 'verified':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: ShieldCheck };
      case 'rejected':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: AlertTriangle };
      case 'pending':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: Clock };
    }
  };

  const status = getStatusStyle();
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-0"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome, {doctorName}</h1>
          <p className="text-gray-600">Here's your overview for today</p>
        </div>

        <div
          className={`${status.bg} ${status.border} ${status.text} px-4 py-3 rounded-lg border flex items-center gap-2 whitespace-nowrap`}
        >
          <StatusIcon className="w-5 h-5" />
          <div className="text-sm font-medium capitalize">{onboardingStatus}</div>
        </div>
      </div>

      {verificationNotes && onboardingStatus === 'rejected' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
        >
          <strong>Rejection Reason:</strong> {verificationNotes}
        </motion.div>
      )}
    </motion.div>
  );
}
