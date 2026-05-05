import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, ArrowLeft, Phone, Calendar, Clock } from 'lucide-react';
import { DoctorVideoWindow } from '../components/consultation/DoctorVideoWindow';
import { useDoctorVideoConsultation } from '../hooks/useDoctorVideoConsultation';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Appointment {
  _id: string;
  doctorId: string;
  userId: {
    _id: string;
    name: string;
    phone: string;
  };
  appointmentDate: string;
  time: string;
  symptoms: string[];
  notes: string;
  consultationFee: number;
}

export function DoctorVideoConsultation() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const token = localStorage.getItem('doc_token') || '';

  const {
    roomUrl,
    loading: roomLoading,
    error: roomError,
    callRef,
    createVideoRoom,
    joinCall,
    leaveCall,
    duration,
    isConsultationStarted,
  } = useDoctorVideoConsultation({
    appointmentId: appointmentId || '',
    token,
  });

  // Fetch appointment details
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/doctor/appointments/${appointmentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setAppointment(response.data.appointment);
          await createVideoRoom();
        } else {
          setError(response.data.message || 'Failed to fetch appointment');
        }
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.response?.data?.message || 'Failed to load appointment');
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId && token) {
      fetchAppointment();
    }
  }, [appointmentId, token]);

  // Join call when room is ready
  useEffect(() => {
    if (roomUrl && !isConnected) {
      const joinWithDelay = async () => {
        try {
          await joinCall();
          setIsConnected(true);
        } catch (err) {
          console.error('Failed to join call:', err);
        }
      };

      joinWithDelay();
    }
  }, [roomUrl, isConnected]);

  const handleEndCall = async () => {
    try {
      await leaveCall();
      setIsConnected(false);
      navigate(-1);
    } catch (err) {
      console.error('Error ending call:', err);
    }
  };

  if (loading || roomLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Preparing consultation...</p>
        </div>
      </div>
    );
  }

  if (error || roomError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg shadow-lg p-8 max-w-md"
        >
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Error</h3>
              <p className="text-gray-600 mt-2">{error || roomError}</p>
              <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
                Go Back
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex gap-4 p-4 overflow-hidden">
      {/* Video Window */}
      <div className="flex-1 flex flex-col min-w-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 mb-4 shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="hover:bg-gray-100 p-2 rounded transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Video Consultation</h1>
          </div>
          {isConnected && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-green-700">Connected</span>
            </div>
          )}
        </motion.div>

        <div className="flex-1 rounded-lg overflow-hidden shadow-lg">
          {isConnected ? (
            <DoctorVideoWindow
              callRef={callRef}
              duration={duration}
              isConsultationStarted={isConsultationStarted}
              onEndCall={handleEndCall}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-b from-blue-50 to-white">
              <div className="text-center">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">Connecting to patient...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Patient Info */}
      {appointment && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <h2 className="text-2xl font-bold mb-2">{appointment.userId.name}</h2>
            <p className="text-blue-100">Patient</p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Contact */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                Contact
              </h3>
              <p className="text-gray-600">{appointment.userId.phone}</p>
            </div>

            {/* Appointment Details */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Appointment
              </h3>
              <p className="text-gray-600 text-sm">
                {new Date(appointment.appointmentDate).toLocaleDateString()}
              </p>
              <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" />
                {appointment.time}
              </p>
            </div>

            {/* Symptoms */}
            {appointment.symptoms?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Chief Complaints</h3>
                <div className="space-y-2">
                  {appointment.symptoms.map((symptom, idx) => (
                    <div key={idx} className="px-3 py-2 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
                      • {symptom}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {appointment.notes && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Patient Notes</h3>
                <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded border border-gray-200">
                  {appointment.notes}
                </p>
              </div>
            )}

            {/* Fee */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">In-Clinic Fee</span>
                <span className="text-xl font-bold text-blue-600">₹{appointment.consultationFee}</span>
              </div>
            </div>
          </div>

          {/* Prescription Button */}
          <div className="border-t p-4 bg-gray-50">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">
              Write Prescription
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
