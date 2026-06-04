import { useState } from 'react'
import { useApp } from '../context/AppContext'
import type { Group } from '../types'
import { Plus, Users, MapPin, Clock, X, Edit2, Trash2, Calendar, UserPlus } from 'lucide-react'

const typeColors: Record<string, string> = {
  cellule: 'bg-indigo-100 text-indigo-700',
  chorale: 'bg-pink-100 text-pink-700',
  jeunesse: 'bg-amber-100 text-amber-700',
  femmes: 'bg-rose-100 text-rose-700',
  hommes: 'bg-blue-100 text-blue-700',
  enfants: 'bg-green-100 text-green-700',
  service: 'bg-purple-100 text-purple-700',
  autre: 'bg-gray-100 text-gray-700',
}
const typeEmojis: Record<string, string> = {
  cellule: '🏠', chorale: '🎵', jeunesse: '🌟', femmes: '👩',
  hommes: '👨', enfants: '👶', service: '🛠️', autre: '📌',
}

const defaultGroup: Omit<Group, 'id'> = {
  name: '', description: '', type: 'cellule', leader: '',
  members: [], meetingDay: '', meetingTime: '', meetingLocation: '', active: true,
}

function GroupModal({ group, onClose, onSave }: {
  group: Group | null
  onClose: () => void
  onSave: (g: Group) => void
}) {
  const { members } = useApp()
  const [form, setForm] = useState<Omit<Group, 'id'>>(group ? { ...group } : { ...defaultGroup })

  const toggleMember = (id: string) => {
    setForm(p => ({
      ...p,
      members: p.members.includes(id) ? p.members.filter(m => m !== id) : [...p.members, id]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...form, id: group?.id || crypto.randomUUID() })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">{group ? 'Modifier le groupe' : 'Nouveau groupe'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du groupe *</label>
              <input required className="input-field" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={2} className="input-field resize-none" value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="input-field" value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value as Group['type'] }))}>
                <option value="cellule">🏠 Cellule</option>
                <option value="chorale">🎵 Chorale</option>
                <option value="jeunesse">🌟 Jeunesse</option>
                <option value="femmes">👩 Femmes</option>
                <option value="hommes">👨 Hommes</option>
                <option value="enfants">👶 Enfants</option>
                <option value="service">🛠️ Service</option>
                <option value="autre">📌 Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
              <select className="input-field" value={form.leader}
                onChange={e => setForm(p => ({ ...p, leader: e.target.value }))}>
                <option value="">-- Sélectionner --</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jour de réunion</label>
              <input className="input-field" placeholder="ex: Vendredi" value={form.meetingDay}
                onChange={e => setForm(p => ({ ...p, meetingDay: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure de réunion</label>
              <input type="time" className="input-field" value={form.meetingTime}
                onChange={e => setForm(p => ({ ...p, meetingTime: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de réunion</label>
              <input className="input-field" value={form.meetingLocation}
                onChange={e => setForm(p => ({ ...p, meetingLocation: e.target.value }))} />
            </div>
          </div>

          {/* Membres */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Membres du groupe ({form.members.length} sélectionné(s))
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {members.map(m => (
                <label key={m.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg">
                  <input type="checkbox" checked={form.members.includes(m.id)}
                    onChange={() => toggleMember(m.id)} className="w-4 h-4 text-indigo-600" />
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700">
                    {m.firstName[0]}
                  </div>
                  <span className="text-sm text-gray-700 truncate">{m.firstName} {m.lastName}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Annuler</button>
            <button type="submit" className="btn-primary flex-1 justify-center">{group ? 'Modifier' : 'Créer'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Groupes() {
  const { groups, members, addGroup, updateGroup, deleteGroup, getMemberFullName } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [editGroup, setEditGroup] = useState<Group | null>(null)
  const [filterType, setFilterType] = useState<string>('all')

  const filtered = groups.filter(g => filterType === 'all' || g.type === filterType)

  const handleSave = (g: Group) => {
    if (editGroup) updateGroup(g)
    else addGroup(g)
    setShowModal(false); setEditGroup(null)
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{groups.length}</p>
            <p className="text-sm text-gray-500">Total groupes</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{groups.filter(g => g.active).length}</p>
            <p className="text-sm text-gray-500">Actifs</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{groups.reduce((s, g) => s + g.members.length, 0)}</p>
            <p className="text-sm text-gray-500">Membres en groupes</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {members.filter(m => groups.some(g => g.members.includes(m.id))).length}
            </p>
            <p className="text-sm text-gray-500">Membres assignés</p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <select className="input-field max-w-[200px]" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">Tous les types</option>
            <option value="cellule">Cellules</option>
            <option value="chorale">Chorales</option>
            <option value="jeunesse">Jeunesse</option>
            <option value="femmes">Femmes</option>
            <option value="hommes">Hommes</option>
            <option value="enfants">Enfants</option>
            <option value="service">Service</option>
          </select>
          <button onClick={() => { setEditGroup(null); setShowModal(true) }} className="btn-primary whitespace-nowrap">
            <Plus className="w-4 h-4" /> Nouveau groupe
          </button>
        </div>
      </div>

      {/* Grille de groupes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(group => (
          <div key={group.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl">
                  {typeEmojis[group.type]}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{group.name}</h4>
                  <span className={`badge ${typeColors[group.type]}`}>{group.type}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditGroup(group); setShowModal(true) }}
                  className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => { if (confirm('Supprimer ce groupe ?')) deleteGroup(group.id) }}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {group.description && (
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{group.description}</p>
            )}

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              {group.leader && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Responsable : <span className="font-medium">{getMemberFullName(group.leader)}</span></span>
                </div>
              )}
              {group.meetingDay && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>{group.meetingDay} {group.meetingTime && `à ${group.meetingTime}`}</span>
                </div>
              )}
              {group.meetingLocation && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  <span className="truncate">{group.meetingLocation}</span>
                </div>
              )}
            </div>

            {/* Membres */}
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-medium">Membres ({group.members.length})</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {group.members.slice(0, 6).map(mid => {
                  const m = members.find(mb => mb.id === mid)
                  return m ? (
                    <div key={mid} title={`${m.firstName} ${m.lastName}`}
                      className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700 border-2 border-white">
                      {m.firstName[0]}{m.lastName[0]}
                    </div>
                  ) : null
                })}
                {group.members.length > 6 && (
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-600">
                    +{group.members.length - 6}
                  </div>
                )}
                {group.members.length === 0 && (
                  <span className="text-xs text-gray-400 italic">Aucun membre</span>
                )}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className={`badge ${group.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {group.active ? '✅ Actif' : '⏸️ Inactif'}
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full card text-center py-16">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <p className="text-gray-400">Aucun groupe trouvé</p>
          </div>
        )}
      </div>

      {showModal && (
        <GroupModal group={editGroup} onClose={() => { setShowModal(false); setEditGroup(null) }} onSave={handleSave} />
      )}
    </div>
  )
}
