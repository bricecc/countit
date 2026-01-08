import React from 'react';
import { Counter } from '../types';
import { useLanguage } from '../services/i18n';

interface CounterCardProps {
  counter: Counter;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onClick: (counter: Counter) => void;
}

export const CounterCard: React.FC<CounterCardProps> = ({ counter, onIncrement, onDecrement, onClick }) => {
  const { t } = useLanguage();
  return (
    <div 
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
      onClick={() => onClick(counter)}
    >
      <div className={`absolute top-0 left-0 w-1.5 h-full ${counter.color}`}></div>
      
      <div className="flex justify-between items-start mb-2 pl-3">
        <div>
          <h3 className="font-semibold text-gray-800 text-lg leading-tight truncate pr-2">{counter.title}</h3>
          <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">{t(`cat_${counter.category}` as any) || counter.category}</span>
        </div>
        {counter.trackTime && (
           <span className="bg-blue-50 text-blue-600 p-1 rounded-md" title={t('tracks_time')}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
             </svg>
           </span>
        )}
      </div>

      <div className="flex items-center justify-between pl-3 mt-4">
        <div className="flex items-baseline">
          <span className="text-4xl font-bold text-gray-900">{counter.count}</span>
        </div>

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
           <button 
            onClick={() => onDecrement(counter.id)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors active:bg-gray-300"
            aria-label="Decrement"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={() => onIncrement(counter.id)}
            className={`p-2 rounded-full text-white transition-colors shadow-sm active:opacity-90 active:scale-95 ${counter.color}`}
            aria-label="Increment"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};