import React, { useState, useEffect } from 'react';
import { DBService } from '../services/dbService.ts';
import { Guest, Wave, Expense } from '../types.ts';
import QRScanner from './QRScanner.tsx';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'GUESTS' | 'WAVES' | 'FINANCES' | 'EXPENSES' | 'SCANNER' | 'MAINTENANCE'>('GUESTS');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [waves, setWaves] = useState<Wave[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  
  const [sortField, setSortField] = useState<'name' | 'userId' | 'created_at'>('userId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const [editingWave, setEditingWave] = useState<Wave | null>(null);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const [newExpType, setNewExpType] = useState('');
  const [newExpAmount, setNewExpAmount] = useState('');

  const refreshData = () => {
    setGuests(DBService.getGuests());
    setWaves(DBService.getWaves());
    setExpenses(DBService.getExpenses());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const sortedGuests = [...guests]
    .filter(g => 
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      g.qr_token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.phone.includes(searchTerm) ||
      g.userId.toString() === searchTerm
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortField === 'userId') comparison = a.userId - b.userId;
      else if (sortField === 'created_at') comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const totalRevenue = guests.reduce((sum, g) => sum + g.amount_paid, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const misarahProfit = guests.reduce((sum, g) => sum + (g.approved ? g.misarah_profit : 0), 0);
  const domzProfit = guests.reduce((sum, g) => sum + (g.approved ? g.domz_profit : 0), 0);
  const sateaProfit = guests.reduce((sum, g) => sum + (g.approved ? g.satea_profit : 0), 0);

  const handleApprove = (id: string) => {
    DBService.approveGuest(id);
    refreshData();
  };

  const handleDeleteGuest = (id: string) => {
    if (window.confirm("PERMANENT: Delete guest and free up ticket slot?")) {
      DBService.deleteGuest(id);
      refreshData();
    }
  };

  const handleUpdateWave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWave) {
      DBService.updateWave(editingWave);
      setEditingWave(null);
      refreshData();
    }
  };

  const handleUpdateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGuest) {
      DBService.updateGuest(editingGuest);
      setEditingGuest(null);
      refreshData();
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpType || !newExpAmount) return;
    DBService.addExpense({
      type: newExpType,
      amount: parseFloat(newExpAmount),
      note: ""
    });
    refreshData();
    setNewExpType('');
    setNewExpAmount('');
  };

  const handleSort = (field: 'name' | 'userId' | 'created_at') => {
    if (sortField === field) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  return (
    <div className="space-y-6 md:space-y-10 pb-20">
      {viewingProof && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm cursor-zoom-out" onClick={() => setViewingProof(null)}>
          <img src={viewingProof} alt="Proof" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Admin Control</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Flux Parties Management System</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={refreshData} className="flex-1 md:flex-none px-6 py-4 rounded-2xl bg-gray-50 text-gray-600 font-bold text-[10px] uppercase tracking-widest hover:bg-gray-100 transition"><i className="fas fa-sync-alt mr-2"></i> Sync</button>
          <button onClick={onLogout} className="flex-1 md:flex-none px-6 py-4 rounded-2xl bg-red-50 text-red-600 font-bold text-[10px] uppercase tracking-widest hover:bg-red-100 transition"><i className="fas fa-power-off mr-2"></i> Exit</button>
        </div>
      </div>

      {/* Nav */}
      <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
        {[
          { id: 'GUESTS', label: 'Guests', icon: 'fa-users' },
          { id: 'WAVES', label: 'Waves', icon: 'fa-wave-square' },
          { id: 'FINANCES', label: 'Finances', icon: 'fa-chart-pie' },
          { id: 'EXPENSES', label: 'Expenses', icon: 'fa-receipt' },
          { id: 'SCANNER', label: 'Scanner', icon: 'fa-qrcode' },
          { id: 'MAINTENANCE', label: 'System', icon: 'fa-gears' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-shrink-0 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}>
            <i className={`fas ${tab.icon}`}></i> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        {activeTab === 'GUESTS' && (
          <div className="p-6 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-4">
              <input type="text" placeholder="Search guests..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-grow pl-6 pr-6 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-sm" />
              <div className="flex gap-2">
                <button onClick={() => handleSort('userId')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${sortField === 'userId' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'text-gray-400'}`}>By ID</button>
                <button onClick={() => handleSort('name')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${sortField === 'name' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'text-gray-400'}`}>By Name</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="border-b border-gray-50"><th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th><th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th><th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th><th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {sortedGuests.map(guest => (
                    <tr key={guest.id} className="hover:bg-gray-50 transition">
                      <td className="py-5 px-4"><div className="font-black">#{guest.userId} {guest.name}</div><div className="text-[10px] text-indigo-500">{guest.instagram}</div></td>
                      <td className="py-5 px-4 text-sm font-bold text-gray-600">{guest.phone}</td>
                      <td className="py-5 px-4">
                        {guest.approved ? <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black border border-green-100">PAID</span> : <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black border border-amber-100">PENDING</span>}
                        {guest.checked_in && <span className="ml-2 px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-black">IN</span>}
                      </td>
                      <td className="py-5 px-4 text-right space-x-2">
                        {guest.proof_file_path && <button onClick={() => setViewingProof(guest.proof_file_path!)} className="p-2 text-indigo-400"><i className="fas fa-image"></i></button>}
                        <button onClick={() => setEditingGuest(guest)} className="p-2 text-gray-400"><i className="fas fa-edit"></i></button>
                        {!guest.approved && <button onClick={() => handleApprove(guest.id)} className="p-2 text-green-400"><i className="fas fa-check"></i></button>}
                        <button onClick={() => handleDeleteGuest(guest.id)} className="p-2 text-red-300"><i className="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'FINANCES' && (
          <div className="p-6 md:p-8 space-y-10">
            <div className="grid md:grid-cols-3 gap-6 text-white">
              <div className="p-8 rounded-[2rem] bg-indigo-600 shadow-xl shadow-indigo-100"><div className="text-[10px] font-black uppercase mb-2">Total Gross</div><div className="text-4xl font-black">{totalRevenue} EGP</div></div>
              <div className="p-8 rounded-[2rem] bg-gray-900 shadow-xl shadow-gray-100"><div className="text-[10px] font-black uppercase mb-2">Expenses</div><div className="text-4xl font-black">{totalExpenses} EGP</div></div>
              <div className="p-8 rounded-[2rem] bg-green-500 shadow-xl shadow-green-100"><div className="text-[10px] font-black uppercase mb-2">Net Profit</div><div className="text-4xl font-black">{totalRevenue - totalExpenses} EGP</div></div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl border border-gray-100"><div className="text-[10px] font-black text-gray-400 uppercase mb-1">Misarah (Deduction + 1/3)</div><div className="text-2xl font-black">{misarahProfit.toFixed(0)} EGP</div></div>
              <div className="p-6 rounded-3xl border border-gray-100"><div className="text-[10px] font-black text-gray-400 uppercase mb-1">Domz (1/3 Remaining)</div><div className="text-2xl font-black">{domzProfit.toFixed(0)} EGP</div></div>
              <div className="p-6 rounded-3xl border border-gray-100"><div className="text-[10px] font-black text-gray-400 uppercase mb-1">Satea (1/3 Remaining)</div><div className="text-2xl font-black">{sateaProfit.toFixed(0)} EGP</div></div>
            </div>
          </div>
        )}

        {activeTab === 'WAVES' && (
           <div className="p-6 md:p-8 grid md:grid-cols-2 gap-6">
              {waves.map(wave => (
                <div key={wave.id} className={`p-8 rounded-[2.5rem] border ${wave.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-100'}`}>
                   <h3 className="text-xl font-black mb-4 uppercase">{wave.name}</h3>
                   <div className="grid grid-cols-2 gap-4 mb-6 text-sm font-bold">
                      <div className="bg-black/5 p-4 rounded-2xl">Price: {wave.price} EGP</div>
                      <div className="bg-black/5 p-4 rounded-2xl">Sold: {wave.sold_count} / {wave.max_tickets}</div>
                   </div>
                   <div className="flex gap-2">
                      {/* FIX: Avoid using logical OR with 'void' return types. Use a block instead for multiple statements. */}
                      {!wave.active && <button onClick={() => { DBService.setActiveWave(wave.id); refreshData(); }} className="flex-grow py-3 rounded-xl bg-white/20 text-white font-black uppercase text-[10px]">Activate</button>}
                      <button onClick={() => setEditingWave(wave)} className="px-4 py-3 rounded-xl bg-white/10 text-white font-black uppercase text-[10px]">Settings</button>
                   </div>
                </div>
              ))}
           </div>
        )}

        {activeTab === 'SCANNER' && <div className="p-6 md:p-8"><QRScanner /></div>}
        {activeTab === 'EXPENSES' && (
          <div className="p-6 md:p-8 space-y-8">
            <form onSubmit={handleAddExpense} className="grid md:grid-cols-3 gap-4 bg-gray-50 p-6 rounded-3xl">
              <input type="text" placeholder="Type" value={newExpType} onChange={e => setNewExpType(e.target.value)} className="px-6 py-4 rounded-2xl border-none outline-none font-bold" />
              <input type="number" placeholder="Amount" value={newExpAmount} onChange={e => setNewExpAmount(e.target.value)} className="px-6 py-4 rounded-2xl border-none outline-none font-bold" />
              <button type="submit" className="bg-indigo-600 text-white font-black uppercase text-[10px] rounded-2xl">Add Expense</button>
            </form>
            <table className="w-full text-left">
              <thead><tr className="border-b border-gray-50"><th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Expense</th><th className="pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th></tr></thead>
              <tbody>{expenses.map(e => (
                <tr key={e.id} className="border-b border-gray-50"><td className="py-4 px-4 font-bold">{e.type}</td><td className="py-4 px-4 font-black text-right text-indigo-600">{e.amount} EGP</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {editingGuest && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md p-8 rounded-[3rem] animate-in zoom-in-95">
             <h3 className="text-2xl font-black mb-6 uppercase">Edit Guest Info</h3>
             <form onSubmit={handleUpdateGuest} className="space-y-4">
                <input type="text" value={editingGuest.name} onChange={e => setEditingGuest({...editingGuest, name: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Name" />
                <input type="text" value={editingGuest.instagram} onChange={e => setEditingGuest({...editingGuest, instagram: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Instagram" />
                <input type="text" value={editingGuest.phone} onChange={e => setEditingGuest({...editingGuest, phone: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Phone" />
                <div className="flex gap-2 pt-4">
                  <button type="button" onClick={() => setEditingGuest(null)} className="flex-1 py-4 bg-gray-100 text-gray-500 font-black uppercase text-[10px] rounded-2xl">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase text-[10px] rounded-2xl">Save</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {editingWave && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md p-8 rounded-[3rem] animate-in zoom-in-95">
             <h3 className="text-2xl font-black mb-6 uppercase">Edit {editingWave.name}</h3>
             <form onSubmit={handleUpdateWave} className="space-y-4">
                <input type="number" value={editingWave.price} onChange={e => setEditingWave({...editingWave, price: parseInt(e.target.value)})} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none font-bold" placeholder="Price" />
                <input type="number" value={editingWave.max_tickets} onChange={e => setEditingWave({...editingWave, max_tickets: parseInt(e.target.value)})} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none font-bold" placeholder="Max Tickets" />
                <input type="number" value={editingWave.deduction} onChange={e => setEditingWave({...editingWave, deduction: parseInt(e.target.value)})} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none font-bold" placeholder="Partner Deduction" />
                <div className="flex gap-2 pt-4">
                  <button type="button" onClick={() => setEditingWave(null)} className="flex-1 py-4 bg-gray-100 text-gray-500 font-black uppercase text-[10px] rounded-2xl">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase text-[10px] rounded-2xl">Save</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
