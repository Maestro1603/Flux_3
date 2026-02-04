import React, { useState, useEffect } from 'react';
import { Guest } from '../types.ts';
import QRCode from 'https://esm.sh/qrcode';

interface TicketViewProps { guest: Guest; onBack: () => void; }

const TicketView: React.FC<TicketViewProps> = ({ guest, onBack }) => {
  const [entryQR, setEntryQR] = useState<string>('');
  const [exitQR, setExitQR] = useState<string>('');

  useEffect(() => {
    if (guest.approved) {
      QRCode.toDataURL(guest.qr_entry_token, {
        margin: 2,
        scale: 10,
        color: { dark: '#4f46e5', light: '#ffffff' }
      }).then(setEntryQR).catch(console.error);

      QRCode.toDataURL(guest.qr_exit_token, {
        margin: 2,
        scale: 10,
        color: { dark: '#1f2937', light: '#ffffff' }
      }).then(setExitQR).catch(console.error);
    }
  }, [guest.approved, guest.qr_entry_token, guest.qr_exit_token]);

  return (
    <div className="max-w-md mx-auto py-4 space-y-6">
      <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 relative">
        <div className="h-40 bg-indigo-600 flex flex-col items-center justify-center text-white p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
          <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-4 border border-white/20">
             <i className="fas fa-bolt text-amber-300 text-xl"></i>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-widest italic text-white z-10">Flux Parties</h2>
        </div>

        <div className="p-8 space-y-10">
          <div className="text-center">
            <div className="text-indigo-600 font-black text-lg mb-1">
              PASS #{guest.userId.toString().padStart(3, '0')}
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-1 uppercase">{guest.name}</h2>
            {guest.approved && <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified Guest</p>}
          </div>

          {!guest.approved ? (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 text-center">
                <i className="fas fa-clock-rotate-left text-amber-600 text-3xl mb-4"></i>
                <h3 className="font-black text-amber-700 uppercase text-[10px] tracking-widest mb-2">Verification Pending</h3>
                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-tight mb-6">Payment review in progress.</p>
                <div className="pt-6 border-t border-amber-200/50">
                  <p className="text-[9px] font-black text-amber-800 uppercase tracking-widest mb-3">Retrieval Code</p>
                  <div className="text-2xl font-black text-amber-900 tracking-[0.3em] font-mono bg-white py-4 rounded-2xl border border-amber-100 shadow-sm uppercase">
                    {guest.qr_token}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="h-px flex-grow bg-gray-100"></span>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Entry Pass</span>
                  <span className="h-px flex-grow bg-gray-100"></span>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className={`p-3 rounded-[2.5rem] border-2 border-dashed transition-all duration-500 ${guest.checked_in ? 'bg-gray-50 border-gray-200 opacity-40 grayscale' : 'bg-white border-indigo-100 shadow-xl shadow-indigo-50'}`}>
                    <div className="w-48 h-48 bg-white flex items-center justify-center rounded-[1.8rem] overflow-hidden">
                      {entryQR ? <img src={entryQR} alt="Entry QR" className="w-full h-full object-contain" /> : <div className="animate-pulse text-indigo-200"><i className="fas fa-qrcode text-5xl"></i></div>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="h-px flex-grow bg-gray-100"></span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Exit Pass</span>
                  <span className="h-px flex-grow bg-gray-100"></span>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className={`p-3 rounded-[2.5rem] border-2 border-dashed transition-all duration-500 ${guest.checked_out ? 'bg-gray-50 border-gray-200 opacity-40 grayscale' : 'bg-white border-gray-100 shadow-xl shadow-gray-50'}`}>
                    <div className="w-48 h-48 bg-white flex items-center justify-center rounded-[1.8rem] overflow-hidden">
                      {exitQR ? <img src={exitQR} alt="Exit QR" className="w-full h-full object-contain brightness-75 contrast-125" /> : <div className="animate-pulse text-gray-200"><i className="fas fa-qrcode text-5xl"></i></div>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-50 text-center space-y-3">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Manual Security Code</p>
                 <div className="text-xl font-black text-indigo-600 tracking-[0.4em] font-mono bg-gray-50 py-3 rounded-2xl border border-gray-100 uppercase">
                   {guest.qr_token}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <button onClick={onBack} className="text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-indigo-600 transition">
          <i className="fas fa-chevron-left mr-2"></i> Return Home
        </button>
      </div>
    </div>
  );
};

export default TicketView;