
import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
  onExit?: () => void;
}

const MobileFrame: React.FC<MobileFrameProps> = ({ children, onExit }) => {
  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-4 z-[100] animate-in fade-in duration-500 overflow-hidden">
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
          className="absolute top-8 left-8 flex items-center gap-2 text-white/50 hover:text-white transition-all bg-white/5 px-4 py-2 rounded-full border border-white/10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Admin Dashboard
        </button>
      )}

      {/* The Phone Container */}
      <div className="relative w-full max-w-[380px] h-[780px] bg-black rounded-[60px] border-[8px] border-slate-800 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Notch / Dynamic Island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-50"></div>
        
        {/* Side Buttons */}
        <div className="absolute -left-[10px] top-28 w-[4px] h-14 bg-slate-700 rounded-l-md"></div>
        <div className="absolute -left-[10px] top-48 w-[4px] h-10 bg-slate-700 rounded-l-md"></div>
        <div className="absolute -right-[10px] top-36 w-[4px] h-20 bg-slate-700 rounded-r-md"></div>

        {/* Screen Content */}
        <div className="w-full h-full bg-white relative flex flex-col overflow-hidden">
          {children}
          
          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-black/10 rounded-full z-50"></div>
        </div>
      </div>
    </div>
  );
};

export default MobileFrame;
