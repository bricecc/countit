import React, { useState, useEffect, useRef } from 'react';
import { Counter, COLORS, CATEGORIES, UserProfile } from './types';
import { loadCounters, saveCounters, downloadBackup, importData, getStoredUser, logout } from './services/storageService';
import { CounterCard } from './components/CounterCard';
import { Modal } from './components/Modal';
import { CounterDetail } from './components/CounterDetail';
import { Button } from './components/Button';
import { AuthModal } from './components/AuthModal';
import { useLanguage, Language } from './services/i18n';

// Robust ID Generator
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Fallback
    }
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const App = () => {
  const { t, language, setLanguage } = useLanguage();
  const [counters, setCounters] = useState<Counter[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCounter, setSelectedCounter] = useState<Counter | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Form State for New Counter
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [trackTime, setTrackTime] = useState(true);

  // Debounce save ref
  const saveTimeoutRef = useRef<number | null>(null);
  const isInitialLoad = useRef(true);

  // 1. Initial Load
  useEffect(() => {
    const { user: storedUser, token: storedToken } = getStoredUser();
    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
      fetchData(storedToken);
    } else {
      fetchData(null);
    }
  }, []);

  // 2. Fetch Data wrapper
  const fetchData = async (authToken: string | null) => {
    const data = await loadCounters(authToken);
    setCounters(data);
    isInitialLoad.current = false;
  };

  // 3. Save Effect (Debounced)
  useEffect(() => {
    if (isInitialLoad.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      saveCounters(counters, token);
    }, 1000); // Debounce saves by 1 second

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [counters, token]);

  const handleAuthSuccess = (userData: UserProfile, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    fetchData(authToken); // Reload data from server
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setToken(null);
    fetchData(null); // Load local data (Guest mode)
    setIsSettingsOpen(false);
  };

  const handleIncrement = (id: string) => {
    setCounters(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          count: c.count + 1,
          history: c.trackTime ? [...c.history, Date.now()] : c.history
        };
      }
      return c;
    }));
  };

  const handleDecrement = (id: string) => {
    setCounters(prev => prev.map(c => {
      if (c.id === id && c.count > 0) {
        const newHistory = [...c.history];
        if (c.trackTime) newHistory.pop();
        return {
          ...c,
          count: c.count - 1,
          history: newHistory
        };
      }
      return c;
    }));
  };

  const handleCreateCounter = () => {
    if (!newTitle.trim()) return;
    
    const newCounter: Counter = {
      id: generateId(),
      title: newTitle,
      category: newCategory,
      count: 0,
      trackTime: trackTime,
      history: [],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      createdAt: Date.now()
    };

    setCounters(prev => [newCounter, ...prev]);
    setNewTitle('');
    setIsAddModalOpen(false);
  };

  const handleDeleteCounter = (id: string) => {
    setCounters(prev => prev.filter(c => c.id !== id));
    setSelectedCounter(null);
  };

  const handleUpdateCounter = (updated: Counter) => {
    setCounters(prev => prev.map(c => c.id === updated.id ? updated : c));
    setSelectedCounter(updated);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const imported = importData(content);
          if (confirm(t('confirm_merge', { n: imported.length }))) {
             setCounters(prev => [...prev, ...imported]);
             alert(t('import_success'));
          }
        } catch (err) {
          alert(t('import_fail'));
        }
      };
      reader.readAsText(file);
    }
  };
  
  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
               </svg>
            </div>
            <span className="font-bold text-xl text-gray-800 tracking-tight">{t('app_name')}</span>
          </div>
          <div className="flex gap-2 items-center">
             {/* Cloud Status Indicator */}
             {user ? (
               <span className="hidden sm:flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  {t('cloud_sync')}
               </span>
             ) : (
                <span className="hidden sm:flex text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                   {t('local_mode')}
                </span>
             )}

            <button 
               onClick={() => setIsSettingsOpen(true)}
               className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
               </svg>
               {!user && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {counters.length === 0 ? (
          <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
             </div>
             <h2 className="text-xl font-semibold text-gray-700">{t('no_counters_title')}</h2>
             <p className="text-gray-500 mt-2 max-w-xs mx-auto">
               {user ? t('no_counters_msg_cloud') : t('no_counters_msg_local')}
             </p>
             <div className="mt-6 flex flex-col gap-3 justify-center items-center">
               <Button onClick={() => setIsAddModalOpen(true)}>{t('create_first')}</Button>
               {!user && (
                 <button onClick={() => setIsAuthModalOpen(true)} className="text-blue-600 text-sm hover:underline">
                   {t('signin_sync')}
                 </button>
               )}
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {counters.map(counter => (
              <CounterCard 
                key={counter.id} 
                counter={counter} 
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onClick={setSelectedCounter}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 z-20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Add Counter Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title={t('create_new')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('name_label')}</label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder={t('name_placeholder')}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('category_label')}</label>
             <select 
               className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
               value={newCategory}
               onChange={(e) => setNewCategory(e.target.value)}
             >
               {CATEGORIES.map(cat => (
                 <option key={cat} value={cat}>{t(`cat_${cat}` as any) || cat}</option>
               ))}
             </select>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="trackTime"
              checked={trackTime}
              onChange={(e) => setTrackTime(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="trackTime" className="text-sm text-gray-700 select-none cursor-pointer">
              {t('track_time_label')}
            </label>
          </div>
          <div className="pt-4">
            <Button onClick={handleCreateCounter} disabled={!newTitle.trim()} className="w-full">
              {t('start_counting')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Counter Detail Modal */}
      <Modal 
        isOpen={!!selectedCounter} 
        onClose={() => setSelectedCounter(null)} 
        title={t('counter_details')}
      >
        {selectedCounter && (
          <CounterDetail 
            counter={selectedCounter}
            onClose={() => setSelectedCounter(null)}
            onDelete={handleDeleteCounter}
            onEdit={handleUpdateCounter}
          />
        )}
      </Modal>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Settings / Account Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title={t('settings_title')}
      >
        <div className="space-y-6">
           {/* Language Selector */}
           <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
             <label className="font-semibold text-gray-800">{t('language')}</label>
             <select 
               className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
               value={language}
               onChange={(e) => setLanguage(e.target.value as Language)}
             >
               <option value="en">English</option>
               <option value="fr">Français</option>
               <option value="de">Deutsch</option>
             </select>
           </div>

           <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
             <h3 className="font-semibold text-gray-800 mb-2">{t('account_sync')}</h3>
             {user ? (
               <div className="flex justify-between items-center">
                 <div>
                   <p className="text-sm font-medium text-gray-900">{user.username}</p>
                   <p className="text-xs text-gray-500">{user.email}</p>
                   <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                     </svg>
                     {t('connected_server')}
                   </p>
                 </div>
                 <Button variant="secondary" onClick={handleLogout} size="sm">{t('sign_out')}</Button>
               </div>
             ) : (
               <div className="space-y-3">
                 <p className="text-sm text-gray-600">
                   {t('sign_in_desc')}
                 </p>
                 <Button onClick={() => { setIsSettingsOpen(false); setIsAuthModalOpen(true); }} className="w-full">
                   {t('sign_in_reg')}
                 </Button>
               </div>
             )}
           </div>

           <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2">{t('portable_db')}</h3>
              <p className="text-sm text-blue-700 mb-4">
                {t('export_desc')}
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => downloadBackup(counters)} className="flex-1">
                  {t('export_json')}
                </Button>
                <div className="relative flex-1">
                  <input 
                    type="file" 
                    accept=".json"
                    onChange={handleImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="secondary" className="w-full">{t('import_json')}</Button>
                </div>
              </div>
           </div>
        </div>
      </Modal>

    </div>
  );
};

export default App;