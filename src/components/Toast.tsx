/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto bg-white border border-slate-200 shadow-2xl rounded-xl overflow-hidden flex flex-col"
            id={`toast-${toast.id}`}
          >
            {/* National red/white top stripe */}
            <div className="h-1 w-full bg-gradient-to-r from-red-600 via-white to-red-600" />
            
            <div className="p-4 flex gap-3 items-start">
              <div className="flex-shrink-0 mt-0.5">
                {toast.type === 'success' && (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                )}
                {toast.type === 'warning' && (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
                {toast.type === 'info' && (
                  <Info className="h-5 w-5 text-blue-600" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                  {toast.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed whitespace-pre-line font-mono">
                  {toast.description}
                </p>
              </div>
              
              <button
                onClick={() => onRemove(toast.id)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-all"
                aria-label="Cerrar notificación"
                id={`close-toast-${toast.id}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
