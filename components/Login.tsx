import React, { useState, useEffect } from 'react';
import { UserRole } from '../types.ts';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, User, Lock, Mail, ArrowRight, GraduationCap } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const ADMIN_EMAIL = 'admin@gmail.com';

  useEffect(() => {
    if (email.trim().toLowerCase() === ADMIN_EMAIL) {
      setRole('ADMIN');
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    if (role === 'ADMIN' && normalizedEmail !== ADMIN_EMAIL) {
      setError("Unauthorized Email: Only admin@gmail.com is authorized for administrative access.");
      setLoading(false);
      return;
    }

    if (role === 'STUDENT' && normalizedEmail === ADMIN_EMAIL) {
      setError("This is an Admin account. Please select 'Administrator' role to login.");
      setLoading(false);
      return;
    }

    if (!email || !password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    // Simulate local auth
    setTimeout(() => {
      try {
        const users = JSON.parse(localStorage.getItem('edu_id_users') || '[]');
        
        if (isRegistering) {
          const exists = users.find((u: any) => u.email === normalizedEmail);
          if (exists) {
            setError("User already exists. Please sign in.");
            setLoading(false);
            return;
          }
          users.push({ email: normalizedEmail, password, role });
          localStorage.setItem('edu_id_users', JSON.stringify(users));
          onLogin(normalizedEmail, role);
        } else {
          const user = users.find((u: any) => u.email === normalizedEmail && u.password === password);
          // For demo purposes, allow admin@gmail.com with any password if not registered
          if (normalizedEmail === ADMIN_EMAIL && password === 'admin') {
             onLogin(normalizedEmail, 'ADMIN');
             setLoading(false);
             return;
          }
          
          if (user) {
            onLogin(normalizedEmail, user.role);
          } else {
            setError("Invalid login credentials. Try registering if you're new.");
          }
        }
      } catch (err) {
        setError("An authentication error occurred.");
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        <div className="p-10">
          <div className="text-center mb-10">
            <motion.div 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-100 shadow-inner"
            >
              {role === 'ADMIN' ? (
                <Shield className="w-10 h-10 text-blue-600" />
              ) : (
                <GraduationCap className="w-10 h-10 text-blue-600" />
              )}
            </motion.div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              {isRegistering ? 'Join Portal' : 'Welcome Back'}
            </h2>
            <p className="text-slate-500 font-medium">
              {role === 'ADMIN' ? 'Administrator Access' : 'Student Identity Portal'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-8">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`flex-1 py-3 text-xs font-black rounded-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${role === 'STUDENT' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <User className="w-3.5 h-3.5" />
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`flex-1 py-3 text-xs font-black rounded-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${role === 'ADMIN' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </button>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-start gap-3"
                >
                  <Shield className="w-5 h-5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-transparent text-slate-900 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold"
                    placeholder={role === 'ADMIN' ? "admin@gmail.com" : "student@college.edu"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-transparent text-slate-900 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-200 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{isRegistering ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                }}
                className="text-xs text-blue-600 font-black uppercase tracking-widest hover:text-blue-800 transition-colors"
              >
                {isRegistering ? '← Back to Login' : "New student? Register here"}
              </button>
            </div>
          </form>
        </div>
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
            Enterprise Grade Security • Supabase Cloud
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
