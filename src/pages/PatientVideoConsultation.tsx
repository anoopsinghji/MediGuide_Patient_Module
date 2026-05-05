import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Loader2, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { VideoWindow } from '../components/consultation/VideoWindow';
import { WaitingRoom } from '../components/consultation/WaitingRoom';
import { ConsultationChat } from '../components/consultation/ConsultationChat';
import { useVideoConsultation } from '../hooks/useVideoConsultation';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Appointment {
  _id: string;
  doctorId: {
    _id: string;
    name: string;
    specialty: string;
    profileImage?: string;
  };
  userId: {
    _id: string;
    name: string;
  };
  appointmentDate: string;
  time: string;
  type: string;
  consultationFee: number;
}

export function PatientVideoConsultation() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const token = localStorage.getItem('token') || '';
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const {
    roomUrl,
    loading: roomLoading,
    error: roomError,
    callRef,
    createVideoRoom,
    joinCall,
    leaveCall,
    duration,
    connectionState,
    iceConnectionState,
    signalingState,
    socketConnected,
  } = useVideoConsultation({
    appointmentId: appointmentId || '',
    token,
    doctorName: appointment?.doctorId.name || 'Doctor',
    patientName: user?.name || 'Patient',
  });

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/appointments/${appointmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setAppointment(response.data.appointment);

          if (response.data.appointment.type !== 'teleconsultation') {
            setError('This is not a teleconsultation appointment');
            return;
          }

          await createVideoRoom();
        } else {
          setError(response.data.message || 'Failed to fetch appointment');
        }
      } catch (err: any) {
        console.error('Error fetching appointment:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load appointment');
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

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1024px)');
    const syncViewport = () => {
      const mobile = mediaQuery.matches;
      setIsMobile(mobile);
      setChatMinimized(mobile);
    };

    syncViewport();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', syncViewport);
      return () => mediaQuery.removeEventListener('change', syncViewport);
    }

    mediaQuery.addListener(syncViewport);
    return () => mediaQuery.removeListener(syncViewport);
  }, []);

  const handleLeaveCall = async () => {
    try {
      await leaveCall();
      setIsConnected(false);
      navigate(-1);
    } catch (err) {
      console.error('Error leaving call:', err);
    }
  };

  if (loading || roomLoading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-slate-950">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-cyan-400" />
          <p className="text-lg font-semibold text-white">Preparing your consultation...</p>
          <p className="mt-2 text-sm text-slate-300">Please wait while we set up the video room.</p>
        </div>
      </div>
    );
  }

  if (error || roomError) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-slate-950 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-7 w-7 flex-shrink-0 text-red-400" />
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-white">Unable to Start Consultation</h3>
              <p className="mt-2 text-sm text-slate-300">{error || roomError}</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 font-semibold text-white transition hover:bg-cyan-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Appointments
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-slate-950 text-slate-300">
        Appointment not found.
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-slate-950 text-white">
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="shrink-0 border-b border-slate-800 bg-slate-900/95 px-3 py-3 sm:px-5"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-600/70 px-3 py-2 text-cyan-300 transition hover:bg-cyan-500/10"
              title="Back to appointments"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold">Dr. {appointment.doctorId.name}</h1>
              <p className="truncate text-xs text-slate-300 sm:text-sm">{appointment.doctorId.specialty}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isMobile ? (
              <button
                type="button"
                onClick={() => setChatMinimized((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-500/70 px-3 py-2 text-sm font-semibold text-blue-100 hover:bg-blue-500/10"
              >
                <MessageSquare className="h-4 w-4" />
                {chatMinimized ? 'Open Chat' : 'Hide Chat'}
              </button>
            ) : null}

            {isConnected ? (
              <div className="hidden items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 sm:flex">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-200">Connected</span>
              </div>
            ) : null}
          </div>
        </div>
      </motion.header>

      <div className="flex-1 min-h-0 p-2 sm:p-4">
        <div className="grid h-full min-h-0 grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-h-0">
            {isConnected ? (
              <VideoWindow
                callRef={callRef}
                isConnected={isConnected}
                doctorName={appointment.doctorId.name}
                duration={duration}
                connectionState={connectionState}
                iceConnectionState={iceConnectionState}
                signalingState={signalingState}
                socketConnected={socketConnected}
                onLeave={handleLeaveCall}
              />
            ) : (
              <WaitingRoom
                doctorName={appointment.doctorId.name}
                doctorSpecialty={appointment.doctorId.specialty}
                doctorImage={appointment.doctorId.profileImage}
              />
            )}
          </div>

          {!isMobile ? (
            <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} className="min-h-0">
              <ConsultationChat
                doctorId={appointment.doctorId._id}
                patientName={user?.name || 'Patient'}
                doctorName={appointment.doctorId.name}
              />
            </motion.div>
          ) : null}
        </div>
      </div>

      {isMobile && !chatMinimized ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 p-2" onClick={() => setChatMinimized(true)}>
          <div className="h-[66vh] w-full" onClick={(event) => event.stopPropagation()}>
            <ConsultationChat
              doctorId={appointment.doctorId._id}
              patientName={user?.name || 'Patient'}
              doctorName={appointment.doctorId.name}
              onMinimize={() => setChatMinimized(true)}
              className="h-full rounded-2xl"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
