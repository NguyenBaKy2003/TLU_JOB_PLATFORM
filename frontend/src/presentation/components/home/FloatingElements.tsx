"use client";
import { motion } from "framer-motion";
import { Sparkles, Zap, Star, Briefcase } from "lucide-react";

export function FloatingElements() {
  return (
    <>
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 text-yellow-500/20"
      >
        <Sparkles size={60} />
      </motion.div>
      
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-40 right-10 text-blue-500/20"
      >
        <Zap size={50} />
      </motion.div>
      
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/3 right-1/4 text-purple-500/20"
      >
        <Star size={40} />
      </motion.div>
      
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-1/4 left-1/4 text-emerald-500/20"
      >
        <Briefcase size={45} />
      </motion.div>
    </>
  );
}