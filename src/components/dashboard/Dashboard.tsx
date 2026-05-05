import { motion } from 'framer-motion';
import { Clock, Video, User, ChevronRight, Activity, MapPin } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardHeader } from './DashboardHeader';
import { QuickStatsRow } from './QuickStatsRow';
import { AppointmentCalendarWidget } from './AppointmentCalendarWidget';
import { RecentChatsWidget } from './RecentChatsWidget';
import { VerificationStatusCard } from './VerificationStatusCard';
import { EarningsPreviewCard } from './EarningsPreviewCard';
import { BottomQuickActions } from './BottomQuickActions';

type TrendPoint = {
  day: string;
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  patients: number;
};

type BreakdownDatum = {
  name: string;
  value: number;
};

type MonthlyEarningPoint = {
  month: string;
  earnings: number;
  count?: number;
};

interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialty: string;
  onboardingStatus: 'pending' | 'verified' | 'rejected';
  verificationNotes?: string;
}

interface Appointment {
  _id: string;
  patientName: string;
  patientEmail?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  date: string;
  time: string;
  type: 'in-person' | 'teleconsultation';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  fee: number;
}

interface Chat {
  _id: string;
  patientName: string;
  patientEmail: string;
  messages: { from: 'doctor' | 'patient'; text: string; time: string }[];
  lastMessage: string;
}

interface DashboardStats {
  todayAppointments: number;
  completedToday: number;
  pendingAppointments: number;
  totalPatients: number;
  recentAppointments: Appointment[];
  recentChats: Chat[];
  nextAppointment?: Appointment | null;
  appointmentsTrend?: TrendPoint[];
  appointmentStatusBreakdown?: BreakdownDatum[];
  appointmentTypeBreakdown?: BreakdownDatum[];
}

interface Earnings {
  thisMonth?: number;
  total?: number;
  completedAppointments?: number;
  monthly?: MonthlyEarningPoint[];
  monthlyEarnings?: number;
  totalEarnings?: number;
  consultationCount?: number;
}

interface DashboardProps {
  doctor: Doctor;
  dashboardStats: DashboardStats | null;
  earnings: Earnings | null;
  recentAppointments: Appointment[];
  recentChats: Chat[];
  onNavigateSection: (section: string) => void;
}

