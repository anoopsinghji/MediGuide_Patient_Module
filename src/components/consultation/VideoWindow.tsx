import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, PhoneOff } from 'lucide-react';

type CallAdapter = {
  mount?: (container: HTMLDivElement) => void;
  setMeetingUI?: (config: Record<string, unknown>) => void;
  insertMeetingUI?: (container: HTMLDivElement) => void;
};

interface VideoWindowProps {
  callRef: React.MutableRefObject<CallAdapter | null>;
  isConnected: boolean;
  doctorName: string;
  duration: number;
  connectionState?: string;
  iceConnectionState?: string;
  signalingState?: string;
  socketConnected?: boolean;
  onLeave: () => void;
}

export function VideoWindow({
  callRef,
  isConnected,
  doctorName,
  duration,
  connectionState = 'new',
  iceConnectionState = 'new',
  signalingState = 'stable',
  socketConnected = false,
  onLeave,
}: VideoWindowProps) {
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (callRef.current && videoContainerRef.current) {
      if (typeof callRef.current.mount === 'function') {
        callRef.current.mount(videoContainerRef.current);
        return;
      }

      if (typeof callRef.current.setMeetingUI === 'function') {
        callRef.current.setMeetingUI({ showParticipantsPanel: false });
      }
      if (typeof callRef.current.insertMeetingUI === 'function') {
        callRef.current.insertMeetingUI(videoContainerRef.current);
      }
    }
  }, [callRef]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-700 bg-gray-900 shadow-2xl"
    >
      {/* Video Container */}
      <div className="relative flex-1 min-h-0 bg-black">
        {!isConnected ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
            <p className="text-white text-lg font-medium">Connecting to Dr. {doctorName}...</p>
            <p className="text-gray-400 mt-2">Please ensure your camera and microphone are working</p>
          </div>
        ) : (
          <div ref={videoContainerRef} className="w-full h-full" />
        )}

        {/* Duration Badge */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-2 top-2 z-10 flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 font-mono text-xs text-white shadow-lg sm:right-4 sm:top-4 sm:px-4 sm:py-2 sm:text-sm"
          >
            <div className="w-2 h-2 bg-red-200 rounded-full animate-pulse" />
            {formatDuration(duration)}
          </motion.div>
        )}

        <div className="absolute left-2 top-2 z-10 rounded-lg border border-white/10 bg-black/70 px-2.5 py-2 text-[11px] text-gray-200 backdrop-blur sm:left-4 sm:top-4 sm:text-xs">
          <p>Socket: <span className={socketConnected ? 'text-emerald-400' : 'text-red-400'}>{socketConnected ? 'connected' : 'disconnected'}</span></p>
          <p>Peer: <span className="text-sky-300">{connectionState}</span></p>
          <p>ICE: <span className="text-amber-300">{iceConnectionState}</span></p>
          <p>SDP: <span className="text-purple-300">{signalingState}</span></p>
        </div>

        {/* Doctor Name Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg text-sm backdrop-blur"
        >
          Dr. {doctorName}
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex justify-center border-t border-gray-700 bg-gray-800 p-3 sm:p-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onLeave}
          className="flex min-h-11 items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-red-700 sm:px-8 sm:py-3 sm:text-base"
        >
          <PhoneOff className="w-5 h-5" />
          End Consultation
        </motion.button>
      </div>
    </motion.div>
  );
}
