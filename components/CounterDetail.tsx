import React, { useState } from 'react';
import { Counter } from '../types';
import { Button } from './Button';
import { exportData } from '../services/storageService';
import { useLanguage } from '../services/i18n';

interface CounterDetailProps {
  counter: Counter;
  onEdit: (updatedCounter: Counter) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const CounterDetail: React.FC<CounterDetailProps> = ({ counter, onEdit, onDelete, onClose }) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editTitle, setEditTitle] = useState(counter.title);

  const handleSave = () => {
    onEdit({ ...counter, title: editTitle });
    setIsEditing(false);
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date(timestamp));
  };

  // Group history by date for better visualization
  const groupedHistory = counter.history.slice().reverse().reduce((acc, timestamp) => {
    const date = new Date(timestamp).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(timestamp);
    return acc;
  }, {} as Record<string, number[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        {isEditing ? (
          <input 
            type="text" 
            value={editTitle} 
            onChange={(e) => setEditTitle(e.target.value)}
            className="text-2xl font-bold border-b-2 border-blue-500 focus:outline-none w-full"
            autoFocus
          />
        ) : (
          <div>
             <h1 className="text-3xl font-bold text-gray-900">{counter.title}</h1>
             <p className="text-gray-500">{t(`cat_${counter.category}` as any) || counter.category}</p>
          </div>
        )}
        
        <div className="flex gap-2">
             {isEditing ? (
               <Button onClick={handleSave}>{t('save')}</Button>
             ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-blue-600 p-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                </button>
             )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100">
        <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">{t('current_count')}</span>
        <div className={`text-6xl font-black mt-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600`}>
          {counter.count}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('history_log')}
        </h3>
        
        {!counter.trackTime ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
            {t('timestamps_disabled')}
          </div>
        ) : counter.history.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
            {t('no_history')}
          </div>
        ) : (
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
             {Object.entries(groupedHistory).map(([date, times]) => (
               <div key={date}>
                 <div className="text-xs font-bold text-gray-400 mb-2 sticky top-0 bg-white py-1">{date}</div>
                 <div className="space-y-2">
                   {(times as number[]).map((time) => (
                     <div key={time} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm">
                       <span className="text-gray-700">{t('incremented')}</span>
                       <span className="font-mono text-gray-500 text-xs">
                         {new Date(time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                     </div>
                   ))}
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-gray-100">
        {isDeleting ? (
           <div className="flex items-center justify-between bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in slide-in-from-bottom-2 duration-200">
               <div className="text-red-800">
                  <p className="font-semibold text-sm">{t('delete_question')}</p>
                  <p className="text-xs text-red-600 mt-0.5">{t('delete_warning')}</p>
               </div>
               <div className="flex gap-2">
                   <Button variant="secondary" size="sm" onClick={() => setIsDeleting(false)}>{t('cancel')}</Button>
                   <Button variant="danger" size="sm" onClick={() => onDelete(counter.id)}>{t('confirm_delete')}</Button>
               </div>
           </div>
        ) : (
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => {
                const data = exportData([counter]);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${counter.title.replace(/\s+/g, '_')}_history.json`;
                a.click();
            }}>
               {t('export_json')}
            </Button>
            <Button variant="danger" onClick={() => setIsDeleting(true)}>
              {t('delete_counter')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};