export function Dashboard({
  doctor,
  dashboardStats,
  earnings,
  recentAppointments,
  recentChats,
  onNavigateSection,
}: DashboardProps) {
  const stats = dashboardStats || {
    todayAppointments: 0,
    completedToday: 0,
    pendingAppointments: 0,
    totalPatients: 0,
    recentAppointments: [],
    recentChats: [],
  };

  const earningsData = earnings || {
    thisMonth: 0,
    total: 0,
    completedAppointments: 0,
    monthly: [],
  };

  const nextAppointment = stats.nextAppointment || recentAppointments.find((a) => a.status === 'confirmed' || a.status === 'pending');
  const appointmentsTrend = stats.appointmentsTrend || [];
  const statusBreakdown = (stats.appointmentStatusBreakdown || []).filter((item) => item.value > 0);
  const typeBreakdown = (stats.appointmentTypeBreakdown || []).filter((item) => item.value > 0);

  const chartColorMap: Record<string, string> = {
    Pending: '#f59e0b',
    Confirmed: '#2563eb',
    Completed: '#16a34a',
    Cancelled: '#ef4444',
    Teleconsultation: '#0ea5e9',
    'In-Clinic': '#7c3aed',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header */}
      <DashboardHeader
        doctorName={doctor.name}
        onboardingStatus={doctor.onboardingStatus}
        verificationNotes={doctor.verificationNotes}
      />

      {/* Active "Up Next" Triage Card */}
      {nextAppointment && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 p-5 text-white shadow-lg md:p-6"
        >
          {/* Background Decor */}
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white opacity-5 blur-3xl"></div>

          <div className="relative z-10 flex w-full flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sky-100">
                <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider">
                  Up Next
                </span>
                <span className="flex items-center text-sm font-medium tabular-nums">
                  <Clock className="mr-1 h-4 w-4" /> {nextAppointment.time}
                </span>
              </div>
              <h3 className="flex items-center gap-2 text-xl font-bold md:text-2xl">
                <User className="h-5 w-5 opacity-80" />
                {nextAppointment.patientName}
              </h3>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-medium text-sky-100">
                <span className="flex items-center rounded-full bg-black/20 px-2.5 py-1">
                  {nextAppointment.type === 'teleconsultation' ? <Video className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" /> : <MapPin className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />}
                  {nextAppointment.type === 'teleconsultation' ? 'Video Consult' : 'In-Clinic'}
                </span>
                {(nextAppointment.age || nextAppointment.gender) && (
                  <span className="flex items-center opacity-90">
                    <Activity className="mr-1 h-4 w-4 opacity-70" /> {nextAppointment.gender || 'Unknown'} • {nextAppointment.age ? `${nextAppointment.age}y` : 'N/A'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex shrink-0">
              <button
                onClick={() => onNavigateSection('appointments')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-sky-700 shadow-md transition-colors hover:bg-sky-50 md:w-auto"
              >
                {nextAppointment.type === 'teleconsultation' ? 'Join Video Call' : 'View Patient Dossier'}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Stats Row */}
      <QuickStatsRow
        todayAppointments={stats.todayAppointments}
        completedToday={stats.completedToday}
        pendingAppointments={stats.pendingAppointments}
        totalPatients={stats.totalPatients}
        trends={{
          appointments: appointmentsTrend.map((point) => point.total),
          completed: appointmentsTrend.map((point) => point.completed),
          pending: appointmentsTrend.map((point) => point.pending + point.confirmed),
          patients: appointmentsTrend.map((point) => point.patients),
        }}
      />

      {/* Main Grid: Appointments and side widgets */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.95fr)] xl:items-start">
        <div className="space-y-6">
          <AppointmentCalendarWidget
            recentAppointments={recentAppointments}
            onLoadMore={() => onNavigateSection('appointments')}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <h3 className="text-base font-semibold text-slate-900">Status Distribution</h3>
              <p className="mb-3 text-sm text-slate-500">Current lifecycle of appointments</p>

              {statusBreakdown.length > 0 ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusBreakdown}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={2}
                        strokeWidth={0}
                      >
                        {statusBreakdown.map((entry) => (
                          <Cell key={entry.name} fill={chartColorMap[entry.name] || '#64748b'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [Number(value || 0), 'Appointments']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500">
                  Status insights will appear as bookings grow.
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.25 }}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <h3 className="text-base font-semibold text-slate-900">Consultation Mix</h3>
              <p className="mb-3 text-sm text-slate-500">Teleconsultation vs in-clinic share</p>

              {typeBreakdown.length > 0 ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeBreakdown}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={2}
                        strokeWidth={0}
                      >
                        {typeBreakdown.map((entry) => (
                          <Cell key={entry.name} fill={chartColorMap[entry.name] || '#0ea5e9'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [Number(value || 0), 'Appointments']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500">
                  Consultation distribution will appear here.
                </div>
              )}
            </motion.div>
          </div>
        </div>

        <div className="space-y-5">
          <RecentChatsWidget
            recentChats={recentChats}
            onChatSelect={() => {
              onNavigateSection('patients-chat');
            }}
            onViewAll={() => onNavigateSection('patients-chat')}
          />

          <VerificationStatusCard
            onboardingStatus={doctor.onboardingStatus}
            name={doctor.name}
            specialty={doctor.specialty}
            verificationNotes={doctor.verificationNotes}
            onEditProfile={() => onNavigateSection('profile')}
          />

          <EarningsPreviewCard
            monthlyEarnings={earningsData.thisMonth || earningsData.monthlyEarnings}
            totalEarnings={earningsData.total || earningsData.totalEarnings}
            consultationCount={earningsData.completedAppointments || earningsData.consultationCount}
            monthlyTrend={earningsData.monthly || []}
            onViewDetails={() => onNavigateSection('earnings')}
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="rounded-2xl border border-slate-200 bg-white p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Appointment Flow</h3>
            <p className="text-sm text-slate-500">7-day stacked trend by status</p>
          </div>
        </div>

        {appointmentsTrend.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentsTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: 10, borderColor: '#cbd5e1' }}
                />
                <Legend wrapperStyle={{ paddingTop: 12 }} />
                <Bar dataKey="completed" stackId="status" fill="#16a34a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="confirmed" stackId="status" fill="#2563eb" />
                <Bar dataKey="pending" stackId="status" fill="#f59e0b" />
                <Bar dataKey="cancelled" stackId="status" fill="#ef4444" radius={[0, 0, 6, 6]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500">
            Trend data will appear after appointments are recorded.
          </div>
        )}
      </motion.div>

      {/* Bottom Quick Actions */}
      <BottomQuickActions
        onNavigateAppointments={() => onNavigateSection('appointments')}
        onNavigateChat={() => onNavigateSection('patients-chat')}
        onNavigateAvailability={() => onNavigateSection('availability')}
        onNavigateEarnings={() => onNavigateSection('earnings')}
      />
    </motion.div>
  );
}
