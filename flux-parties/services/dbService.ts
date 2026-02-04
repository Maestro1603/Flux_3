
import { Guest, Wave, Expense, Admin, PaymentMethod, UserRole, User, Ticket, TicketSecurity, TicketStatus, Payment } from '../types.ts';
import { INITIAL_WAVES } from '../constants.ts';

const DB_KEYS = {
  USERS: 'em_users_v2',
  TICKETS: 'em_tickets_v2',
  SECURITY: 'em_security_v2',
  STATUS: 'em_status_v2',
  PAYMENTS: 'em_payments_v2',
  WAVES: 'em_waves_v2',
  EXPENSES: 'em_expenses_v2',
  ADMINS: 'em_admins_v2',
  SESSION: 'em_session_v2'
};

const generateToken = (length = 10) => Math.random().toString(36).substring(2, 2 + length).toUpperCase();

export class DBService {
  private static init() {
    if (!localStorage.getItem(DB_KEYS.WAVES)) localStorage.setItem(DB_KEYS.WAVES, JSON.stringify(INITIAL_WAVES));
    if (!localStorage.getItem(DB_KEYS.USERS)) localStorage.setItem(DB_KEYS.USERS, JSON.stringify([]));
    if (!localStorage.getItem(DB_KEYS.TICKETS)) localStorage.setItem(DB_KEYS.TICKETS, JSON.stringify([]));
    if (!localStorage.getItem(DB_KEYS.SECURITY)) localStorage.setItem(DB_KEYS.SECURITY, JSON.stringify([]));
    if (!localStorage.getItem(DB_KEYS.STATUS)) localStorage.setItem(DB_KEYS.STATUS, JSON.stringify([]));
    if (!localStorage.getItem(DB_KEYS.PAYMENTS)) localStorage.setItem(DB_KEYS.PAYMENTS, JSON.stringify([]));
    if (!localStorage.getItem(DB_KEYS.EXPENSES)) localStorage.setItem(DB_KEYS.EXPENSES, JSON.stringify([]));
    if (!localStorage.getItem(DB_KEYS.ADMINS)) {
      localStorage.setItem(DB_KEYS.ADMINS, JSON.stringify([
        { id: 'admin-1', username: 'Admin', password_hash: 'Flux_9174', role: UserRole.ADMIN },
        { id: 'sec-1', username: 'Security', password_hash: 'Secure_8749', role: UserRole.SECURITY }
      ]));
    }
  }

