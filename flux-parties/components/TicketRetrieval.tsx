import React, { useState } from 'react';
import { DBService } from '../services/dbService.ts';
import { Guest } from '../types.ts';

interface TicketRetrievalProps {
  onSuccess: (guest: Guest) => void;
  onBack: () => void;
}

const TicketRetrieval: React.FC<TicketRetrievalProps> = ({ onSuccess, onBack }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRetrieve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    setTimeout(() => {
      const guest = DBService.getGuestByToken(code.trim());
      if (guest) {
        onSuccess(guest);
      } else {
        setError("Invalid access code. Please check your registration details.");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="max-w-md mx-auto py-12 md:py-20 px-4">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">
            <i className="fas fa-ticket-alt"></i>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Access Ticket</h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Enter your unique code</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
            <i className="fas fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleRetrieve} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ticket Code</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. A1B2C3D4"
              className="w-full px-6 py-5 rounded-2xl border border-gray-100 bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none text-black font-black text-center tracking-[0.2em] transition-all uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-gray-100 transform active:scale-[0.98] ${loading ? 'opacity-50' : 'hover:bg-black'}`}
          >
            {loading ? 'Retrieving...' : 'Access My Pass'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <button 
            onClick={onBack}
            className="text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-indigo-600 transition"
          >
            <i className="fas fa-arrow-left mr-1"></i> Back to Registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketRetrieval;