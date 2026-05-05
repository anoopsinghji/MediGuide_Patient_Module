import { motion } from 'framer-motion';

export default function HeroIllustration() {
  return (
    <motion.svg
      viewBox="0 0 400 400"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-lg drop-shadow-2xl mx-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Soft Glow */}
      <circle cx="200" cy="200" r="160" fill="url(#core-glow)" opacity="0.35" />
      
      {/* Connecting Path (Traveler to Doctor) */}
      <motion.path
        d="M 120 220 Q 200 120 280 220"
        stroke="#3fd9ec"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="10 10"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
      />
      
      {/* Patient/Traveler Node */}
      <motion.g
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <circle cx="120" cy="220" r="45" fill="#fff" fillOpacity="0.1" stroke="#fff" strokeWidth="2" />
        <circle cx="120" cy="205" r="14" fill="#fff" />
        <path d="M 95 240 Q 120 215 145 240" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
        {/* Suitcase identifier */}
        <rect x="80" y="235" width="20" height="24" rx="4" fill="#3fd9ec" />
        <rect x="85" y="230" width="10" height="5" fill="#fff" opacity="0.8" />
      </motion.g>

      {/* Doctor Node */}
      <motion.g
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <circle cx="280" cy="220" r="45" fill="#fff" fillOpacity="0.15" stroke="#fff" strokeWidth="2" />
        <circle cx="280" cy="205" r="14" fill="#fff" />
        <path d="M 255 240 Q 280 215 305 240" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
        {/* Stethoscope detail */}
        <circle cx="295" cy="195" r="5" fill="#3fd9ec" />
        <path d="M 295 195 L 305 220" stroke="#3fd9ec" strokeWidth="2" />
      </motion.g>

      {/* Floating Trust Badges */}
      <motion.g
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      >
        <rect x="135" y="60" width="130" height="36" rx="18" fill="#fff" opacity="0.95" />
        <rect x="142" y="66" width="24" height="24" rx="12" fill="#10b981" />
        <path d="M 148 78 L 152 82 L 160 72" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <text x="175" y="82" fill="#0f172a" fontSize="12" fontFamily="sans-serif" fontWeight="bold">NMC Verified</text>
      </motion.g>

      <defs>
        <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#3fd9ec" stopOpacity="0" />
        </radialGradient>
      </defs>
    </motion.svg>
  );
}