import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Calendar, Clock, Loader2, Phone } from 'lucide-react';
import axios from 'axios';
import { DoctorVideoWindow } from '../components/consultation/DoctorVideoWindow';
import { ConsultationSideChat } from '../components/consultation/ConsultationSideChat';
import { useDoctorVideoConsultation } from '../hooks/useDoctorVideoConsultation';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Appointment {
  _id: string;
  doctorId: string;
  userId: {
    _id: string;
    name: string;
    email?: string;
    phone: string;
    age?: number;
    gender?: string;
    bloodGroup?: string;
    existingConditions?: string[];
    emergencyContactNumber?: string;
    nationality?: string;
    profileImage?: string;
  };
  appointmentDate: string;
  time: string;
  symptoms: string[];
  notes: string;
  consultationFee: number;
}

interface DoctorVideoConsultationWrapperProps {
  appointmentId: string;
  onExit?: () => void;
}

export function DoctorVideoConsultationWrapper({
  appointmentId,
  onExit,
}: DoctorVideoConsultationWrapperProps) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const token = localStorage.getItem('doc_token') || '';
  const doctorApiBase = `${API_BASE_URL}/doctor`;

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
    connectionState,
    iceConnectionState,
    signalingState,
    socketConnected,
  } = useDoctorVideoConsultation({
    appointmentId,
    token,
  });

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/doctor/appointments/${appointmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

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
  }, [isConnected, roomUrl]);

  useEffect(() => {
    setIsConnected(connectionState === 'connected');
  }, [connectionState]);

  const handleBack = () => {
    if (onExit) {
      onExit();
      return;
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    }
  };

  const handleEndCall = async () => {
    try {
      await leaveCall();
      setIsConnected(false);
      handleBack();
    } catch (err) {
      console.error('Failed to end call:', err);
    }
  };

  if (error || roomError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-full min-h-0 items-center justify-center bg-slate-950 px-4"
      >
        <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-7 w-7 flex-shrink-0 text-red-400" />
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-white">Unable to Join Consultation</h2>
              <p className="mt-2 text-sm text-slate-300">{error || roomError}</p>
              <button
                type="button"
                onClick={handleBack}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (loading || roomLoading || !appointment) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-full min-h-0 items-center justify-center bg-slate-950"
      >
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-cyan-400" />
          <p className="text-lg font-semibold text-white">Preparing consultation room...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-slate-950 text-white"
    >
      <header className="shrink-0 border-b border-slate-800 bg-slate-900/95 px-3 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-600/70 px-3 py-2 text-cyan-300 transition hover:bg-cyan-500/10"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </button>

            <div className="min-w-0">
              <h2 className="truncate text-base font-bold sm:text-lg">{appointment.userId.name}</h2>
              <p className="truncate text-xs text-slate-300 sm:text-sm">Patient - {appointment.userId.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300 md:flex">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(appointment.appointmentDate).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
              <Clock className="ml-1 h-3.5 w-3.5" />
              {appointment.time}
            </div>

            {isConsultationStarted ? (
              <button
                type="button"
                onClick={handleEndCall}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                <Phone className="h-4 w-4" />
                End Call
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-hidden p-3 sm:p-4">
        <div className="grid h-full min-h-0 grid-cols-[1.5fr_1fr] gap-3 sm:gap-4">
          {/* 80% Video Area */}
          <div className="min-h-0 flex-1">
            <DoctorVideoWindow
              callRef={callRef}
              duration={duration}
              isConsultationStarted={isConsultationStarted}
              connectionState={connectionState}
              iceConnectionState={iceConnectionState}
              signalingState={signalingState}
              socketConnected={socketConnected}
              onEndCall={handleEndCall}
            />
          </div>

          {/* 20% Chat Area with Patient Snapshot */}
          <div className="min-h-0 flex flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-900/90 shadow-lg">
            {/* Patient Info Header */}
            <div className="shrink-0 border-b border-slate-700 bg-slate-900 px-3 py-3">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wide">Patient</p>
                <p className="text-sm font-bold text-white truncate">{appointment.userId.name}</p>
                <div className="text-xs text-slate-300 space-y-0.5">
                  <p>Age: {appointment.userId.age ? `${appointment.userId.age} yrs` : 'N/A'}</p>
                  <p>Blood: <span className="font-semibold text-rose-300">{appointment.userId.bloodGroup || 'N/A'}</span></p>
                </div>
              </div>
            </div>

            {/* Chat Window */}
            <div className="min-h-0 flex-1 overflow-hidden">
              <ConsultationSideChat
                apiBase={doctorApiBase}
                authToken={token}
                patientName={appointment.userId.name}
                patientEmail={appointment.userId.email}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
