import React, { createContext, useContext, useEffect, useState } from 'react';

import { User } from '@supabase/supabase-js';
import supabase from '../lib/supabaseclient';

interface Member {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  faritra: string;
  sokajy: string;
  email: string;
  created_at: string;
}

interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: string;
  status: string;
  organizer: string;
  attendees: string[];
  maxAttendees?: number;
  recurring: boolean;
  recurringPattern?: string;
}

interface Transaction {
  id: string;
  type: 'revenu' | 'depense';
  date: string;
  categorie: string;
  montant: number;
  description: string;
  mode_payement: string;
  referance: string;
}

interface Group {
  id: string;
  nom: string;
  description: string;
  type: string;
  jour_reunion: string;
  heure_reunion: string;
  lieu_reunion: string;
  members?: string[];
  active?: boolean;
}

interface Attendance {
  id: string;
  date: string;
  totalPresent: number;
  totalMembers: number;
}

interface AppContextType {
  // Auth
  user: User | null;
  userRole: string;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  
  // Données
  members: Member[];
  events: ChurchEvent[];
  transactions: Transaction[];
  groups: Group[];
  attendance: Attendance[];
  
  // Méthodes
  refreshEvents: () => Promise<void>;
  addEvent: (event: ChurchEvent) => Promise<void>;
  updateEvent: (event: ChurchEvent) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getMemberFullName: (id: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);
  
  // Data state
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);

  // Auth functions
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserRole(session.user.id);
      } else {
        setUserRole('user');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Erreur rôle:', error);
      setUserRole('user');
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Chargement des données
  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('membre')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Erreur membres:', error);
      setMembers([]);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('evenement')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      
      // Transformer les données
      const formattedEvents: ChurchEvent[] = (data || []).map((e: any) => ({
        id: e.id,
        title: e.titre,
        description: e.description || '',
        date: e.date,
        time: e.heure || '10:00',
        location: e.lieu || '',
        type: e.type || 'autre',
        status: e.statut || 'planifie',
        organizer: e.organisation || '',
        attendees: [],
        maxAttendees: e.capacite,
        recurring: false,
        recurringPattern: '',
      }));
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Erreur événements:', error);
      setEvents([]);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('finances')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Erreur finances:', error);
      setTransactions([]);
    }
  };

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('sampana')
        .select('*');

      if (error) throw error;
      
      const formattedGroups: Group[] = (data || []).map((g: any) => ({
        ...g,
        active: true,
        members: [],
      }));
      
      setGroups(formattedGroups);
    } catch (error) {
      console.error('Erreur groupes:', error);
      setGroups([]);
    }
  };

  // CRUD Events
  const refreshEvents = async () => {
    await fetchEvents();
  };

  const addEvent = async (event: ChurchEvent) => {
    const { error } = await supabase
      .from('evenement')
      .insert([{
        id: event.id,
        titre: event.title,
        description: event.description,
        date: event.date,
        heure: event.time,
        lieu: event.location,
        type: event.type,
        statut: event.status,
        organisation: event.organizer,
        capacite: event.maxAttendees,
           organisateurs: event.organisateurs || [], // Ajout des organisateurs
      }]);

    if (error) throw error;
    await fetchEvents();
  };

  const updateEvent = async (event: ChurchEvent) => {
    const { error } = await supabase
      .from('evenement')
      .update({
        titre: event.title,
        description: event.description,
        date: event.date,
        heure: event.time,
        lieu: event.location,
        type: event.type,
        statut: event.status,
        organisation: event.organizer,
        capacite: event.maxAttendees,
      })
      .eq('id', event.id);

    if (error) throw error;
    await fetchEvents();
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase
      .from('evenement')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchEvents();
  };

  const getMemberFullName = (id: string) => {
    const member = members.find(m => m.id === id);
    if (member) return `${member.prenom} ${member.nom}`;
    return 'Inconnu';
  };

  // Chargement initial des données
  useEffect(() => {
    if (user) {
      fetchMembers();
      fetchEvents();
      fetchTransactions();
      fetchGroups();
    }
  }, [user]);

  const value = {
    user,
    userRole,
    loading,
    signIn,
    signOut,
    members,
    events,
    transactions,
    groups,
    attendance,
    refreshEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    getMemberFullName,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}