  private static getTable<T>(key: string): T[] {
    this.init();
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  private static saveTable<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  static getGuests(): Guest[] {
    const users = this.getTable<User>(DB_KEYS.USERS);
    const tickets = this.getTable<Ticket>(DB_KEYS.TICKETS);
    const security = this.getTable<TicketSecurity>(DB_KEYS.SECURITY);
    const status = this.getTable<TicketStatus>(DB_KEYS.STATUS);
    const payments = this.getTable<Payment>(DB_KEYS.PAYMENTS);
    const waves = this.getWaves();

    return tickets.map(t => {
      const u = users.find(user => user.id === t.user_id)!;
      const s = security.find(sec => sec.ticket_id === t.id)!;
      const st = status.find(stat => stat.ticket_id === t.id)!;
      const p = payments.find(pay => pay.ticket_id === t.id)!;
      const w = waves.find(wave => wave.id === t.wave_id)!;

      const remainder = w.price - w.deduction;
      const share = remainder / 3;

      return {
        ...u, ...t, ...s, ...st, ...p,
        misarah_profit: w.deduction + share,
        domz_profit: share,
        satea_profit: share,
        payment_method: p.method
      };
    });
  }

  static getGuestByToken(token: string): Guest | null {
    const guests = this.getGuests();
    const cleanToken = token.trim().toUpperCase();
    return guests.find(g => 
      g.qr_token === cleanToken || 
      g.qr_entry_token === cleanToken || 
      g.qr_exit_token === cleanToken
    ) || null;
  }

  static saveGuest(data: { name: string; instagram: string; phone: string; payment_method: PaymentMethod; proof_file_path: string }): Guest {
    const waves = this.getWaves();
    const activeWave = waves.find(w => w.active) || waves[0];
    const tickets = this.getTable<Ticket>(DB_KEYS.TICKETS);
    const lastUserId = tickets.length > 0 ? Math.max(...tickets.map(t => t.userId)) : 0;

    const userId = Math.random().toString(36).substring(2, 11);
    const ticketId = Math.random().toString(36).substring(2, 11);

    const newUser: User = { id: userId, name: data.name, instagram: data.instagram, phone: data.phone };
    const newTicket: Ticket = { id: ticketId, user_id: userId, wave_id: activeWave.id, userId: lastUserId + 1, created_at: new Date().toISOString() };
    const newSecurity: TicketSecurity = { ticket_id: ticketId, qr_token: generateToken(8), qr_entry_token: 'EN-' + generateToken(12), qr_exit_token: 'EX-' + generateToken(12) };
    const newStatus: TicketStatus = { ticket_id: ticketId, approved: false, checked_in: false, checkin_time: null, checked_out: false, checkout_time: null, scan_count: 0 };
    const newPayment: Payment = { ticket_id: ticketId, method: data.payment_method, amount_due: activeWave.price, amount_paid: 0, proof_file_path: data.proof_file_path };

    this.saveTable(DB_KEYS.USERS, [...this.getTable<User>(DB_KEYS.USERS), newUser]);
    this.saveTable(DB_KEYS.TICKETS, [...tickets, newTicket]);
    this.saveTable(DB_KEYS.SECURITY, [...this.getTable<TicketSecurity>(DB_KEYS.SECURITY), newSecurity]);
    this.saveTable(DB_KEYS.STATUS, [...this.getTable<TicketStatus>(DB_KEYS.STATUS), newStatus]);
    this.saveTable(DB_KEYS.PAYMENTS, [...this.getTable<Payment>(DB_KEYS.PAYMENTS), newPayment]);

    const updatedWaves = waves.map(w => w.id === activeWave.id ? { ...w, sold_count: w.sold_count + 1 } : w);
    this.saveTable(DB_KEYS.WAVES, updatedWaves);

    return this.getGuests().find(g => g.id === ticketId)!;
  }

  static approveGuest(id: string): void {
    const status = this.getTable<TicketStatus>(DB_KEYS.STATUS);
    const payments = this.getTable<Payment>(DB_KEYS.PAYMENTS);
    
    this.saveTable(DB_KEYS.STATUS, status.map(s => s.ticket_id === id ? { ...s, approved: true } : s));
    this.saveTable(DB_KEYS.PAYMENTS, payments.map(p => p.ticket_id === id ? { ...p, amount_paid: p.amount_due } : p));
  }

  static updateGuest(guest: Guest): void {
    const users = this.getTable<User>(DB_KEYS.USERS).map(u => u.id === guest.user_id ? { id: u.id, name: guest.name, instagram: guest.instagram, phone: guest.phone } : u);
    const status = this.getTable<TicketStatus>(DB_KEYS.STATUS).map(s => s.ticket_id === guest.id ? { ...guest } : s);
    const payments = this.getTable<Payment>(DB_KEYS.PAYMENTS).map(p => p.ticket_id === guest.id ? { ...guest, method: guest.payment_method } : p);
    
    this.saveTable(DB_KEYS.USERS, users);
    this.saveTable(DB_KEYS.STATUS, status);
    this.saveTable(DB_KEYS.PAYMENTS, payments);
  }

  static deleteGuest(id: string): void {
    const tickets = this.getTable<Ticket>(DB_KEYS.TICKETS);
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;

    this.saveTable(DB_KEYS.TICKETS, tickets.filter(t => t.id !== id));
    this.saveTable(DB_KEYS.USERS, this.getTable<User>(DB_KEYS.USERS).filter(u => u.id !== ticket.user_id));
    this.saveTable(DB_KEYS.SECURITY, this.getTable<TicketSecurity>(DB_KEYS.SECURITY).filter(s => s.ticket_id !== id));
    this.saveTable(DB_KEYS.STATUS, this.getTable<TicketStatus>(DB_KEYS.STATUS).filter(s => s.ticket_id !== id));
    this.saveTable(DB_KEYS.PAYMENTS, this.getTable<Payment>(DB_KEYS.PAYMENTS).filter(p => p.ticket_id !== id));

    const waves = this.getWaves();
    this.saveTable(DB_KEYS.WAVES, waves.map(w => w.id === ticket.wave_id ? { ...w, sold_count: Math.max(0, w.sold_count - 1) } : w));
  }

  static clearAllGuests(): void {
    this.saveTable(DB_KEYS.USERS, []);
    this.saveTable(DB_KEYS.TICKETS, []);
    this.saveTable(DB_KEYS.SECURITY, []);
    this.saveTable(DB_KEYS.STATUS, []);
    this.saveTable(DB_KEYS.PAYMENTS, []);
    this.saveTable(DB_KEYS.WAVES, this.getWaves().map(w => ({ ...w, sold_count: 0 })));
  }

  static clearAllExpenses(): void { this.saveTable(DB_KEYS.EXPENSES, []); }
  static getWaves(): Wave[] { return this.getTable<Wave>(DB_KEYS.WAVES); }
  static updateWave(wave: Wave): void { this.saveTable(DB_KEYS.WAVES, this.getWaves().map(w => w.id === wave.id ? wave : w)); }
  static setActiveWave(id: string): void { this.saveTable(DB_KEYS.WAVES, this.getWaves().map(w => ({ ...w, active: w.id === id }))); }
  static getExpenses(): Expense[] { return this.getTable<Expense>(DB_KEYS.EXPENSES); }
  static addExpense(e: Omit<Expense, 'id' | 'created_at'>): void { this.saveTable(DB_KEYS.EXPENSES, [...this.getTable<Expense>(DB_KEYS.EXPENSES), { ...e, id: Math.random().toString(36).substring(2, 11), created_at: new Date().toISOString() }]); }
  static deleteExpense(id: string): void { this.saveTable(DB_KEYS.EXPENSES, this.getTable<Expense>(DB_KEYS.EXPENSES).filter(e => e.id !== id)); }

  static login(u: string, p: string): Admin | null {
    const admin = this.getTable<Admin>(DB_KEYS.ADMINS).find(a => a.username.toLowerCase() === u.toLowerCase() && a.password_hash === p);
    if (admin) localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(admin));
    return admin || null;
  }

