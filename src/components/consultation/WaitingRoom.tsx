import { motion } from 'framer-motion';
import { Clock, Mic, Camera, Wifi } from 'lucide-react';

interface WaitingRoomProps {
  doctorName: string;
  doctorSpecialty: string;
  doctorImage?: string;
}

export function WaitingRoom({ doctorName, doctorSpecialty, doctorImage }: WaitingRoomProps) {
  const checklistItems = [
    { icon: Wifi, label: 'Good internet connection' },
    { icon: Camera, label: 'Camera is working' },
    { icon: Mic, label: 'Microphone is working' },
    { icon: Clock, label: 'You are on time' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-blue-50 to-white p-6 rounded-lg"
    >
      {/* Doctor Image */}
      {doctorImage && (
        <motion.img
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          src={doctorImage}
          alt={doctorName}
          className="w-24 h-24 rounded-full border-4 border-blue-400 mb-4 object-cover shadow-lg"
        />
      )}

      {/* Status */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Waiting for Dr. {doctorName}</h2>
        <p className="text-gray-600">{doctorSpecialty}</p>
        <div className="mt-4 flex justify-center">
          <div className="flex gap-2">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-3 h-3 rounded-full bg-blue-500"
            />
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              className="w-3 h-3 rounded-full bg-blue-500"
            />
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              className="w-3 h-3 rounded-full bg-blue-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Checklist */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-3 w-full max-w-sm"
      >
        <p className="text-sm font-semibold text-gray-700 mb-4">Before your consultation:</p>
        {checklistItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
            >
              <Icon className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <span className="text-gray-700 text-sm">{item.label}</span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-sm text-center"
      >
        <p className="text-sm text-blue-900">
          💡 Tip: Ensure you have good lighting and a quiet, private location for the best consultation experience.
        </p>
      </motion.div>
    </motion.div>
  );
}
