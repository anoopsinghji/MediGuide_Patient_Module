import { motion } from 'framer-motion';

export default function Network() {
  return (
    <div className="w-full flex justify-center p-8 relative">
      <motion.svg
        width="100%"
        height="300"
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="max-w-md"
      >
        {/* Nodes connecting */}
        {[
          { path: "M 200 150 L 100 50", delay: 0 },
          { path: "M 200 150 L 300 80", delay: 0.3 },
          { path: "M 200 150 L 80 220", delay: 0.6 },
          { path: "M 200 150 L 320 250", delay: 0.9 },
        ].map((line, idx) => (
          <motion.path
            key={idx}
            d={line.path}
            stroke="currentColor"
            className="text-white/20"
            strokeWidth="3"
            fill="transparent"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 1, delay: line.delay }}
            viewport={{ once: true }}
          />
        ))}

        {/* Central Node */}
        <motion.circle
          cx="200"
          cy="150"
          r="18"
          className="fill-cyan-400"
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        />
        
        {/* Outer Nodes */}
        {[
          { cx: 100, cy: 50, delay: 0.5 },
          { cx: 300, cy: 80, delay: 0.8 },
          { cx: 80, cy: 220, delay: 1.1 },
          { cx: 320, cy: 250, delay: 1.4 },
        ].map((node, idx) => (
          <motion.circle
            key={idx}
            cx={node.cx}
            cy={node.cy}
            r="12"
            className="fill-cyan-400"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: node.delay }}
            viewport={{ once: true }}
          />
        ))}
      </motion.svg>
    </div>
  );
}
