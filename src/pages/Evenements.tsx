import { useState } from 'react'
import { useApp } from '../context/AppContext'
import type { ChurchEvent } from '../types'
import { Plus, Calendar, MapPin, Clock, Users, X, Edit2, Trash2, CheckCircle, XCircle, PlayCircle } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const typeColors: Record<string, string> = {
  culte: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  reunion: 'bg-blue-100 text-blue-700 border-blue-200',
  conference: 'bg-purple-100 text-purple-700 border-purple-200',
  formation: 'bg-amber-100 text-amber-700 border-amber-200',
  social: 'bg-green-100 text-green-700 border-green-200',
  autre: 'bg-gray-100 text-gray-700 border-gray-200',
}
const typeLabels: Record<string, string> = {
  culte: '🙏 Culte', reunion: '🤝 Réunion', conference: '🎤 Conférence',
  formation: '📚 Formation', social: '🎉 Social', autre: '📌 Autre',
}
const statusColors: Record<string, string> = {
  planifie: 'bg-blue-100 text-blue-700',
  en_cours: 'bg-amber-100 text-amber-700',
  termine: 'bg-green-100 text-green-700',
  annule: 'bg-red-100 text-red-700',
}
const statusIcons: Record<string, React.ElementType> = {
  planifie: Clock, en_cours: PlayCircle, termine: CheckCircle, annule: XCircle,
}

const defaultEvent: Omit<ChurchEvent, 'id'> = {
  title: '', description: '', date: new Date().toISOString().split('T')[0],
  time: '10:00', location: '', type: 'culte', status: 'planifie',
  organizer: '', attendees: [], recurring: false,
}

