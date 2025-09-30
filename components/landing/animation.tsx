// components/AnimateOnView.tsx
"use client"
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, ReactNode } from "react";

type Props = {
  children: ReactNode;
  animation: "slideDown" | "slideUp" | "slideLeft" | "slideRight" | "fadeIn";
  duration?: number;
};

export default function AnimateOnView({ children, animation, duration = 0.8 }: Props) {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true });

  const variants = {
    slideDown: { hidden: { y: -50, opacity: 0 }, visible: { y: 0, opacity: 1 } },
    slideUp: { hidden: { y: 50, opacity: 0 }, visible: { y: 0, opacity: 1 } },
    slideLeft: { hidden: { x: 50, opacity: 0 }, visible: { x: 0, opacity: 1 } },
    slideRight: { hidden: { x: -50, opacity: 0 }, visible: { x: 0, opacity: 1 } },
    fadeIn: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  };

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants[animation]}
      transition={{ duration }}
    >
      {children}
    </motion.div>
  );
}
