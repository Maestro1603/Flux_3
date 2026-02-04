
import React, { useState } from 'react';
import { PaymentMethod, Guest } from '../types.ts';
import { DBService } from '../services/dbService.ts';

interface RegistrationProps {
  onSuccess: (guest: Guest) => void;
  onViewTerms: () => void;
  onRetrieve: () => void;
}

const Registration: React.FC<RegistrationProps> = ({ onSuccess, onViewTerms, onRetrieve }) => {
  const [name, setName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.INSTAPAY);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

  const waves = DBService.getWaves();
  const activeWave = waves.find(w => w.active) || waves[0];
  const remaining = activeWave.max_tickets - activeWave.sold_count;
  const isFull = remaining <= 0;

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFull) return setError("This wave is now full.");
    
    const errors: string[] = [];
    if (!name.trim()) errors.push('name');
    if (!phone.trim()) errors.push('phone');
    if (!instagram.trim()) errors.push('instagram');
    if (!proofFile) errors.push('proof');
    if (!acceptedTerms) errors.push('terms');

    setFieldErrors(errors);
    if (errors.length > 0) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const proof_file_path = await fileToBase64(proofFile!);
      const newGuest = DBService.saveGuest({ name, instagram, phone, payment_method: paymentMethod, proof_file_path });
      setTimeout(() => {
        setLoading(false);
        onSuccess(newGuest);
      }, 1200);
    } catch (err) {
      setError("Registration failed.");
      setLoading(false);
    }
  };

  const getFieldClass = (fieldName: string) => {
    const base = "w-full px-6 py-4 rounded-2xl border transition font-bold text-black outline-none ";
    return fieldErrors.includes(fieldName) ? base + "border-red-400 bg-red-50/50" : base + "border-gray-100 bg-gray-50/50 focus:bg-white";
  };

  const paymentHandle = paymentMethod === PaymentMethod.INSTAPAY ? '01000821538' : '@domz046';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10 text-center px-4">
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-2 tracking-tighter uppercase italic">Flux Parties</h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Secure Registration Portal</p>
      </div>

      <div className="bg-white p-6 md:p-12 rounded-[2.5rem] shadow-2xl shadow-indigo-100/30 border border-gray-100">
        {isFull && (
          <div className="mb-8 p-6 bg-gray-900 text-white rounded-[2rem] text-center border-4 border-indigo-600">
            <div className="text-2xl font-black uppercase tracking-tighter mb-1">Wave Full</div>
          </div>
        )}

        {error && !isFull && <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm font-bold">{error}</div>}

        <form onSubmit={handleSubmit} className={`space-y-6 ${isFull ? 'opacity-40 pointer-events-none' : ''}`}>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
            <input type="text" disabled={isFull} value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className={getFieldClass('name')} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone</label>
              <input type="tel" disabled={isFull} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className={getFieldClass('phone')} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Instagram</label>
              <input type="text" disabled={isFull} value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@username" className={getFieldClass('instagram')} />
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {[PaymentMethod.INSTAPAY, PaymentMethod.TELDA].map((m) => (
                <button
                  key={m}
                  type="button"
                  disabled={isFull}
                  onClick={() => setPaymentMethod(m)}
                  className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${paymentMethod === m ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'border-gray-50 bg-gray-50/30 text-gray-400'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className={`p-6 rounded-[2rem] border transition-all ${fieldErrors.includes('proof') ? 'bg-red-50 border-red-200' : 'bg-indigo-50 border-indigo-100'}`}>
            <p className="text-[10px] font-black mb-4 uppercase tracking-widest text-indigo-700">
              Transfer via {paymentMethod} to <span className="text-sm font-black">{paymentHandle}</span>
            </p>
            <div className="relative">
              <input type="file" accept="image/*" disabled={isFull} onChange={(e) => setProofFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="w-full py-4 px-6 rounded-2xl bg-white border-2 border-dashed text-[10px] flex items-center justify-center gap-2 uppercase tracking-widest font-bold">
                <i className="fas fa-upload"></i> {proofFile ? proofFile.name : `Proof of ${paymentMethod} Payment`}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50">
            <input type="checkbox" id="terms" disabled={isFull} checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1 w-5 h-5 rounded text-indigo-600" />
            <label htmlFor="terms" className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              I agree to the <button type="button" onClick={onViewTerms} className="text-indigo-600 underline">Terms and Conditions</button>.
            </label>
          </div>

          <button type="submit" disabled={loading || isFull} className="w-full py-5 rounded-[2rem] text-white bg-indigo-600 font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-indigo-100 transform active:scale-[0.98]">
            {loading ? 'Processing...' : 'Submit Registration'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-50 text-center">
          <button onClick={onRetrieve} className="text-indigo-600 font-black uppercase text-[11px] tracking-widest">
            Access My Ticket <i className="fas fa-chevron-right ml-1"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Registration;
