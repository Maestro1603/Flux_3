
import React from 'react';
import { Wave } from '../types.ts';

interface HomeProps {
  onRegister: () => void;
  waves: Wave[];
}

const Home: React.FC<HomeProps> = ({ onRegister, waves }) => {
  const totalCapacity = waves.reduce((sum, w) => sum + w.max_tickets, 0);
  const totalSold = waves.reduce((sum, w) => sum + w.sold_count, 0);
  const remaining = Math.max(0, totalCapacity - totalSold);

  return (
    <div className="space-y-12 md:space-y-20">
      {/* Modern High-Impact Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-indigo-600 p-8 md:p-20 shadow-2xl shadow-indigo-200">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-indigo-50 text-xs font-bold uppercase tracking-widest mb-6 border border-white/10">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Booking Open Now
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
            The Grand <br/>
            <span className="text-amber-300">Flux Gala</span>
          </h1>
          
          <p className="text-lg md:text-xl text-indigo-100/90 mb-10 font-medium leading-relaxed">
            A night of unbridled energy and elegance. Join the collective at Skyward Atrium for the final flux of 2024.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onRegister}
              disabled={remaining <= 0}
              className={`px-10 py-5 rounded-2xl font-black text-lg transition-all transform active:scale-95 shadow-xl ${
                remaining > 0 
                ? 'bg-white text-indigo-600 hover:shadow-white/20 hover:-translate-y-1' 
                : 'bg-indigo-400 cursor-not-allowed text-indigo-200'
              }`}
            >
              {remaining > 0 ? 'SECURE TICKET' : 'FULLY BOOKED'}
            </button>
            <div className="flex flex-col justify-center px-2">
               <span className="text-white font-bold text-sm">Dec 31 • 8PM</span>
               <span className="text-indigo-200 text-xs font-semibold">Skyward Atrium, Downtown</span>
            </div>
          </div>
        </div>
        
        {/* Dynamic Abstract Shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-300/20 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"></div>
        
        {/* Background Visual Element */}
        <div className="hidden lg:block absolute top-1/2 right-20 -translate-y-1/2">
           <div className="w-64 h-64 border-8 border-white/5 rounded-full flex items-center justify-center animate-spin-slow">
              <div className="w-40 h-40 border-4 border-white/10 rounded-full"></div>
           </div>
        </div>
      </div>

      {/* Mobile-Friendly Quick Info Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Status', value: remaining > 0 ? 'Tickets Avail.' : 'Sold Out', icon: 'fa-ticket', color: 'bg-green-50 text-green-600' },
          { label: 'Capacity', value: `${remaining} Left`, icon: 'fa-users', color: 'bg-blue-50 text-blue-600' },
          { label: 'Minimum Age', value: '18+', icon: 'fa-id-card', color: 'bg-amber-50 text-amber-600' },
          { label: 'Dress Code', value: 'Formal', icon: 'fa-vest', color: 'bg-purple-50 text-purple-600' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center mb-3`}>
              <i className={`fas ${item.icon}`}></i>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{item.label}</div>
            <div className="font-bold text-gray-900 truncate">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Event Details with Better Spacing */}
      <div className="grid lg:grid-cols-5 gap-12 md:gap-20 items-center">
        <div className="lg:col-span-3">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 tracking-tight">Experience <span className="text-indigo-600 underline decoration-indigo-200 decoration-4 underline-offset-4">The Flux</span></h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: "Gourmet Dining", desc: "A curated 5-course journey through modern fusion cuisine.", icon: "fa-utensils" },
              { title: "Live Ensemble", desc: "Symphonic arrangements meets electronic precision.", icon: "fa-music" },
              { title: "Exclusive Bar", desc: "Craft non-alcoholic mixology by industry experts.", icon: "fa-glass-water" },
              { title: "Networking", desc: "Connecting the brightest minds in the creative space.", icon: "fa-hashtag" },
            ].map((feature, i) => (
              <div key={i} className="group">
                <div className="flex items-center gap-3 mb-2 font-black text-gray-900">
                   <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <i className={`fas ${feature.icon} text-xs`}></i>
                   </span>
                   {feature.title}
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 relative">
          <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
             <img src="https://picsum.photos/seed/flux/800/1000" alt="Atmosphere" className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-700" />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 max-w-[180px]">
             <div className="text-indigo-600 font-black text-3xl">98%</div>
             <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Satisfaction Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
