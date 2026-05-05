import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface QuickStatsCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  color: 'blue' | 'green' | 'orange' | 'teal' | 'purple' | 'pink';
  trend?: number[];
  index?: number;
}

const colorClasses = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  orange: 'bg-orange-50 border-orange-200 text-orange-700',
  teal: 'bg-teal-50 border-teal-200 text-teal-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  pink: 'bg-pink-50 border-pink-200 text-pink-700',
};

const iconColorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  orange: 'bg-orange-100 text-orange-600',
  teal: 'bg-teal-100 text-teal-600',
  purple: 'bg-purple-100 text-purple-600',
  pink: 'bg-pink-100 text-pink-600',
};

const sparklineStroke = {
  blue: '#2563eb',
  green: '#16a34a',
  orange: '#ea580c',
  teal: '#0d9488',
  purple: '#9333ea',
  pink: '#db2777',
};

export function QuickStatsCard({
  icon,
  label,
  value,
  color,
  trend,
  index = 0,
}: QuickStatsCardProps) {
  const hasTrend = Array.isArray(trend) && trend.length > 1;
  const chartWidth = 110;
  const chartHeight = 28;
  const trendMin = hasTrend ? Math.min(...trend) : 0;
  const trendMax = hasTrend ? Math.max(...trend) : 0;
  const trendRange = Math.max(trendMax - trendMin, 1);
  const trendPoints = hasTrend
    ? trend
        .map((item, itemIndex) => {
          const x = (itemIndex / Math.max(trend.length - 1, 1)) * chartWidth;
          const y = chartHeight - ((item - trendMin) / trendRange) * chartHeight;
          return `${x},${y}`;
        })
        .join(' ')
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
      className={`p-6 rounded-lg border ${colorClasses[color]} transition-all cursor-default`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-600 mb-2">{label}</div>
          <div className="text-3xl font-bold">{value}</div>
          {hasTrend && (
            <div className="mt-2">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="h-7 w-28"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <polyline
                  points={trendPoints}
                  fill="none"
                  stroke={sparklineStroke[color]}
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
        <div
          className={`${iconColorClasses[color]} p-3 rounded-full flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