  static getSession(): Admin | null { const s = localStorage.getItem(DB_KEYS.SESSION); return s ? JSON.parse(s) : null; }
  static logout(): void { localStorage.removeItem(DB_KEYS.SESSION); }

  static checkIn(token: string): { success: boolean, message: string, isReuse: boolean } {
    const guests = this.getGuests();
    const g = guests.find(g => g.qr_entry_token === token || g.qr_token === token);
    if (!g) return { success: false, message: "Invalid Entry Pass", isReuse: false };
    if (!g.approved) return { success: false, message: "Payment Not Approved", isReuse: false };
    if (g.checked_in) return { success: false, message: `ALREADY IN: User #${g.userId}`, isReuse: true };

    const status = this.getTable<TicketStatus>(DB_KEYS.STATUS);
    this.saveTable(DB_KEYS.STATUS, status.map(s => s.ticket_id === g.id ? { ...s, checked_in: true, checkin_time: new Date().toISOString(), scan_count: s.scan_count + 1 } : s));
    return { success: true, message: `Check-in OK: ${g.name}`, isReuse: false };
  }

  static checkOut(token: string): { success: boolean, message: string, isReuse: boolean } {
    const guests = this.getGuests();
    const g = guests.find(g => g.qr_exit_token === token || g.qr_token === token);
    if (!g) return { success: false, message: "Invalid Exit Pass", isReuse: false };
    if (!g.checked_in) return { success: false, message: "User not checked in", isReuse: false };
    if (g.checked_out) return { success: false, message: `ALREADY OUT: User #${g.userId}`, isReuse: true };

    const status = this.getTable<TicketStatus>(DB_KEYS.STATUS);
    this.saveTable(DB_KEYS.STATUS, status.map(s => s.ticket_id === g.id ? { ...s, checked_out: true, checkout_time: new Date().toISOString() } : s));
    return { success: true, message: `Check-out OK: ${g.name}`, isReuse: false };
  }
}
