import { motion } from 'framer-motion';
import { Calendar, Clock, Smartphone, Building2 } from 'lucide-react';

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

interface AppointmentCalendarWidgetProps {
  recentAppointments: Appointment[];
  onLoadMore?: () => void;
}

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
  completed: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

export function AppointmentCalendarWidget({
  recentAppointments,
  onLoadMore,
}: AppointmentCalendarWidgetProps) {
  if (recentAppointments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="h-full rounded-2xl border border-slate-200 bg-white p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Upcoming Appointments</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No upcoming appointments</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
    >
      <div className="flex items-center gap-2 border-b border-slate-200 p-5">
        <Calendar className="w-5 h-5 text-gray-600" />
        <h2 className="font-semibold text-gray-900">Upcoming Appointments</h2>
        <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {recentAppointments.length}
        </span>
      </div>

      <div className="max-h-96 divide-y divide-slate-200 overflow-y-auto">
        {recentAppointments.slice(0, 5).map((appt, index) => (
          <motion.div
            key={appt._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.05 }}
            className="p-4 transition-colors hover:bg-slate-50"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {appt.type === 'teleconsultation' ? (
                  <Smartphone className="w-4 h-4 text-blue-600" />
                ) : (
                  <Building2 className="w-4 h-4 text-purple-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-900 truncate">{appt.patientName}</p>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                      statusStyles[appt.status]
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>
                
                {/* Patient Medical Preview row */}
                <div className="flex items-center gap-2 text-xs text-indigo-600 mb-1 font-medium bg-indigo-50 px-2 py-1 rounded w-fit">
                  {appt.age ? <span>{appt.age}y</span> : null}
                  {appt.gender ? <span className="capitalize border-l border-indigo-200 pl-2">{appt.gender}</span> : null}
                  {appt.bloodGroup ? <span className="border-l border-indigo-200 pl-2 text-red-500">{appt.bloodGroup}</span> : null}
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(appt.date).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {appt.time}
                  </span>
                  <span>₹{appt.fee}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {recentAppointments.length > 5 && (
        <div className="border-t border-slate-200 p-4 text-center">
          <button
            onClick={onLoadMore}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            View all appointments →
          </button>
        </div>
      )}
    </motion.div>
  );
}
