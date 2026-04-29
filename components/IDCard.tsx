import React, { useState } from 'react';
import { IDCardData } from '../types.ts';
import { COLLEGE_INFO, DEFAULT_PHOTO, DEFAULT_SIGN, PRINCIPAL_SIGN, COLLEGE_BUILDING_IMAGE, COLLEGE_LOGO } from '../constants.tsx';

interface IDCardProps {
  data: IDCardData;
  scale?: number;
}

interface CardSideProps {
  data: IDCardData;
  id?: string;
}

interface IDCardExportCombinedProps {
  data: IDCardData;
  id?: string;
}

// Compact sizing but allowing for a slightly larger header
const CARD_WIDTH = '320px';
const CARD_HEIGHT = '480px';

const FrontSide: React.FC<CardSideProps> = ({ data, id }) => (
    <div id={id} className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 shrink-0 box-border" style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
      {/* Header Section - Increased height slightly to accommodate larger logo and text */}
      <div className="bg-[#EBF3FF] p-3 border-b border-gray-100 flex items-center" style={{ height: '110px' }}>
        <div className="flex-shrink-0 mr-3 ml-1">
           {/* Logo made bigger */}
           <img src={COLLEGE_LOGO} alt="Logo" className="w-16 h-16 object-contain rounded-full bg-white p-0.5 shadow-sm border border-blue-50" />
        </div>
        <div className="flex-1 text-center">
          {/* Header text made larger */}
          <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tight leading-none mb-1">{COLLEGE_INFO.trustName}</p>
          <p className="text-[15px] font-black text-red-600 leading-tight mb-1">{COLLEGE_INFO.campusName}</p>
          <div className="space-y-0.5 text-gray-700">
            <p className="text-[8px] font-medium leading-none">{COLLEGE_INFO.location}</p>
            <p className="text-[8px] font-medium leading-none">{COLLEGE_INFO.email}</p>
            <p className="text-[8px] font-bold leading-none">{COLLEGE_INFO.contact}</p>
          </div>
        </div>
      </div>

      <div className="p-2 flex flex-col items-center text-center flex-1">
        <h1 className="text-[10px] font-black text-blue-800 leading-tight uppercase mb-0.5 px-1">{COLLEGE_INFO.collegeName}</h1>
        <p className="text-[6px] text-gray-400 leading-tight mb-1.5 px-3 italic font-medium">{COLLEGE_INFO.accreditation}</p>
        
        {/* Academic Year Pill */}
        <div className="mb-2">
          <p className="text-[9px] font-black text-gray-700 bg-white px-4 py-0.5 rounded-full border border-gray-200">{COLLEGE_INFO.academicYear}</p>
        </div>

        {/* Student Photo */}
        <div className="w-24 h-28 mb-3 border-2 border-red-500 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
          <img src={data.photoUrl || DEFAULT_PHOTO} alt="Student" className="w-full h-full object-cover" />
        </div>

        {/* Info Rows */}
        <div className="w-full space-y-2 text-left text-[10px] font-bold text-gray-900 px-4">
          <div className="flex items-center">
            <span className="w-14 text-gray-400 uppercase text-[8px] font-black">NAME</span>
            <span className="mr-3 text-gray-900">:</span>
            <span className="flex-1 uppercase font-black truncate">{data.name || '---'}</span>
          </div>
          <div className="flex items-center border-t border-gray-50 pt-1.5">
            <span className="w-14 text-gray-400 uppercase text-[8px] font-black">ID NO.</span>
            <span className="mr-3 text-gray-900">:</span>
            <span className="flex-1 font-black truncate uppercase">{data.idNo || '---'}</span>
          </div>
          <div className="flex items-center border-t border-gray-50 pt-1.5">
            <span className="w-14 text-gray-400 uppercase text-[8px] font-black">LEVEL</span>
            <span className="mr-3 text-gray-900">:</span>
            <span className="flex-1 font-black truncate uppercase">{data.level || '---'}</span>
          </div>
          <div className="flex items-center border-t border-gray-50 pt-1.5">
            <span className="w-14 text-gray-400 uppercase text-[8px] font-black">BRANCH</span>
            <span className="mr-3 text-gray-900">:</span>
            <span className="flex-1 uppercase font-black truncate">{data.branch || '---'}</span>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-auto w-full flex justify-between items-end px-4 pb-1 pt-3">
          <div className="flex flex-col items-center w-20">
            <div className="h-5 w-full border-b border-gray-300 flex items-center justify-center mb-0.5 overflow-hidden">
              <img src={data.signatureUrl || DEFAULT_SIGN} alt="Student Sign" className="max-h-full max-w-full object-contain" />
            </div>
            <span className="text-[6px] font-black text-blue-600 uppercase">STUDENT SIGN.</span>
          </div>
          <div className="flex flex-col items-center w-20">
            <div className="h-5 w-full flex items-center justify-center mb-0.5 overflow-hidden">
               <img src={PRINCIPAL_SIGN} alt="Principal Sign" className="max-h-full max-w-full object-contain opacity-80" />
            </div>
            <span className="text-[6px] font-black text-blue-600 uppercase">PRINCIPAL SIGN.</span>
          </div>
        </div>
      </div>
      
      {/* Footer Bottom Bar */}
      <div className="h-2 bg-blue-600 w-full mt-auto"></div>
    </div>
  );

