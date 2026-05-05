import { motion } from 'framer-motion';
import { Wallet, TrendingUp, ArrowRight } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

type MonthlyEarningPoint = {
  month: string;
  earnings: number;
  count?: number;
};

interface EarningsPreviewCardProps {
  monthlyEarnings?: number;
  totalEarnings?: number;
  consultationCount?: number;
  monthlyTrend?: MonthlyEarningPoint[];
  onViewDetails?: () => void;
}

export function EarningsPreviewCard({
  monthlyEarnings = 0,
  totalEarnings = 0,
  consultationCount = 0,
  monthlyTrend = [],
  onViewDetails,
}: EarningsPreviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Earnings This Month</h3>
        </div>
        <TrendingUp className="w-5 h-5 text-green-600" />
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-600 mb-1">Total Earned</div>
          <div className="text-3xl font-bold text-blue-900">
            ₹{monthlyEarnings.toLocaleString('en-IN')}
          </div>
        </div>

        {monthlyTrend.length > 0 && (
          <div className="h-24 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="earnings-area-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.38} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" hide />
                <Tooltip
                  formatter={(value) => [`₹${Number(value || 0).toLocaleString('en-IN')}`, 'Earnings']}
                  labelFormatter={(label) => `Month: ${label}`}
                  cursor={{ stroke: '#93c5fd', strokeDasharray: '3 3' }}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="#2563eb"
                  strokeWidth={2.4}
                  fill="url(#earnings-area-gradient)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-200">
          <div>
            <div className="text-xs text-gray-600 mb-1">Consultations</div>
            <div className="text-lg font-semibold text-gray-900">{consultationCount}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Total (All Time)</div>
            <div className="text-lg font-semibold text-gray-900">
              ₹{totalEarnings.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {onViewDetails && (
          <motion.button
            whileHover={{ x: 4 }}
            onClick={onViewDetails}
            className="w-full mt-4 flex items-center justify-center gap-2 p-2 bg-white hover:bg-gray-50 text-blue-600 font-medium text-sm rounded-lg transition-colors border border-blue-200"
          >
            View detailed earnings <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
