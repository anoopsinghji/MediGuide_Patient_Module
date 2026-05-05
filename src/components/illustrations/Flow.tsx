import { motion } from 'framer-motion';

export default function Flow() {
  return (
    <div className="w-full flex justify-center my-10 relative">
      <motion.svg
        width="100%"
        height="120"
        viewBox="0 0 800 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="max-w-4xl"
      >
        <motion.path
          d="M 50 60 C 200 10 300 110 400 60 C 500 10 600 110 750 60"
          stroke="currentColor"
          className="text-cyan-200"
          strokeWidth="4"
          strokeDasharray="8 8"
          fill="transparent"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          viewport={{ once: true, margin: "-50px" }}
        />
        <motion.circle
          cx="50"
          cy="60"
          r="10"
          className="fill-primary-500"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        />
        <motion.circle
          cx="400"
          cy="60"
          r="10"
          className="fill-cyan-500"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          viewport={{ once: true }}
        />
        <motion.circle
          cx="750"
          cy="60"
          r="10"
          className="fill-primary-600"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1.8 }}
          viewport={{ once: true }}
        />
      </motion.svg>
    </div>
  );
}
