import React, { useState } from 'react';
import { DBService } from '../services/dbService.ts';
import { Admin } from '../types.ts';

interface AdminLoginProps {
  onSuccess: (user: Admin) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = DBService.login(username, password);
    if (user) {
      onSuccess(user);
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 md:py-20 px-4">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 transform rotate-3">
            <i className="fas fa-user-shield"></i>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Staff Login</h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Secure Portal Entry</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-xs font-black uppercase tracking-widest flex items-center gap-3">
            <i className="fas fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
            <input
              type="text"
              required
              autoComplete="off"
              spellCheck="false"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none text-black font-bold transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <input
              type="password"
              required
              autoComplete="off"
              spellCheck="false"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none text-black font-bold transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 transform active:scale-[0.98]"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;