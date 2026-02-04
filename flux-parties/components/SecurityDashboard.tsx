import React from 'react';
import QRScanner from './QRScanner.tsx';

interface SecurityDashboardProps {
  onLogout: () => void;
}

const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ onLogout }) => {
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="flex justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
             <i className="fas fa-shield-halved"></i>
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 uppercase">Security</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entry Control Only</p>
          </div>
        </div>
        <button onClick={onLogout} className="w-10 h-10 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 transition">
          <i className="fas fa-power-off"></i>
        </button>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
        <QRScanner />
      </div>
      
      <div className="text-center p-6 border-2 border-dashed border-gray-100 rounded-[2rem]">
         <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Authorized Security Staff Only</p>
      </div>
    </div>
  );
};

export default SecurityDashboard;