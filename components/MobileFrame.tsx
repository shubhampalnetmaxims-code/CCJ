
import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
  onExit?: () => void;
}

const MobileFrame: React.FC<MobileFrameProps> = ({ children, onExit }) => {
  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-2 z-[100] animate-in fade-in duration-500 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-10 right-10 opacity-10 pointer-events-none">
        <svg className="w-96 h-96 text-white" fill="currentColor" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" />
        </svg>
      </div>
      
      {/* Exit Button for Admin */}
      {onExit && (
        <button 
          onClick={onExit}
          className="absolute top-4 left-4 z-[110] flex items-center gap-2 text-white/70 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 text-xs font-bold"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Exit Emulation
        </button>
      )}

      {/* The Phone Container - Reduced height by 10% (700px * 0.9 = 630px) */}
      <div className="relative w-full max-w-[340px] h-[630px] bg-black rounded-[50px] border-[10px] border-slate-800 shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden scale-90 sm:scale-100">
        {/* Notch / Dynamic Island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-50"></div>
        
        {/* Side Buttons */}
        <div className="absolute -left-[11px] top-24 w-[3px] h-12 bg-slate-700 rounded-l-md"></div>
        <div className="absolute -right-[11px] top-32 w-[3px] h-16 bg-slate-700 rounded-r-md"></div>

        {/* Screen Content */}
        <div className="w-full h-full bg-white relative flex flex-col overflow-hidden">
          {children}
          
          {/* Home Indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-black/10 rounded-full z-50"></div>
        </div>
      </div>
    </div>
  );
};

export default MobileFrame;
