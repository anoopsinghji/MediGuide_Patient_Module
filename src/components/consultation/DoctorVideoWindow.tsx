import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

type CallAdapter = {
  mount?: (container: HTMLDivElement) => void;
  setMeetingUI?: (config: Record<string, unknown>) => void;
  insertMeetingUI?: (container: HTMLDivElement) => void;
};

interface DoctorVideoWindowProps {
  callRef: React.MutableRefObject<CallAdapter | null>;
  duration: number;
  isConsultationStarted: boolean;
  connectionState?: string;
  iceConnectionState?: string;
  signalingState?: string;
  socketConnected?: boolean;
  onEndCall: () => void;
}

export function DoctorVideoWindow({
  callRef,
  duration,
  isConsultationStarted,
  connectionState = 'new',
  iceConnectionState = 'new',
  signalingState = 'stable',
  socketConnected = false,
}: DoctorVideoWindowProps) {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!videoContainerRef.current) {
      return;
    }

    if (!callRef.current) {
      mountedRef.current = false;
      return;
    }

    if (!mountedRef.current) {
      if (typeof callRef.current.mount === 'function') {
        callRef.current.mount(videoContainerRef.current);
        mountedRef.current = true;
        return;
      }

      if (typeof callRef.current.setMeetingUI === 'function') {
        callRef.current.setMeetingUI({ showParticipantsPanel: false });
      }
      if (typeof callRef.current.insertMeetingUI === 'function') {
        callRef.current.insertMeetingUI(videoContainerRef.current);
        mountedRef.current = true;
      }
    }
  }, [callRef, connectionState, socketConnected, isConsultationStarted]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-700 bg-gray-900 shadow-2xl">
      <div ref={videoContainerRef} className="relative flex-1 min-h-0 bg-black">
        <div className="absolute left-2 top-2 z-10 rounded-lg border border-white/10 bg-black/70 px-2.5 py-2 text-[11px] text-gray-200 backdrop-blur sm:left-4 sm:top-4 sm:text-xs">
          <p>Socket: <span className={socketConnected ? 'text-emerald-400' : 'text-red-400'}>{socketConnected ? 'connected' : 'disconnected'}</span></p>
          <p>Peer: <span className="text-sky-300">{connectionState}</span></p>
          <p>ICE: <span className="text-amber-300">{iceConnectionState}</span></p>
          <p>SDP: <span className="text-purple-300">{signalingState}</span></p>
        </div>

        {isConsultationStarted && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-2 top-2 z-10 flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 font-mono text-xs text-white shadow-lg sm:right-4 sm:top-4 sm:px-4 sm:py-2 sm:text-sm"
          >
            <div className="h-2 w-2 rounded-full bg-red-200 animate-pulse" />
            {formatDuration(duration)}
          </motion.div>
        )}
      </div>
    </div>
  );
}
