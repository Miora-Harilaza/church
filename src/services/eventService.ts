
import supabase from '../lib/supabaseclient';
import type { ChurchEvent } from '../types';

export interface EventRow {
  id: string;
  titre: string;
  description: string | null;
  date: string;
  heure: string | null;
  lieu: string | null;
  capacite: number | null;
  type: string | null;
  statut: string | null;
  organisation: string | null;
  created_at: string;
  updated_at: string;
}

// Convertir la base de données vers ChurchEvent
const dbToChurchEvent = (event: EventRow): ChurchEvent => ({
  id: event.id,
  title: event.titre,
  description: event.description || '',
  date: event.date,
  time: event.heure || '10:00',
  location: event.lieu || '',
  maxAttendees: event.capacite || undefined,
  type: (event.type as ChurchEvent['type']) || 'autre',
  status: (event.statut as ChurchEvent['status']) || 'planifie',
  organizer: event.organisation || '',
  attendees: [],
  recurring: false,
  recurringPattern: undefined
});

// Convertir ChurchEvent vers base de données
const churchEventToDB = (event: Omit<ChurchEvent, 'id'> | ChurchEvent): Omit<EventRow, 'id' | 'created_at' | 'updated_at'> => ({
  titre: event.title,
  description: event.description || null,
  date: event.date,
  heure: event.time,
  lieu: event.location,
  capacite: event.maxAttendees || null,
  type: event.type,
  statut: event.status,
  organisation: event.organizer || null
});

export const eventService = {
  // Récupérer tous les événements
  async getEvents(): Promise<ChurchEvent[]> {
    const { data, error } = await supabase
      .from('evenement')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(dbToChurchEvent);
  },

  // Récupérer un événement spécifique
  async getEvent(id: string): Promise<ChurchEvent | null> {
    const { data, error } = await supabase
      .from('evenement')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data ? dbToChurchEvent(data) : null;
  },

  // Ajouter un événement
  async addEvent(event: Omit<ChurchEvent, 'id'>): Promise<ChurchEvent> {
    const { data, error } = await supabase
      .from('evenement')
      .insert(churchEventToDB(event))
      .select()
      .single();
    
    if (error) throw error;
    return dbToChurchEvent(data);
  },

  // Mettre à jour un événement
  async updateEvent(id: string, event: Partial<ChurchEvent>): Promise<ChurchEvent> {
    const updateData: any = {};
    if (event.title !== undefined) updateData.titre = event.title;
    if (event.description !== undefined) updateData.description = event.description;
    if (event.date !== undefined) updateData.date = event.date;
    if (event.time !== undefined) updateData.heure = event.time;
    if (event.location !== undefined) updateData.lieu = event.location;
    if (event.maxAttendees !== undefined) updateData.capacite = event.maxAttendees;
    if (event.type !== undefined) updateData.type = event.type;
    if (event.status !== undefined) updateData.statut = event.status;
    if (event.organizer !== undefined) updateData.organisation = event.organizer;
    
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('evenement')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return dbToChurchEvent(data);
  },

  // Supprimer un événement
  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('evenement')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Mettre à jour le statut d'un événement
  async updateStatus(id: string, status: ChurchEvent['status']): Promise<ChurchEvent> {
    const { data, error } = await supabase
      .from('evenement')
      .update({ statut: status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return dbToChurchEvent(data);
  },

  // Récupérer les événements à venir
  async getUpcomingEvents(): Promise<ChurchEvent[]> {
    const { data, error } = await supabase
      .from('evenement')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(dbToChurchEvent);
  }
};