const BackSide: React.FC<CardSideProps> = ({ data, id }) => (
    <div id={id} className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 shrink-0 box-border" style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
      <div className="h-24 w-full overflow-hidden border-b border-gray-100 relative shrink-0">
        <img src={COLLEGE_BUILDING_IMAGE} alt="College Building" className="w-full h-full object-cover" />
      </div>
      
      {/* General Information Bar */}
      <div className="w-full text-center bg-[#2B6BE5] py-1.5 shrink-0">
        <h2 className="text-white text-[10px] font-black uppercase tracking-[0.2em]">General Information</h2>
      </div>

      <div className="p-4 flex flex-col flex-1 space-y-3">
        <div className="space-y-3">
          <div className="flex flex-col">
            <label className="text-gray-400 text-[8px] uppercase font-black tracking-widest mb-0.5">Current Address</label>
            <p className="text-gray-800 font-bold text-[10px] leading-tight break-words line-clamp-2">
              {data.address || 'Not Provided'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-[8px] uppercase font-black tracking-widest mb-0.5">Mobile Number</label>
              <p className="text-gray-900 font-black text-[11px]">{data.mobile || '---'}</p>
            </div>
            <div>
              <label className="text-gray-400 text-[8px] uppercase font-black tracking-widest mb-0.5">Date of Birth</label>
              <p className="text-gray-900 font-black text-[11px]">{data.dob || '---'}</p>
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-[8px] uppercase font-black tracking-widest mb-0.5">Email Address</label>
            <p className="text-gray-900 font-black text-[11px] lowercase truncate">{data.email || '---'}</p>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <p className="text-[9px] font-black text-gray-800 mb-1.5 uppercase tracking-widest underline decoration-2 underline-offset-2">RULES & REGULATIONS:</p>
          <ul className="text-[8px] text-gray-500 space-y-1 font-bold leading-tight">
            <li className="flex gap-1"><span>1.</span> The card is non-transferable.</li>
            <li className="flex gap-1"><span>2.</span> Surrender card while leaving institute.</li>
            <li className="flex gap-1"><span>3.</span> Report loss to office immediately.</li>
          </ul>
        </div>

        <div className="mt-auto pt-2 text-center">
          <p className="text-[9px] text-gray-400 italic leading-snug px-2 font-bold">
            "Education is the most powerful weapon which you can use to change the world."
          </p>
        </div>
      </div>
      
      {/* Footer Return Notice Bar */}
      <div className="py-2 bg-gray-50 text-center border-t border-gray-100 shrink-0">
         <p className="text-[8px] text-gray-400 font-black uppercase tracking-wider">RETURN TO THE COLLEGE ADDRESS IF FOUND.</p>
      </div>
    </div>
  );

export const IDCardExportCombined: React.FC<IDCardExportCombinedProps> = ({ data, id }) => (
  <div id={id} className="flex flex-row p-8 bg-white gap-8 items-center justify-center" style={{ width: '720px', height: '540px' }}>
    <FrontSide data={data} />
    <BackSide data={data} />
  </div>
);

const IDCard: React.FC<IDCardProps> = ({ data, scale = 1 }) => {
  const [isFront, setIsFront] = useState(true);

  const containerStyle = {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    transform: `scale(${scale})`,
    transformOrigin: 'top center',
  };

  return (
    <div className="flex flex-col items-center">
      <div style={containerStyle} className="transition-all duration-500 relative">
        {isFront ? <FrontSide data={data} id="id-card-front" /> : <BackSide data={data} id="id-card-back" />}
      </div>
      
      {/* Capture Area with exact pixel sizing to avoid scaling mismatch */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none">
        <div id="capture-front-container"><FrontSide data={data} /></div>
        <div id="capture-back-container"><BackSide data={data} /></div>
        <IDCardExportCombined data={data} id="capture-combined-container" />
      </div>
      
      <button 
        onClick={() => setIsFront(!isFront)} 
        className="mt-4 no-print px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-50 transform active:scale-95"
      >
        Flip View
      </button>
    </div>
  );
};

export default IDCard;
