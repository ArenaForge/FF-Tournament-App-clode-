import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/home", { replace: true }), 2200);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none [background-image:linear-gradient(rgba(255,106,26,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,106,26,0.6)_1px,transparent_1px)] [background-size:36px_36px]" />

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative flex flex-col items-center"
      >
        <motion.div
          animate={{ boxShadow: ["0 0 20px rgba(255,106,26,0.3)", "0 0 50px rgba(255,106,26,0.55)", "0 0 20px rgba(255,106,26,0.3)"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange to-orange-deep flex items-center justify-center mb-6"
          style={{ clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)" }}
        >
          <span className="font-display font-black text-void text-3xl">F</span>
        </motion.div>

        <h1 className="font-display font-black text-3xl text-ink tracking-wide">
          FF MAX <span className="text-orange">ARENA</span>
        </h1>
        <p className="font-mono text-xs text-ink-muted uppercase tracking-[0.3em] mt-2">
          Deploy. Compete. Win.
        </p>
      </motion.div>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "60%" }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="absolute bottom-16 h-0.5 bg-gradient-to-r from-transparent via-orange to-transparent rounded-full"
      />
    </div>
  );
}