function EventModal({ event, onClose, onSave }: {
  event: ChurchEvent | null
  onClose: () => void
  onSave: (e: ChurchEvent) => void
}) {
  const { members } = useApp()
  const [form, setForm] = useState<Omit<ChurchEvent, 'id'>>(event ? { ...event } : { ...defaultEvent })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...form, id: event?.id || crypto.randomUUID() })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">
            {event ? 'Modifier l\'événement' : 'Nouvel événement'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input required className="input-field" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} className="input-field resize-none" value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input required type="date" className="input-field" value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure *</label>
              <input required type="time" className="input-field" value={form.time}
                onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu *</label>
              <input required className="input-field" value={form.location}
                onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacité max</label>
              <input type="number" min="0" className="input-field" value={form.maxAttendees || ''}
                onChange={e => setForm(p => ({ ...p, maxAttendees: e.target.value ? Number(e.target.value) : undefined }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="input-field" value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value as ChurchEvent['type'] }))}>
                <option value="culte">🙏 Culte</option>
                <option value="reunion">🤝 Réunion</option>
                <option value="conference">🎤 Conférence</option>
                <option value="formation">📚 Formation</option>
                <option value="social">🎉 Social</option>
                <option value="autre">📌 Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select className="input-field" value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as ChurchEvent['status'] }))}>
                <option value="planifie">Planifié</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
                <option value="annule">Annulé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organisateur</label>
              <select className="input-field" value={form.organizer}
                onChange={e => setForm(p => ({ ...p, organizer: e.target.value }))}>
                <option value="">-- Sélectionner --</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input type="checkbox" id="recurring" checked={form.recurring}
                onChange={e => setForm(p => ({ ...p, recurring: e.target.checked }))}
                className="w-4 h-4 text-indigo-600" />
              <label htmlFor="recurring" className="text-sm font-medium text-gray-700">Événement récurrent</label>
            </div>
          </div>
          {form.recurring && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
              <input className="input-field" placeholder="Ex: Chaque dimanche" value={form.recurringPattern || ''}
                onChange={e => setForm(p => ({ ...p, recurringPattern: e.target.value }))} />
            </div>
          )}
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Annuler</button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              {event ? 'Modifier' : 'Créer l\'événement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EventDetailModal({ event, onClose, onEdit }: { event: ChurchEvent, onClose: () => void, onEdit: () => void }) {
  const { getMemberFullName } = useApp()
  const StatusIcon = statusIcons[event.status]
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">Détails de l'événement</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border ${typeColors[event.type]} mb-4`}>
            {typeLabels[event.type]}
          </div>
          <h4 className="text-2xl font-bold text-gray-800 mb-2">{event.title}</h4>
          {event.description && <p className="text-gray-600 mb-4">{event.description}</p>}
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-indigo-500" />
              <span>{format(new Date(event.date), 'EEEE d MMMM yyyy', { locale: fr })}</span>
            </div>
            <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-indigo-500" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-indigo-500" />
              <span>{event.location}</span>
            </div>
            {event.organizer && (
              <div className="flex items-center gap-3"><Users className="w-4 h-4 text-indigo-500" />
                <span>Organisé par {getMemberFullName(event.organizer)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <StatusIcon className="w-4 h-4" />
              <span className={`badge ${statusColors[event.status]}`}>{event.status.replace('_', ' ')}</span>
            </div>
            {event.maxAttendees && (
              <p className="text-gray-600">👥 Capacité : {event.attendees.length}/{event.maxAttendees} participants</p>
            )}
            {event.recurring && <p className="text-gray-600">🔄 {event.recurringPattern}</p>}
          </div>
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button onClick={onClose} className="btn-secondary flex-1 justify-center">Fermer</button>
            <button onClick={onEdit} className="btn-primary flex-1 justify-center"><Edit2 className="w-4 h-4" />Modifier</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Evenements() {
  const { events, addEvent, updateEvent, deleteEvent, getMemberFullName } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [editEvent, setEditEvent] = useState<ChurchEvent | null>(null)
  const [viewEvent, setViewEvent] = useState<ChurchEvent | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'liste' | 'calendrier'>('liste')

  const filtered = events.filter(e => {
    const matchType = filterType === 'all' || e.type === filterType
    const matchStatus = filterStatus === 'all' || e.status === filterStatus
    return matchType && matchStatus
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const upcoming = filtered.filter(e => new Date(e.date) >= new Date())
  const past = filtered.filter(e => new Date(e.date) < new Date())

  const handleSave = (e: ChurchEvent) => {
    if (editEvent) updateEvent(e)
    else addEvent(e)
    setShowModal(false); setEditEvent(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cet événement ?')) deleteEvent(id)
  }

  const EventCard = ({ event }: { event: ChurchEvent }) => {
    const StatusIcon = statusIcons[event.status]
    const isPast = new Date(event.date) < new Date()
    return (
      <div className={`card hover:shadow-md transition-all cursor-pointer ${isPast ? 'opacity-70' : ''}`}
        onClick={() => setViewEvent(event)}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`badge border ${typeColors[event.type]}`}>{typeLabels[event.type]}</span>
            <span className={`badge ${statusColors[event.status]}`}>
              <StatusIcon className="w-3 h-3 mr-1 inline" />{event.status.replace('_', ' ')}
            </span>
          </div>
          <div className="flex gap-1" onClick={ev => ev.stopPropagation()}>
            <button onClick={() => { setEditEvent(event); setShowModal(true) }}
              className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => handleDelete(event.id)}
              className="p-1.5 hover:bg-red-50 rounded-lg text-red-600">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <h4 className="font-bold text-gray-800 mb-2">{event.title}</h4>
        {event.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{event.description}</p>}
        <div className="space-y-1.5 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>{format(new Date(event.date), 'EEE d MMM yyyy', { locale: fr })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-400" />
            <span className="truncate">{event.location}</span>
          </div>
          {event.organizer && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>{getMemberFullName(event.organizer)}</span>
            </div>
          )}
        </div>
        {event.maxAttendees && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Participants</span>
              <span>{event.attendees.length}/{event.maxAttendees}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-indigo-500 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, (event.attendees.length / event.maxAttendees) * 100)}%` }}
              />
            </div>
          </div>
        )}
        {event.recurring && (
          <p className="mt-2 text-xs text-indigo-500 font-medium">🔄 {event.recurringPattern}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: events.length, color: 'bg-indigo-500' },
          { label: 'À venir', value: events.filter(e => new Date(e.date) >= new Date() && e.status === 'planifie').length, color: 'bg-blue-500' },
          { label: 'Terminés', value: events.filter(e => e.status === 'termine').length, color: 'bg-green-500' },
          { label: 'Annulés', value: events.filter(e => e.status === 'annule').length, color: 'bg-red-500' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3">
            <div className={`w-3 h-10 ${s.color} rounded-full`} />
            <div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <select className="input-field max-w-[180px]" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">Tous types</option>
              <option value="culte">Culte</option>
              <option value="reunion">Réunion</option>
              <option value="conference">Conférence</option>
              <option value="formation">Formation</option>
              <option value="social">Social</option>
            </select>
            <select className="input-field max-w-[160px]" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">Tous statuts</option>
              <option value="planifie">Planifiés</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminés</option>
              <option value="annule">Annulés</option>
            </select>
          </div>
          <button onClick={() => { setEditEvent(null); setShowModal(true) }} className="btn-primary whitespace-nowrap">
            <Plus className="w-4 h-4" /> Nouvel événement
          </button>
        </div>
      </div>

      {/* À venir */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Événements à venir ({upcoming.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {upcoming.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        </div>
      )}

      {/* Passés */}
      {past.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-500 mb-3">Événements passés ({past.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {past.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="card text-center py-16">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-200" />
          <p className="text-gray-400 text-lg">Aucun événement trouvé</p>
        </div>
      )}

      {showModal && (
        <EventModal event={editEvent} onClose={() => { setShowModal(false); setEditEvent(null) }} onSave={handleSave} />
      )}
      {viewEvent && (
        <EventDetailModal
          event={viewEvent}
          onClose={() => setViewEvent(null)}
          onEdit={() => { setEditEvent(viewEvent); setViewEvent(null); setShowModal(true) }}
        />
      )}
    </div>
  )
}
