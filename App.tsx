import React, { useState, useEffect, useMemo } from 'react';
import { IDCardData, UserRole, AuthState } from './types.ts';
import Login from './components/Login.tsx';
import StudentForm from './components/StudentForm.tsx';
import IDCard from './components/IDCard.tsx';
import SubmissionModal from './components/SubmissionModal.tsx';
import { DEFAULT_PHOTO, BRANCHES } from './constants.tsx';
import * as htmlToImage from 'html-to-image';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './utils.ts';
import { 
  LogOut, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  User,
  LayoutDashboard,
  GraduationCap,
  RefreshCw,
  Bell
} from 'lucide-react';

const INITIAL_FORM_STATE: IDCardData = {
  id: '',
  name: '',
  idNo: '',
  branch: '',
  level: '',
  photoUrl: '',
  signatureUrl: '',
  address: '',
  mobile: '',
  email: '',
  dob: '',
  status: 'Pending'
};

const ADMIN_EMAIL = 'admin@gmail.com';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({ user: null });
  const [cards, setCards] = useState<IDCardData[]>([]);
  const [currentForm, setCurrentForm] = useState<IDCardData>(INITIAL_FORM_STATE);
  const [viewingCard, setViewingCard] = useState<IDCardData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = () => {
    if (!authState.user) return;
    setIsLoading(true);
    try {
      const savedCards = localStorage.getItem('edu_id_cards');
      const allCards: IDCardData[] = savedCards ? JSON.parse(savedCards) : [];
      
      if (authState.user.role === 'ADMIN') {
        setCards(allCards);
      } else {
        const userCard = allCards.find(c => c.email === authState.user?.username);
        if (userCard) {
          setCurrentForm(userCard);
        } else {
          setCurrentForm({ ...INITIAL_FORM_STATE, email: authState.user.username });
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initApp = () => {
      const savedAuth = localStorage.getItem('edu_id_auth');
      if (savedAuth) {
        setAuthState(JSON.parse(savedAuth));
      }
      setIsLoading(false);
    };

    initApp();
  }, []);

  useEffect(() => {
    if (authState.user) fetchData();
  }, [authState.user]);

  const handleLogin = (username: string, role: UserRole) => {
    const newAuth = { user: { username: username.toLowerCase(), role } };
    setAuthState(newAuth);
    localStorage.setItem('edu_id_auth', JSON.stringify(newAuth));
  };

  const handleLogout = () => {
    setAuthState({ user: null });
    localStorage.removeItem('edu_id_auth');
    setCards([]);
    setCurrentForm(INITIAL_FORM_STATE);
    setViewingCard(null);
  };

  const handleFormChange = (updates: Partial<IDCardData>) => {
    setCurrentForm(prev => ({ ...prev, ...updates }));
  };

  const handleSubmitCard = () => {
    if (!authState.user) return;
    setIsLoading(true);
    
    const recordToSave: IDCardData = {
      ...currentForm,
      id: currentForm.id || `std_${Math.random().toString(36).substr(2, 9)}`,
      email: authState.user.username,
      status: 'Pending'
    };

    try {
      const savedCards = localStorage.getItem('edu_id_cards');
      let allCards: IDCardData[] = savedCards ? JSON.parse(savedCards) : [];
      
      const index = allCards.findIndex(c => c.email === recordToSave.email);
      if (index >= 0) {
        allCards[index] = recordToSave;
      } else {
        allCards.push(recordToSave);
      }
      
      localStorage.setItem('edu_id_cards', JSON.stringify(allCards));
      setCurrentForm(recordToSave);
      setIsModalOpen(true);
    } catch (err) {
      alert("Submission failed");
    }
    setIsLoading(false);
  };

  const handleUpdateStatus = (id: string, status: 'Approved' | 'Rejected') => {
    setIsLoading(true);
    
    try {
      const savedCards = localStorage.getItem('edu_id_cards');
      let allCards: IDCardData[] = savedCards ? JSON.parse(savedCards) : [];
      
      allCards = allCards.map(c => c.id === id ? { ...c, status } : c);
      localStorage.setItem('edu_id_cards', JSON.stringify(allCards));
      
      setCards(allCards);
      if (viewingCard?.id === id) setViewingCard({ ...viewingCard, status });
      if (currentForm.id === id) setCurrentForm({ ...currentForm, status });
    } catch (err) {
      alert("Update failed");
    }
    setIsLoading(false);
  };

  const handleDelete = (id: string) => {
    if (!id) return;
    if (window.confirm("ARE YOU SURE? This student's data will be permanently removed from the system.")) {
      setIsLoading(true);
      
      try {
        const savedCards = localStorage.getItem('edu_id_cards');
        let allCards: IDCardData[] = savedCards ? JSON.parse(savedCards) : [];
        
        allCards = allCards.filter(c => c.id !== id);
        localStorage.setItem('edu_id_cards', JSON.stringify(allCards));
        
        setCards(allCards);
        if (viewingCard?.id === id) setViewingCard(null);
      } catch (err) {
        alert("Delete failed");
      }
      setIsLoading(false);
    }
  };

  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const matchesSearch = (card.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (card.idNo || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBranch = selectedBranch === 'All Branches' || card.branch === selectedBranch;
      return matchesSearch && matchesBranch;
    });
  }, [cards, searchTerm, selectedBranch]);

  const handleDownload = async (id: string, name: string, suffix: string = '') => {
    const element = document.getElementById(id);
    if (element) {
      try {
        const dataUrl = await htmlToImage.toPng(element, { 
          quality: 1.0, 
          pixelRatio: 3, // Higher quality for printing
          cacheBust: true,
        });
        const link = document.createElement('a');
        const fileName = suffix ? `ID_Card_${name}_${suffix}.png` : `ID_Card_${name}.png`;
        link.download = fileName.replace(/\s+/g, '_');
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Download error:", err);
        alert("Failed to generate image for " + name);
      }
    }
  };

  const handleDownloadAll = async () => {
    if (filteredCards.length === 0) return;
    if (!window.confirm(`Download all ${filteredCards.length} ID cards for ${selectedBranch}? Your browser may ask for permission to download multiple files.`)) return;
    
    setIsLoading(true);
    // Sequence downloads to avoid overloading the browser
    for (const card of filteredCards) {
      const id = `batch-${card.id}-combined`;
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between captures
      await handleDownload(id, card.name, 'Full');
    }
    setIsLoading(false);
  };

  const handleDeleteAll = () => {
    if (filteredCards.length === 0) return;
    
    const message = selectedBranch === 'All Branches' 
      ? `ARE YOU ABSOLUTELY SURE? This will permanently delete ALL ${filteredCards.length} student records from the entire system.`
      : `ARE YOU ABSOLUTELY SURE? This will permanently delete ALL ${filteredCards.length} student records for the ${selectedBranch} branch.`;

    if (window.confirm(message)) {
      if (window.confirm("FINAL CONFIRMATION: This action is irreversible. All selected data will be lost forever. Proceed?")) {
        setIsLoading(true);
        try {
          const savedCards = localStorage.getItem('edu_id_cards');
          let allCards: IDCardData[] = savedCards ? JSON.parse(savedCards) : [];
          
          const filteredIds = new Set(filteredCards.map(c => c.id));
          allCards = allCards.filter(c => !filteredIds.has(c.id));
          
          localStorage.setItem('edu_id_cards', JSON.stringify(allCards));
          setCards(allCards);
          
          if (viewingCard && filteredIds.has(viewingCard.id)) setViewingCard(null);
        } catch (err) {
          alert("Delete All failed");
        }
        setIsLoading(false);
      }
    }
  };

  const DownloadOptions = ({ data }: { data: IDCardData }) => (
    <div className="grid grid-cols-1 gap-2 pt-4 border-t border-slate-100 mt-6">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Export Options</p>
      <button 
        onClick={() => handleDownload('preview-combined', data.name, 'Full')}
        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md shadow-blue-100"
      >
        <Download className="w-3.5 h-3.5" />
        Download Full ID (Combined)
      </button>
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={() => handleDownload('preview-front', data.name, 'Front')}
          className="flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Front
        </button>
        <button 
          onClick={() => handleDownload('preview-back', data.name, 'Back')}
          className="flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Back
        </button>
      </div>
    </div>
  );

  const DownloadOptionsStudent = ({ data }: { data: IDCardData }) => (
    <div className="grid grid-cols-1 gap-2 pt-4 border-t border-slate-100 mt-6">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Export Options</p>
      <button 
        onClick={() => handleDownload('student-preview-combined', data.name, 'Full')}
        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md shadow-blue-100"
      >
        <Download className="w-3.5 h-3.5" />
        Download Full ID (Combined)
      </button>
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={() => handleDownload('student-preview-front', data.name, 'Front')}
          className="flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Front
        </button>
        <button 
          onClick={() => handleDownload('student-preview-back', data.name, 'Back')}
          className="flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Back
        </button>
      </div>
    </div>
  );

  if (!authState.user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase">EDUID<span className="text-blue-600">.</span></h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <Login onLogin={handleLogin} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-100">
                <GraduationCap className="text-white w-5 h-5" />
              </div>
              <h1 className="text-lg font-black tracking-tighter uppercase">EDUID<span className="text-blue-600">.</span></h1>
            </div>
            
            <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button className="px-4 py-1.5 text-xs font-bold rounded-lg bg-white shadow-sm text-blue-600">Dashboard</button>
              <button className="px-4 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-700">Analytics</button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Logged in as</span>
              <span className="text-sm font-bold text-slate-700">{authState.user.username}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all relative">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button 
                onClick={handleLogout}
                className="p-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        <AnimatePresence mode="wait">
          {authState.user.role === 'ADMIN' ? (
            <motion.div 
              key="admin-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Admin Console</span>
                  </div>
                  <h2 className="text-4xl font-black tracking-tight text-slate-900">Student Directory</h2>
                  <p className="text-slate-500 mt-2 font-medium">Manage and approve student identification records.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {selectedBranch !== 'All Branches' && filteredCards.length > 0 && (
                    <>
                      <button 
                        onClick={handleDownloadAll}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-100"
                      >
                        <Download className="w-4 h-4" />
                        Export {filteredCards.length} IDs
                      </button>
                      <button 
                        onClick={handleDeleteAll}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-sm font-black uppercase tracking-widest transition-all border border-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete {filteredCards.length} IDs
                      </button>
                    </>
                  )}
                  {selectedBranch === 'All Branches' && filteredCards.length > 0 && (
                    <button 
                      onClick={handleDeleteAll}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-sm font-black uppercase tracking-widest transition-all border border-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All Data
                    </button>
                  )}
                  <button 
                    onClick={fetchData}
                    className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"
                    title="Refresh Data"
                  >
                    <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
                  </button>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all w-full sm:w-64 shadow-sm"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all appearance-none shadow-sm"
                    >
                      {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
              </header>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Records', value: cards.length, color: 'blue' },
                  { label: 'Pending', value: cards.filter(c => c.status === 'Pending').length, color: 'amber' },
                  { label: 'Approved', value: cards.filter(c => c.status === 'Approved').length, color: 'emerald' },
                  { label: 'Rejected', value: cards.filter(c => c.status === 'Rejected').length, color: 'red' },
                ].map((stat, i) => (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
                  >
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                    <p className={cn(
                      "text-3xl font-black",
                      stat.color === 'blue' && "text-blue-600",
                      stat.color === 'amber' && "text-amber-600",
                      stat.color === 'emerald' && "text-emerald-600",
                      stat.color === 'red' && "text-red-600",
                    )}>{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Main Content Area */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Branch</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredCards.length > 0 ? filteredCards.map((card, i) => (
                            <motion.tr 
                              key={card.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.05 }}
                              onClick={() => setViewingCard(card)}
                              className={cn(
                                "group cursor-pointer transition-colors hover:bg-blue-50/50",
                                viewingCard?.id === card.id && "bg-blue-50"
                              )}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img src={card.photoUrl || DEFAULT_PHOTO} className="w-10 h-10 rounded-xl object-cover border border-slate-200" alt="" />
                                  <div>
                                    <p className="text-sm font-black text-slate-900 uppercase">{card.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400">{card.idNo}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-xs font-bold text-slate-600">{card.branch}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase">{card.level}</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                  card.status === 'Approved' && "bg-emerald-100 text-emerald-700",
                                  card.status === 'Rejected' && "bg-red-100 text-red-700",
                                  card.status === 'Pending' && "bg-amber-100 text-amber-700",
                                )}>
                                  {card.status === 'Approved' && <CheckCircle className="w-3 h-3" />}
                                  {card.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                                  {card.status === 'Pending' && <Clock className="w-3 h-3" />}
                                  {card.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDelete(card.id); }}
                                  className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </motion.tr>
                          )) : (
                            <tr>
                              <td colSpan={4} className="px-6 py-20 text-center">
                                <div className="flex flex-col items-center gap-3">
                                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                    <Search className="w-8 h-8 text-slate-300" />
                                  </div>
                                  <p className="text-sm font-bold text-slate-400">No records found matching your criteria.</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="sticky top-28">
                    {viewingCard ? (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50">
                          <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black tracking-tight">Preview Card</h3>
                            <button 
                              onClick={() => handleDownload('capture-combined-container', viewingCard.name)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-100"
                            >
                              <Download className="w-4 h-4" />
                              Export
                            </button>
                          </div>
                          
                          <IDCard data={viewingCard} scale={0.9} idPrefix="preview" />
                          
                          <DownloadOptions data={viewingCard} />

                          <div className="mt-8 grid grid-cols-2 gap-4">
                            <button 
                              onClick={() => handleUpdateStatus(viewingCard.id, 'Approved')}
                              disabled={viewingCard.status === 'Approved'}
                              className="flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-100"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(viewingCard.id, 'Rejected')}
                              disabled={viewingCard.status === 'Rejected'}
                              className="flex items-center justify-center gap-2 py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-100"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="h-[500px] border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-10 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                          <User className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-black text-slate-400">Select a Student</h3>
                        <p className="text-sm font-medium text-slate-400 mt-2">Click on a row in the directory to view and manage their ID card details.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="student-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-7 space-y-10">
                  <header>
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <Plus className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-[0.2em]">Application Portal</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900">ID Card Request</h2>
                    <p className="text-slate-500 mt-2 font-medium">Complete the form below to generate your official digital identity card.</p>
                  </header>

                  <StudentForm 
                    data={currentForm} 
                    onChange={handleFormChange} 
                    onSubmit={handleSubmitCard} 
                  />
                </div>

                <div className="lg:col-span-5">
                  <div className="sticky top-28 space-y-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black tracking-tight">Live Preview</h3>
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                          currentForm.status === 'Approved' ? "bg-emerald-100 text-emerald-700" : 
                          currentForm.status === 'Rejected' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {currentForm.status}
                        </div>
                      </div>
                      
                      <IDCard data={currentForm} scale={0.9} idPrefix="student-preview" />
                      
                      <DownloadOptionsStudent data={currentForm} />

                      <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-200 mt-8">
                        <h4 className="font-black text-lg mb-2">Need Help?</h4>
                        <p className="text-blue-100 text-sm font-medium leading-relaxed">
                          If you encounter any issues while filling out the form, please contact the IT support desk or visit the administration office.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <SubmissionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Batch Export Hidden Container */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden="true">
        {authState.user?.role === 'ADMIN' && filteredCards.map(card => (
          <IDCard key={`batch-${card.id}`} data={card} idPrefix={`batch-${card.id}`} />
        ))}
      </div>
      
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-sm font-black uppercase tracking-widest text-slate-400">Syncing Data...</p>
          </div>
        </div>
      ) }
    </div>
  );
};

export default App;
