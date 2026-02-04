
export enum PaymentMethod {
  INSTAPAY = 'Instapay',
  TELDA = 'Telda'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  SECURITY = 'SECURITY'
}

// Entity 1: User Profile (Master Data)
export interface User {
  id: string;
  name: string;
  instagram: string;
  phone: string;
}

// Entity 2: Wave Configuration
export interface Wave {
  id: string;
  name: string;
  price: number;
  deduction: number;
  max_tickets: number;
  sold_count: number;
  active: boolean;
}

// Entity 3: Ticket (Core Transaction)
export interface Ticket {
  id: string;
  userId: number; // Sequential display ID
  user_id: string;
  wave_id: string;
  created_at: string;
}

// Entity 4: Ticket Security Tokens (Separated for security isolation)
export interface TicketSecurity {
  ticket_id: string;
  qr_token: string;
  qr_entry_token: string;
  qr_exit_token: string;
}

// Entity 5: Ticket Entry Status (Volatile Data)
export interface TicketStatus {
  ticket_id: string;
  approved: boolean;
  checked_in: boolean;
  checkin_time: string | null;
  checked_out: boolean;
  checkout_time: string | null;
  scan_count: number;
}

// Entity 6: Payment Transaction
export interface Payment {
  ticket_id: string;
  method: PaymentMethod;
  amount_due: number;
  amount_paid: number;
  proof_file_path: string | null;
}

// Aggregate View (Used by UI)
export interface Guest extends User, Ticket, TicketSecurity, TicketStatus, Payment {
  // Calculated Profit Properties (Snapshots taken at time of purchase)
  misarah_profit: number;
  domz_profit: number;
  satea_profit: number;
  // Compatibility field for old UI logic
  payment_method: PaymentMethod;
}

export interface Expense {
  id: string;
  type: string;
  amount: number;
  note: string;
  created_at: string;
}

export interface Admin {
  id: string;
  username: string;
  password_hash: string;
  role: UserRole;
}

export type ViewState = 'HOME' | 'REGISTER' | 'TERMS' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD' | 'SECURITY_DASHBOARD' | 'TICKET_VIEW' | 'RETRIEVE_TICKET';
