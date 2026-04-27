import React, { useRef, useState } from 'react';
import { IDCardData } from '../types.ts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils.ts';
import { 
  User, 
  IdCard, 
  MapPin, 
  Phone, 
  Calendar, 
  Camera, 
  Upload, 
  CheckCircle2, 
  Info,
  ChevronRight,
  BookOpen,
  Mail
} from 'lucide-react';

interface StudentFormProps {
  data: IDCardData;
  onChange: (updates: Partial<IDCardData>) => void;
  onSubmit: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ data, onChange, onSubmit }) => {
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'signatureUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const photo = canvasRef.current.toDataURL('image/png');
        onChange({ photoUrl: photo });
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-10">
        {/* Personal Details */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Personal Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text" 
                  value={data.name}
                  onChange={(e) => onChange({ name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Student ID No.</label>
              <div className="relative group">
                <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text" 
                  value={data.idNo}
                  onChange={(e) => onChange({ idNo: e.target.value })}
                  placeholder="STD-2024-001"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Academic Details */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Academic Details</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Branch / Department</label>
              <select 
                value={data.branch}
                onChange={(e) => onChange({ branch: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all appearance-none"
              >
                <option value="">Select Branch</option>
                <option value="Computer Engineering">Computer Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="AI & Data Science">AI & Data Science</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Academic Level</label>
              <select 
                value={data.level}
                onChange={(e) => onChange({ level: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all appearance-none"
              >
                <option value="">Select Level</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="PhD Candidate">PhD Candidate</option>
              </select>
            </div>
          </div>
        </section>

        {/* Assets Upload */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Camera className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Identity Assets</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Photo Upload */}
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Profile Photo</label>
              <div className="relative group">
                {data.photoUrl ? (
                  <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border-2 border-blue-100 group">
                    <img src={data.photoUrl} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button 
                        onClick={() => onChange({ photoUrl: '' })}
                        className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-xl text-white transition-all"
                      >
                        <Upload className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-[4/5] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'photoUrl')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-500">Click to upload or drag photo</p>
                    <button 
                      onClick={(e) => { e.preventDefault(); startCamera(); }}
                      className="mt-4 flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                      <Camera className="w-3 h-3" />
                      Use Camera
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Signature Upload */}
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Digital Signature</label>
              <div className="relative group">
                {data.signatureUrl ? (
                  <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden border-2 border-blue-100 group bg-slate-50 flex items-center justify-center p-4">
                    <img src={data.signatureUrl} className="max-w-full max-h-full object-contain" alt="Signature" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => onChange({ signatureUrl: '' })}
                        className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-xl text-white transition-all"
                      >
                        <Upload className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-[2/1] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'signatureUrl')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                      <Upload className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500">Upload signature image</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Details */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Contact Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Mobile Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="tel" 
                  value={data.mobile}
                  onChange={(e) => onChange({ mobile: e.target.value })}
                  placeholder="+91 9324333333"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Date of Birth</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="date" 
                  value={data.dob}
                  onChange={(e) => onChange({ dob: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="email" 
                  value={data.email}
                  onChange={(e) => onChange({ email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Current Address</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <textarea 
                  value={data.address}
                  onChange={(e) => onChange({ address: e.target.value })}
                  placeholder="Enter your full residential address..."
                  rows={3}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </section>

        <button 
          onClick={onSubmit}
          className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5" />
          Submit Application
        </button>
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={stopCamera}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-black tracking-tight">Capture Photo</h3>
                <button onClick={stopCamera} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <ChevronRight className="w-6 h-6 rotate-90" />
                </button>
              </div>
              <div className="aspect-video bg-black relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="p-8 flex justify-center">
                <button 
                  onClick={capturePhoto}
                  className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center border-8 border-blue-100 shadow-xl hover:scale-110 transition-transform active:scale-95"
                >
                  <div className="w-6 h-6 bg-white rounded-full" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentForm;
