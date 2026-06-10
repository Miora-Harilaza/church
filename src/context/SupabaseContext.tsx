import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { eventService } from '../services/eventService';
import type { ChurchEvent, Member } from '../types';

interface AppContextType {
  events: ChurchEvent[];
  members: Member[];
  loading: boolean;
  addEvent: (event: Omit<ChurchEvent, 'id'>) => Promise<void>;
  updateEvent: (event: ChurchEvent) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
  getMemberFullName: (id: string) => string;
  userRole: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      const data = await eventService.getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('membres')
        .select('*')
        .order('last_name');
      
      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const loadUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Option 1: avec les métadonnées
        const role = user.user_metadata?.role || 'user';
        setUserRole(role);
        
        // Option 2: avec table user_roles
        // const { data } = await supabase
        //   .from('user_roles')
        //   .select('role')
        //   .eq('user_id', user.id)
        //   .single();
        // setUserRole(data?.role || 'user');
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  useEffect(() => {
    loadEvents();
    loadMembers();
    loadUserRole();
    setLoading(false);
  }, []);

  const addEvent = async (event: Omit<ChurchEvent, 'id'>) => {
    const newEvent = await eventService.addEvent(event);
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = async (event: ChurchEvent) => {
    const updated = await eventService.updateEvent(event.id, event);
    setEvents(prev => prev.map(e => e.id === event.id ? updated : e));
  };

  const deleteEvent = async (id: string) => {
    await eventService.deleteEvent(id);
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const refreshEvents = async () => {
    await loadEvents();
  };

  const getMemberFullName = (id: string) => {
    const member = members.find(m => m.id === id);
    return member ? `${member.first_name} ${member.last_name}` : id;
  };

  return (
    <AppContext.Provider value={{
      events,
      members,
      loading,
      addEvent,
      updateEvent,
      deleteEvent,
      refreshEvents,
      getMemberFullName,
      userRole
    }}>
      {children}
    </AppContext.Provider>
  );
}