import React, { useState, useEffect, useMemo } from 'react';
import { IDCardData, UserRole, AuthState } from './types.ts';
import Login from './components/Login.tsx';
import StudentForm from './components/StudentForm.tsx';
import IDCard, { IDCardExportCombined } from './components/IDCard.tsx';
import SubmissionModal from './components/SubmissionModal.tsx';
import { DEFAULT_PHOTO } from './constants.tsx';
import * as htmlToImage from 'html-to-image';
import { supabase } from './supabase.ts';

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

const BRANCHES = [
  "All Branches",
  "Computer Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "EXTC Engineering",
  "AI & Data Science"
];

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
  const [bulkExportCard, setBulkExportCard] = useState<IDCardData | null>(null);

  const fetchData = async () => {
    if (!authState.user) return;
    setIsLoading(true);
    try {
      if (authState.user.role === 'ADMIN') {
        const { data, error } = await supabase
          .from('id_cards')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) setCards(data as IDCardData[]);
      } else {
        const { data, error } = await supabase
          .from('id_cards')
          .select('*')
          .eq('email', authState.user.username)
          .maybeSingle();
        
        if (!error && data) {
          setCurrentForm(data as IDCardData);
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
    const initApp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userEmail = session.user.email?.toLowerCase();
        const role: UserRole = userEmail === ADMIN_EMAIL ? 'ADMIN' : 'STUDENT';
        setAuthState({ user: { username: userEmail || '', role } });
      } else {
        setIsLoading(false);
      }
    };

    initApp();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userEmail = session.user.email?.toLowerCase();
        const role: UserRole = userEmail === ADMIN_EMAIL ? 'ADMIN' : 'STUDENT';
        setAuthState({ user: { username: userEmail || '', role } });
      } else if (event === 'SIGNED_OUT') {
        setAuthState({ user: null });
        setCards([]);
        setCurrentForm(INITIAL_FORM_STATE);
        setViewingCard(null);
      }
    });

    const channel = supabase
      .channel('id_cards_realtime')
      .on('postgres_changes', { event: '*', table: 'id_cards', schema: 'public' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const deletedId = payload.old.id;
          setCards(prev => prev.filter(c => c.id !== deletedId));
          setViewingCard(current => current?.id === deletedId ? null : current);
        } else if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          const newData = payload.new as IDCardData;
          setCards(prev => {
            const exists = prev.find(c => c.id === newData.id);
            if (exists) return prev.map(c => c.id === newData.id ? newData : c);
            return [newData, ...prev];
          });
          if (newData.email === authState.user?.username) {
            setCurrentForm(newData);
          }
        }
      })
      .subscribe();

    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [authState.user?.username]);

  useEffect(() => {
    if (authState.user) fetchData();
  }, [authState.user]);

  const handleLogin = (username: string, role: UserRole) => {
    setAuthState({ user: { username: username.toLowerCase(), role } });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleFormChange = (updates: Partial<IDCardData>) => {
    setCurrentForm(prev => ({ ...prev, ...updates }));
  };

  const handleSubmitCard = async () => {
    if (!authState.user) return;
    setIsLoading(true);
    
    const recordToSave: IDCardData = {
      ...currentForm,
      id: currentForm.id || `std_${Math.random().toString(36).substr(2, 9)}`,
      email: authState.user.username,
      status: 'Pending'
    };

    const { error } = await supabase
      .from('id_cards')
      .upsert(recordToSave, { onConflict: 'email' });

    if (!error) {
      setCurrentForm(recordToSave);
      setIsModalOpen(true);
    } else {
      alert("Submission failed: " + error.message);
    }
    setIsLoading(false);
  };

  const handleUpdateStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    setIsLoading(true);
    setCards(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    if (viewingCard?.id === id) setViewingCard({ ...viewingCard, status });
    
    const { error } = await supabase
      .from('id_cards')
      .update({ status })
      .eq('id', id);

    if (error) {
      alert("Permission Denied: " + error.message);
      fetchData();
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    if (window.confirm("ARE YOU SURE? This student's data will be permanently removed from the system.")) {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('id_cards')
        .delete()
        .eq('id', id);

      if (error) {
        alert("Action Failed: " + error.message);
      } else {
        setCards(prev => prev.filter(c => c.id !== id));
        if (viewingCard?.id === id) setViewingCard(null);
      }
      setIsLoading(false);
    }
  };

  const getActiveFilterLabel = () => {
    const parts = [];
    if (selectedBranch !== 'All Branches') parts.push(selectedBranch);
    if (searchTerm.trim()) parts.push(`search "${searchTerm.trim()}"`);
    return parts.length ? parts.join(' + ') : 'all records';
  };

  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        (card.name || '').toLowerCase().includes(search) ||
        (card.idNo || '').toLowerCase().includes(search) ||
        (card.email || '').toLowerCase().includes(search);
      const matchesBranch = selectedBranch === 'All Branches' || card.branch === selectedBranch;
      return matchesSearch && matchesBranch;
    });
  }, [cards, searchTerm, selectedBranch]);

  const sanitizeFileName = (value: string) => {
    return (value || 'Student_ID')
      .replace(/[<>:"/\\|?*]+/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 80);
  };

  const downloadImage = async (id: string, fileName: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    try {
      const dataUrl = await htmlToImage.toPng(element, { quality: 1.0, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
    }
  };

  const waitForRender = () => new Promise<void>(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  const handleDownloadFiltered = async () => {
    if (filteredCards.length === 0) {
      alert("No ID cards match the current filter.");
      return;
    }

    setIsLoading(true);
    try {
      for (const card of filteredCards) {
        setBulkExportCard(card);
        await waitForRender();
        await downloadImage(
          'bulk-capture-combined-container',
          sanitizeFileName(`${card.branch || 'Department'}_${card.name || card.idNo || card.id || 'Student'}_Full_Card`)
        );
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    } finally {
      setBulkExportCard(null);
      setIsLoading(false);
    }
  };

  const handleDeleteFiltered = async () => {
    if (filteredCards.length === 0) {
      alert("No ID cards match the current filter.");
      return;
    }

    const filterLabel = getActiveFilterLabel();
    const confirmed = window.confirm(
      `ARE YOU SURE? This will permanently delete ${filteredCards.length} ID card record(s) for ${filterLabel}.`
    );
    if (!confirmed) return;

    setIsLoading(true);
    const idsToDelete = filteredCards.map(card => card.id);
    const { error } = await supabase
      .from('id_cards')
      .delete()
      .in('id', idsToDelete);

    if (error) {
      alert("Action Failed: " + error.message);
      fetchData();
    } else {
      setCards(prev => prev.filter(card => !idsToDelete.includes(card.id)));
      setViewingCard(current => current && idsToDelete.includes(current.id) ? null : current);
    }
    setIsLoading(false);
  };

  if (!authState.user && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="bg-white shadow-sm py-4 px-6 border-b border-gray-100">
          <div className="max-w-7xl mx-auto flex items-center">
            <h1 className="text-xl font-extrabold text-blue-600">EduID Portal</h1>
          </div>
        </nav>
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm py-4 px-6 border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-extrabold text-blue-600">EduID Dashboard</h1>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
              {authState.user?.username} • <span className="text-blue-500">{authState.user?.role} Mode</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
             {authState.user?.role === 'ADMIN' && (
                <button 
                  onClick={fetchData}
                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                  title="Force Sync"
                >
                  <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                </button>
             )}
            <button 
              onClick={handleLogout}
              className="px-5 py-2 text-xs font-black text-red-600 border-2 border-red-50 rounded-2xl hover:bg-red-50 hover:border-red-100 transition-all active:scale-95 uppercase tracking-widest"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {isLoading && (
          <div className="fixed inset-0 bg-white/40 backdrop-blur-[2px] z-50 flex items-center justify-center">
             <div className="flex flex-col items-center gap-3 bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
               <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-sm font-black text-blue-600 uppercase tracking-widest">Updating Cloud...</p>
             </div>
          </div>
        )}

        {authState.user?.role === 'STUDENT' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <StudentForm 
                data={currentForm} 
                onChange={handleFormChange} 
                onSubmit={handleSubmitCard} 
              />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-4 px-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Live Identity Preview</h3>
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${currentForm.status === 'Approved' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                   <span className="text-[10px] font-bold text-gray-500 uppercase">{currentForm.status}</span>
                </div>
              </div>
              <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-2xl border border-gray-100 mb-6 transform transition-all hover:scale-[1.01] w-full max-w-sm flex justify-center">
                <IDCard data={currentForm} />
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 mb-10 w-full max-w-md">
                <button 
                  onClick={() => downloadImage('capture-combined-container', `${currentForm.name || 'Student'}_ID_Full`)}
                  className="w-full px-6 py-4 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Get Digital ID (PNG)
                </button>
              </div>
            </div>
          </div>
        ) : authState.user?.role === 'ADMIN' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white focus:border-blue-200 transition-all font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="absolute left-4 top-4.5 h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <select 
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="px-8 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 outline-none focus:ring-4 focus:ring-blue-50 font-black text-xs uppercase tracking-widest text-gray-600"
              >
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownloadFiltered}
                  disabled={filteredCards.length === 0 || isLoading}
                  className="px-5 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  title="Download all filtered ID cards"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Download ({filteredCards.length})
                </button>
                <button
                  onClick={handleDeleteFiltered}
                  disabled={filteredCards.length === 0 || isLoading}
                  className="px-5 py-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  title="Delete all filtered ID cards"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  Delete ({filteredCards.length})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Student Record</th>
                        <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Department</th>
                        <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Audit Status</th>
                        <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredCards.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-24 text-center text-gray-400 italic">
                             <div className="flex flex-col items-center opacity-40">
                                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                                <p className="font-bold uppercase text-[10px] tracking-widest">Database empty or no results</p>
                             </div>
                          </td>
                        </tr>
                      ) : (
                        filteredCards.map(card => (
                          <tr key={card.id} className="hover:bg-blue-50/30 transition-all cursor-pointer group" onClick={() => setViewingCard(card)}>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-4">
                                <img src={card.photoUrl || DEFAULT_PHOTO} className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md" alt="" />
                                <div>
                                  <p className="font-black text-gray-900 text-sm group-hover:text-blue-600 transition-colors uppercase tracking-tight">{card.name}</p>
                                  <p className="text-[10px] text-gray-400 font-bold">{card.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-black text-gray-700 text-xs">{card.idNo}</p>
                              <p className="text-[9px] text-blue-400 font-black uppercase tracking-tighter mt-1">{card.branch}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                card.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                card.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${card.status === 'Approved' ? 'bg-green-500' : card.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                                {card.status}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end space-x-2" onClick={e => e.stopPropagation()}>
                                <button onClick={() => handleUpdateStatus(card.id, 'Approved')} className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm" title="Approve">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                </button>
                                <button onClick={() => handleUpdateStatus(card.id, 'Rejected')} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm" title="Reject">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                                <button onClick={() => handleDelete(card.id)} className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all shadow-sm" title="Delete">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-h-[520px] flex flex-col items-center">
                  {viewingCard ? (
                    <div className="flex flex-col items-center w-full animate-in zoom-in-95 duration-300">
                      <div className="flex justify-between w-full mb-6 items-center">
                         <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg">Audit View</span>
                         <button 
                            onClick={() => downloadImage('capture-combined-container', `${viewingCard.name}_Full_Card`)}
                            className="text-[10px] bg-blue-600 text-white px-4 py-2 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                          >
                            Export
                          </button>
                      </div>
                      <div className="scale-[0.85] origin-top transition-all">
                        <IDCard data={viewingCard} />
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-32 text-center flex-1">
                      <div className="p-6 bg-gray-50 rounded-[2rem] mb-6 ring-8 ring-gray-50/30">
                        <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      </div>
                      <p className="font-black uppercase text-[10px] tracking-widest mb-1">Audit Queue Empty</p>
                      <p className="text-xs px-10 leading-relaxed opacity-60 font-medium italic">Select a record from the list to begin audit process.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <SubmissionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      <div className="fixed -left-[9999px] top-0 pointer-events-none">
        {bulkExportCard && (
          <IDCardExportCombined data={bulkExportCard} id="bulk-capture-combined-container" />
        )}
      </div>
    </div>
  );
};

export default App;
