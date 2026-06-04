// ===== MEMBRE =====
export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  joinDate: string;
  status: 'actif' | 'inactif' | 'visiteur';
  role: 'membre' | 'diacre' | 'pasteur' | 'ancien' | 'responsable';
  groups: string[];
  avatar?: string;
  notes?: string;
}

// ===== FINANCE =====
export interface Transaction {
  id: string;
  date: string;
  type: 'recette' | 'depense';
  category: string;
  description: string;
  amount: number;
  paymentMethod: 'especes' | 'virement' | 'cheque' | 'mobile';
  memberId?: string;
  reference?: string;
}

export interface Budget {
  id: string;
  year: number;
  month: number;
  category: string;
  allocated: number;
  spent: number;
}

// ===== EVENEMENT =====
export interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  time: string;
  location: string;
  type: 'culte' | 'reunion' | 'conference' | 'formation' | 'social' | 'autre';
  status: 'planifie' | 'en_cours' | 'termine' | 'annule';
  organizer: string;
  maxAttendees?: number;
  attendees: string[];
  recurring?: boolean;
  recurringPattern?: string;
}

// ===== GROUPE =====
export interface Group {
  id: string;
  name: string;
  description: string;
  type: 'cellule' | 'chorale' | 'jeunesse' | 'femmes' | 'hommes' | 'enfants' | 'service' | 'autre';
  leader: string;
  members: string[];
  meetingDay?: string;
  meetingTime?: string;
  meetingLocation?: string;
  active: boolean;
}

// ===== PRESENCE =====
export interface Attendance {
  id: string;
  eventId: string;
  date: string;
  presentMembers: string[];
  totalPresent: number;
  totalMembers: number;
  notes?: string;
}

// ===== STATISTIQUES =====
export interface Stats {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  totalGroups: number;
  eventsThisMonth: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}
