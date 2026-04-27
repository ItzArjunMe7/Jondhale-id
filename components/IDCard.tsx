import React, { useState } from 'react';
import { IDCardData } from '../types.ts';
import { COLLEGE_INFO, DEFAULT_PHOTO, DEFAULT_SIGNATURE } from '../constants.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils.ts';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Info,
  RotateCw,
  GraduationCap
} from 'lucide-react';

interface IDCardProps {
  data: IDCardData;
  scale?: number;
  idPrefix?: string;
}

const IDCard: React.FC<IDCardProps> = ({ data, scale = 1, idPrefix = "" }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Unique IDs for capture
  const combinedId = idPrefix ? `${idPrefix}-combined` : 'capture-combined-container';
  const frontId = idPrefix ? `${idPrefix}-front` : 'capture-front-container';
  const backId = idPrefix ? `${idPrefix}-back` : 'capture-back-container';

  const cardStyle = {
    transform: `scale(${scale})`,
    transformOrigin: 'top center',
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div 
        className="relative w-[340px] h-[540px] perspective-1000 cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
        style={cardStyle}
      >
        <motion.div 
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100, damping: 20 }}
          className="w-full h-full preserve-3d relative"
        >
          {/* FRONT SIDE */}
          <div className="absolute inset-0 backface-hidden bg-white rounded-[1.5rem] shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
            {/* Header */}
            <div className="bg-[#f0f7ff] p-3 flex items-center gap-3 border-b border-slate-100">
              <div className="w-[72px] h-[72px] ml-2 bg-white rounded-full border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                <img src={COLLEGE_INFO.logo} className="w-full h-full object-contain" alt="Logo" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 text-center pr-1">
                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider leading-tight">{COLLEGE_INFO.trust}</p>
                <h2 className="text-[14px] font-black text-[#e11d48] tracking-tight leading-tight my-0.5">{COLLEGE_INFO.name}</h2>
                <p className="text-[8px] font-semibold text-slate-700 leading-tight">{COLLEGE_INFO.address}</p>
                <p className="text-[8px] font-semibold text-slate-700 leading-tight">{COLLEGE_INFO.email}</p>
                <p className="text-[9px] font-bold text-slate-900 leading-tight mt-0.5">Contact No. {COLLEGE_INFO.phone}</p>
              </div>
            </div>

            {/* Sub-header */}
            <div className="px-4 py-1.5 text-center space-y-0.5">
              <h3 className="text-[10px] font-black text-blue-800 leading-tight uppercase tracking-tight">
                {COLLEGE_INFO.fullName}
              </h3>
              <p className="text-[7px] font-bold text-slate-400 italic leading-tight px-4">
                {COLLEGE_INFO.approval}
              </p>
            </div>

            {/* Academic Year */}
            <div className="flex justify-center mb-1">
              <div className="px-4 py-0.5 border border-slate-200 rounded-full text-[10px] font-black text-slate-700">
                2026-30
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-6 flex flex-col items-center">
              {/* Photo Section */}
              <div className="w-28 h-36 rounded-xl overflow-hidden border-2 border-red-500 shadow-lg bg-slate-100 mb-2">
                <img 
                  src={data.photoUrl || DEFAULT_PHOTO} 
                  className="w-full h-full object-cover" 
                  alt="Student" 
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Info Grid */}
              <div className="w-full space-y-3 px-2">
                {[
                  { label: 'NAME', value: data.name || '---' },
                  { label: 'ID NO.', value: data.idNo || '---' },
                  { label: 'LEVEL', value: data.level || '---' },
                  { label: 'BRANCH', value: data.branch || '---' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4 border-b border-slate-100 pb-1">
                    <p className="text-[9px] font-black text-slate-400 w-16 tracking-widest">{item.label}</p>
                    <p className="text-[9px] font-black text-slate-400">:</p>
                    <p className="text-[9px] font-black text-slate-800 uppercase flex-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Signatures */}
            <div className="px-6 py-2 flex items-end justify-between">
              <div className="flex flex-col items-center gap-1">
                <div className="h-8 w-24 border-b border-slate-200 flex items-center justify-center">
                  <img src={data.signatureUrl || DEFAULT_SIGNATURE} className="max-h-full object-contain" alt="Student Sign" referrerPolicy="no-referrer" />
                </div>
                <span className="text-[8px] font-black text-blue-700 uppercase tracking-widest">Student Sign.</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="h-8 w-24 border-b border-slate-200 flex items-center justify-center opacity-40">
                  <img src={DEFAULT_SIGNATURE} className="max-h-full object-contain grayscale" alt="Principal Sign" referrerPolicy="no-referrer" />
                </div>
                <span className="text-[8px] font-black text-blue-700 uppercase tracking-widest">Principal Sign.</span>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="h-2 bg-blue-600 w-full" />
          </div>

          {/* BACK SIDE */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-[1.5rem] shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
            {/* Top Image */}
            <div className="h-32 w-full overflow-hidden">
              <img src={COLLEGE_INFO.backImage} className="w-full h-full object-cover" alt="College" referrerPolicy="no-referrer" />
            </div>

            {/* Section Header */}
            <div className="bg-blue-600 py-2 text-center">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">General Information</h3>
            </div>

            {/* Info Content */}
            <div className="flex-1 p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Address</p>
                  <p className="text-[11px] font-black text-slate-800 leading-tight break-words whitespace-pre-wrap">{data.address || 'Not Provided'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</p>
                    <p className="text-[11px] font-black text-slate-800">{data.mobile || '---'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</p>
                    <p className="text-[11px] font-black text-slate-800">{data.dob || '---'}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-[11px] font-black text-slate-800">{data.email || '---'}</p>
                </div>
              </div>

              {/* Rules */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-[11px] font-black text-slate-800 underline mb-2 uppercase tracking-widest">Rules & Regulations:</h4>
                <ol className="text-[9px] font-bold text-slate-500 space-y-1 ml-3 list-decimal">
                  <li>The card is non-transferable.</li>
                  <li>Surrender card while leaving institute.</li>
                  <li>Report loss to office immediately.</li>
                </ol>
              </div>

              {/* Quote */}
              <div className="pt-4 text-center">
                <p className="text-[10px] font-bold text-slate-400 italic leading-relaxed px-4">
                  "Education is the most powerful weapon which you can use to change the world."
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="py-3 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Return to the college address if found.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <button 
        onClick={() => setIsFlipped(!isFlipped)}
        className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
      >
        <RotateCw className={cn("w-4 h-4 transition-transform duration-700", isFlipped && "rotate-180")} />
        Flip Identity Card
      </button>

      {/* Hidden capture container for high-quality export */}
      <div className="fixed -left-[9999px] top-0">
        <div id={combinedId} className="bg-white p-10 flex gap-10">
           {/* Front for capture */}
           <div id={frontId} className="w-[340px] h-[540px] bg-white rounded-[1.5rem] shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
              <div className="bg-[#f0f7ff] p-3 flex items-center gap-3 border-b border-slate-100">
                <div className="w-[72px] h-[72px] ml-2 bg-white rounded-full border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                  <img src={COLLEGE_INFO.logo} className="w-full h-full object-contain" alt="Logo" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 text-center pr-1">
                  <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider leading-tight">{COLLEGE_INFO.trust}</p>
                  <h2 className="text-[14px] font-black text-[#e11d48] tracking-tight leading-tight my-0.5">{COLLEGE_INFO.name}</h2>
                  <p className="text-[8px] font-semibold text-slate-700 leading-tight">{COLLEGE_INFO.address}</p>
                  <p className="text-[8px] font-semibold text-slate-700 leading-tight">{COLLEGE_INFO.email}</p>
                  <p className="text-[9px] font-bold text-slate-900 leading-tight mt-0.5">Contact No. {COLLEGE_INFO.phone}</p>
                </div>
              </div>
              <div className="px-4 py-1.5 text-center space-y-0.5">
                <h3 className="text-[10px] font-black text-blue-800 leading-tight uppercase tracking-tight">{COLLEGE_INFO.fullName}</h3>
                <p className="text-[7px] font-bold text-slate-400 italic leading-tight px-4">{COLLEGE_INFO.approval}</p>
              </div>
              <div className="flex justify-center mb-1">
                <div className="px-4 py-0.5 border border-slate-200 rounded-full text-[10px] font-black text-slate-700">2026-30</div>
              </div>
              <div className="flex-1 px-6 flex flex-col items-center">
                <div className="w-28 h-36 rounded-xl overflow-hidden border-2 border-red-500 shadow-lg bg-slate-100 mb-2">
                  <img src={data.photoUrl || DEFAULT_PHOTO} className="w-full h-full object-cover" alt="Student" referrerPolicy="no-referrer" />
                </div>
                <div className="w-full space-y-3 px-2">
                  {[
                    { label: 'NAME', value: data.name || '---' },
                    { label: 'ID NO.', value: data.idNo || '---' },
                    { label: 'LEVEL', value: data.level || '---' },
                    { label: 'BRANCH', value: data.branch || '---' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4 border-b border-slate-100 pb-1">
                      <p className="text-[9px] font-black text-slate-400 w-16 tracking-widest">{item.label}</p>
                      <p className="text-[9px] font-black text-slate-400">:</p>
                      <p className="text-[9px] font-black text-slate-800 uppercase flex-1">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-6 py-2 flex items-end justify-between">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-8 w-24 border-b border-slate-200 flex items-center justify-center">
                    <img src={data.signatureUrl || DEFAULT_SIGNATURE} className="max-h-full object-contain" alt="Student Sign" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-[8px] font-black text-blue-700 uppercase tracking-widest">Student Sign.</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-8 w-24 border-b border-slate-200 flex items-center justify-center opacity-40">
                    <img src={DEFAULT_SIGNATURE} className="max-h-full object-contain grayscale" alt="Principal Sign" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-[8px] font-black text-blue-700 uppercase tracking-widest">Principal Sign.</span>
                </div>
              </div>
              <div className="h-2 bg-blue-600 w-full" />
           </div>
           {/* Back for capture */}
           <div id={backId} className="w-[340px] h-[540px] bg-white rounded-[1.5rem] shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
              <div className="h-32 w-full overflow-hidden">
                <img src={COLLEGE_INFO.backImage} className="w-full h-full object-cover" alt="College" referrerPolicy="no-referrer" />
              </div>
              <div className="bg-blue-600 py-2 text-center">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">General Information</h3>
              </div>
              <div className="flex-1 p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Address</p>
                    <p className="text-[11px] font-black text-slate-800 leading-tight break-words whitespace-pre-wrap">{data.address || 'Not Provided'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</p>
                      <p className="text-[11px] font-black text-slate-800">{data.mobile || '---'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</p>
                      <p className="text-[11px] font-black text-slate-800">{data.dob || '---'}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-[11px] font-black text-slate-800">{data.email || '---'}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-[11px] font-black text-slate-800 underline mb-2 uppercase tracking-widest">Rules & Regulations:</h4>
                  <ol className="text-[9px] font-bold text-slate-500 space-y-1 ml-3 list-decimal">
                    <li>The card is non-transferable.</li>
                    <li>Surrender card while leaving institute.</li>
                    <li>Report loss to office immediately.</li>
                  </ol>
                </div>
                <div className="pt-4 text-center">
                  <p className="text-[10px] font-bold text-slate-400 italic leading-relaxed px-4">"Education is the most powerful weapon which you can use to change the world."</p>
                </div>
              </div>
              <div className="py-3 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Return to the college address if found.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default IDCard;
