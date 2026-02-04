
import React from 'react';
import { TERMS_AND_CONDITIONS } from '../constants';

interface TermsProps {
  onBack: () => void;
}

const Terms: React.FC<TermsProps> = ({ onBack }) => {
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
      <button onClick={onBack} className="text-gray-400 mb-8 flex items-center gap-2 hover:text-indigo-600 font-bold uppercase text-xs tracking-widest transition">
        <i className="fas fa-arrow-left"></i>
        Back to Registration
      </button>

      <h1 className="text-3xl font-black text-gray-900 mb-6 uppercase tracking-tighter">Terms & Conditions</h1>
      <div className="prose prose-gray max-w-none text-gray-600 space-y-6">
        <section>
          <ul className="list-disc pl-5 space-y-4">
            {TERMS_AND_CONDITIONS.map((term, idx) => (
              <li key={idx} className="text-gray-500 font-medium text-sm leading-relaxed">{term}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Terms;
