import React from 'react';

export const MultilingualIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      className={`w-full h-full ${className}`}
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background/Backdrop */}
      <rect width="400" height="300" rx="24" fill="currentColor" className="text-blue-50 dark:text-slate-800/50" />
      
      {/* Abstract Globe/Connections */}
      <circle cx="200" cy="150" r="100" stroke="currentColor" strokeWidth="2" className="text-blue-200 dark:text-slate-700" strokeDasharray="8 8" />
      <path d="M100 150 Q200 50 300 150" stroke="currentColor" strokeWidth="2" className="text-blue-200 dark:text-slate-700" fill="none" />
      <path d="M100 150 Q200 250 300 150" stroke="currentColor" strokeWidth="2" className="text-blue-200 dark:text-slate-700" fill="none" />
      <path d="M200 50 Q100 150 200 250" stroke="currentColor" strokeWidth="2" className="text-blue-200 dark:text-slate-700" fill="none" />
      <path d="M200 50 Q300 150 200 250" stroke="currentColor" strokeWidth="2" className="text-blue-200 dark:text-slate-700" fill="none" />

      {/* Primary Chat Bubble (English 'A') */}
      <g transform="translate(100, 80)">
        <path d="M0 20 C0 8.954 8.954 0 20 0 H80 C91.046 0 100 8.954 100 20 V70 C100 81.046 91.046 90 80 90 H40 L10 110 V90 C4.477 90 0 85.523 0 80 V20 Z" 
              fill="currentColor" className="text-blue-500 shadow-lg" />
        <text x="50" y="58" fill="white" fontSize="42" fontFamily="system-ui, sans-serif" fontWeight="bold" textAnchor="middle">A</text>
      </g>

      {/* Translation icon / arrows */}
      <g transform="translate(180, 130)" className="text-emerald-400">
        <circle cx="20" cy="20" r="28" fill="white" className="dark:fill-slate-900 shadow-md" />
        <path d="M12 16h16M24 12l4 4-4 4M28 24H12M16 28l-4-4 4-4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Secondary Chat Bubble (Japanese 'あ' or Translation) */}
      <g transform="translate(190, 140)">
        <path d="M100 20 C100 8.954 91.046 0 80 0 H20 C8.954 0 0 8.954 0 20 V80 C0 85.523 4.477 90 10 90 V110 L40 90 H80 C91.046 90 100 81.046 100 70 V20 Z" 
              fill="currentColor" className="text-indigo-500 shadow-lg" />
        <text x="50" y="58" fill="white" fontSize="38" fontFamily="system-ui, sans-serif" fontWeight="bold" textAnchor="middle">あ</text>
      </g>
    </svg>
  );
};
