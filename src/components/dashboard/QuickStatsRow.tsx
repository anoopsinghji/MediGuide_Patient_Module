import { CalendarDays, CheckCircle2, Loader2, Users } from 'lucide-react';
import { QuickStatsCard } from './QuickStatsCard';

interface QuickStatsRowProps {
  todayAppointments: number;
  completedToday: number;
  pendingAppointments: number;
  totalPatients: number;
  trends?: {
    appointments?: number[];
    completed?: number[];
    pending?: number[];
    patients?: number[];
  };
}

export function QuickStatsRow({
  todayAppointments,
  completedToday,
  pendingAppointments,
  totalPatients,
  trends,
}: QuickStatsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <QuickStatsCard
        icon={<CalendarDays className="w-6 h-6" />}
        label="Today's Appointments"
        value={todayAppointments}
        color="blue"
        trend={trends?.appointments}
        index={0}
      />
      <QuickStatsCard
        icon={<CheckCircle2 className="w-6 h-6" />}
        label="Completed Today"
        value={completedToday}
        color="green"
        trend={trends?.completed}
        index={1}
      />
      <QuickStatsCard
        icon={<Loader2 className="w-6 h-6" />}
        label="Pending Confirmations"
        value={pendingAppointments}
        color="orange"
        trend={trends?.pending}
        index={2}
      />
      <QuickStatsCard
        icon={<Users className="w-6 h-6" />}
        label="Total Patients"
        value={totalPatients}
        color="teal"
        trend={trends?.patients}
        index={3}
      />
    </div>
  );
}
