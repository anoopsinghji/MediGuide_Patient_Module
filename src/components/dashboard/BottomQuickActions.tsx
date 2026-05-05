import { motion } from 'framer-motion';
import {
  CalendarDays,
  MessageCircle,
  CalendarRange,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

interface BottomQuickActionsProps {
  onNavigateAppointments?: () => void;
  onNavigateChat?: () => void;
  onNavigateAvailability?: () => void;
  onNavigateEarnings?: () => void;
}

const actions = [
  {
    icon: CalendarDays,
    label: 'View Appointments',
    hint: 'Manage all bookings',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: MessageCircle,
    label: 'Patient Messages',
    hint: 'Check conversations',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: CalendarRange,
    label: 'Manage Schedule',
    hint: 'Set availability',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: BarChart3,
    label: 'View Analytics',
    hint: 'See full reports',
    color: 'from-orange-500 to-orange-600',
  },
];

export function BottomQuickActions({
  onNavigateAppointments,
  onNavigateChat,
  onNavigateAvailability,
  onNavigateEarnings,
}: BottomQuickActionsProps) {
  const handlers = [
    onNavigateAppointments,
    onNavigateChat,
    onNavigateAvailability,
    onNavigateEarnings,
  ];

  return (
    <div className="mt-6 border-t border-slate-200 pt-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const handler = handlers[index];

          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              whileHover={{ y: -4 }}
              onClick={handler}
              className={`bg-gradient-to-br ${action.color} p-4 rounded-lg text-white group hover:shadow-lg transition-all`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <div className="text-left flex-1">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs opacity-80">{action.hint}</div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
