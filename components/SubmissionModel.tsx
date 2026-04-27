import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubmissionModal: React.FC<SubmissionModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full p-10 text-center relative z-10 border border-slate-100"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100 shadow-inner">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Success!</h3>
            <p className="text-slate-500 mb-10 font-medium leading-relaxed">
              Your ID card application has been submitted successfully and is now awaiting administrative review.
            </p>
            
            <button
              onClick={onClose}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all transform active:scale-95 shadow-xl shadow-blue-200 uppercase tracking-widest text-xs"
            >
              Back to Dashboard
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SubmissionModal;
