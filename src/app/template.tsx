'use client';

import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <AnimatePresence mode="popLayout">
      <motion.div key={pathname}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
} 