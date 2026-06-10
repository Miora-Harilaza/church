import { useState, useEffect, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import type { Group } from '../types'
import { Plus, Users, MapPin, Clock, X, Edit2, Trash2, Calendar, UserPlus, Loader2, Search, PlusCircle, Tag, ChevronDown, Check, UserCog } from 'lucide-react'
import supabase from '../lib/supabaseclient'

// Types par défaut avec leurs emojis
const defaultTypes = [
  { id: 'cellule', name: 'Cellule', emoji: '🏠' },
  { id: 'chorale', name: 'Chorale', emoji: '🎵' },
  { id: 'jeunesse', name: 'Jeunesse', emoji: '🌟' },
  { id: 'femmes', name: 'Femmes', emoji: '👩' },
  { id: 'hommes', name: 'Hommes', emoji: '👨' },
  { id: 'enfants', name: 'Enfants', emoji: '👶' },
  { id: 'service', name: 'Service', emoji: '🛠️' },
  { id: 'autre', name: 'Autre', emoji: '📌' },
]

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

const defaultGroup: Omit<Group, 'id'> = {
  name: '', description: '', type: 'cellule', leader: '',
  members: [], meetingDay: '', meetingTime: '', meetingLocation: '', active: true,
}

// Modal pour ajouter un nouveau type
function AddTypeModal({ onClose, onAdd, existingTypes }: { 
  onClose: () => void
  onAdd: (type: { id: string; name: string; emoji: string }) => void
  existingTypes: string[]
}) {
  const [newTypeName, setNewTypeName] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('📌')
  const [error, setError] = useState('')

  const emojis = [
    '📌', '🎯', '💪', '🤝', '🎨', '📖', '🎭', '🎪', '🏆', '⭐', '❤️', '💙', '💚', '💛', '🧡', '💜',
    '🔥', '✨', '🌟', '💫', '⚡', '💎', '🔔', '🎈', '🎉', '🎊', '🎁', '🏅', '🎖️', '🏆', '🥇', '🥈', '🥉'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const typeId = newTypeName.toLowerCase().replace(/\s+/g, '_')
    
    if (existingTypes.includes(typeId)) {
      setError('Ce type existe déjà')
      return
    }
    if (newTypeName.trim() === '') {
      setError('Veuillez entrer un nom de type')
      return
    }
    
    onAdd({ id: typeId, name: newTypeName, emoji: selectedEmoji })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Nouveau type de groupe</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du type</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ex: Évangélisation, Prière, Louange..."
              value={newTypeName}
              onChange={e => setNewTypeName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Choisir un emoji</label>
            <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-10 h-10 text-2xl rounded-lg transition-all flex items-center justify-center ${
                    selectedEmoji === emoji ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-500">Aperçu:</span>
            <span className="text-2xl">{selectedEmoji}</span>
            <span className="text-base font-medium text-gray-700">{newTypeName || 'Nouveau type'}</span>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Annuler
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Composant de recherche pour le responsable avec affichage
function ResponsableSearch({ members, value, onChange }: { 
  members: any[]
  value: string
  onChange: (id: string) => void
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members
    return members.filter(m => 
      `${m.prenom} ${m.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [members, searchTerm])

  const selectedMember = members.find(m => m.id === value)

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          className="input-field pl-9 pr-10 cursor-pointer"
          placeholder="Rechercher un responsable..."
          value={isOpen ? searchTerm : (selectedMember ? `${selectedMember.prenom} ${selectedMember.nom}` : '')}
          onFocus={() => {
            setIsOpen(true)
            setSearchTerm('')
          }}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setIsOpen(true)
          }}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          <div className="sticky top-0 p-2 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="text"
                className="w-full pl-7 pr-2 py-1 text-sm border border-gray-200 rounded"
                placeholder="Filtrer les membres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="py-1">
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 flex items-center gap-2"
              onClick={() => {
                onChange('')
                setIsOpen(false)
                setSearchTerm('')
              }}
            >
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X className="w-3 h-3 text-gray-400" />
              </div>
              <span>Aucun responsable</span>
            </button>
            {filteredMembers.map(member => (
              <button
                key={member.id}
                type="button"
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 ${
                  value === member.id ? 'bg-indigo-50' : ''
                }`}
                onClick={() => {
                  onChange(member.id)
                  setIsOpen(false)
                  setSearchTerm('')
                }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {member.prenom?.[0]}{member.nom?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{member.prenom} {member.nom}</p>
                  {member.email && <p className="text-xs text-gray-500">{member.email}</p>}
                  {member.telephone && <p className="text-xs text-gray-400">{member.telephone}</p>}
                </div>
                {value === member.id && (
                  <Check className="w-4 h-4 text-indigo-600" />
                )}
              </button>
            ))}
            {filteredMembers.length === 0 && (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                Aucun membre trouvé
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Affichage du responsable sélectionné */}
      {selectedMember && !isOpen && (
        <div className="mt-2 p-2 bg-indigo-50 rounded-lg flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center text-sm font-bold text-indigo-700">
            {selectedMember.prenom?.[0]}{selectedMember.nom?.[0]}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{selectedMember.prenom} {selectedMember.nom}</p>
            <p className="text-xs text-indigo-600">Responsable sélectionné</p>
          </div>
        </div>
      )}
    </div>
  )
}

function GroupModal({ group, onClose, onSave, saving, customTypes, onAddType }: {
  group: Group | null
  onClose: () => void
  onSave: (g: Group) => Promise<void>
  saving: boolean
  customTypes: { id: string; name: string; emoji: string }[]
  onAddType: (type: { id: string; name: string; emoji: string }) => void
}) {
  const { members } = useApp()
  const [form, setForm] = useState<Omit<Group, 'id'>>(group ? { ...group } : { ...defaultGroup })
  const [error, setError] = useState('')
  const [showAddTypeModal, setShowAddTypeModal] = useState(false)
  const [memberSearchTerm, setMemberSearchTerm] = useState('')

  // Tous les types (par défaut + personnalisés)
  const allTypes = [...defaultTypes, ...customTypes]

  const toggleMember = (id: string) => {
    setForm(p => ({
      ...p,
      members: p.members.includes(id) ? p.members.filter(m => m !== id) : [...p.members, id]
    }))
  }

  // Filtrer les membres pour la liste
  const filteredMembers = useMemo(() => {
    if (!memberSearchTerm) return members
    return members.filter((m: any) => 
      `${m.prenom} ${m.nom}`.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(memberSearchTerm.toLowerCase())
    )
  }, [members, memberSearchTerm])

  // Membres sélectionnés avec leurs infos
  const selectedMembersList = members.filter((m: any) => form.members.includes(m.id))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await onSave({ ...form, id: group?.id || crypto.randomUUID() })
    } catch (err: any) {
      setError(err.message)
    }
  }

  const getTypeEmoji = (typeId: string) => {
    const found = allTypes.find(t => t.id === typeId)
    return found?.emoji || '📌'
  }

  const getTypeName = (typeId: string) => {
    const found = allTypes.find(t => t.id === typeId)
    return found?.name || typeId
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-xl font-bold text-gray-800">{group ? 'Modifier le groupe' : 'Nouveau groupe'}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

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
                <div className="flex gap-2">
                  <select className="input-field flex-1" value={form.type}
                    onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                    {allTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.emoji} {type.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddTypeModal(true)}
                    className="btn-secondary px-3"
                    title="Ajouter un nouveau type"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                <ResponsableSearch
                  members={members}
                  value={form.leader}
                  onChange={(id) => setForm(p => ({ ...p, leader: id }))}
                />
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

            {/* Membres sélectionnés - Affichage en badges */}
            {selectedMembersList.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Membres sélectionnés ({selectedMembersList.length})
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                  {selectedMembersList.map((member: any) => (
                    <div key={member.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700">
                        {member.prenom?.[0]}{member.nom?.[0]}
                      </div>
                      <span className="text-sm text-gray-700">{member.prenom} {member.nom}</span>
                      <button
                        type="button"
                        onClick={() => toggleMember(member.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Liste des membres avec recherche */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ajouter des membres ({form.members.length} sélectionné(s))
              </label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="input-field pl-9"
                  placeholder="Rechercher un membre par nom ou email..."
                  value={memberSearchTerm}
                  onChange={e => setMemberSearchTerm(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((m: any) => {
                    const isSelected = form.members.includes(m.id)
                    return (
                      <label key={m.id} className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors ${isSelected ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'}`}>
                        <input type="checkbox" checked={isSelected}
                          onChange={() => toggleMember(m.id)} className="w-4 h-4 text-indigo-600" />
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {m.prenom?.[0] || '?'}{m.nom?.[0] || ''}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{m.prenom} {m.nom}</p>
                          {m.email && <p className="text-xs text-gray-500 truncate">{m.email}</p>}
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                      </label>
                    )
                  })
                ) : (
                  <div className="col-span-2 text-center py-4 text-gray-500 text-sm">
                    Aucun membre trouvé
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Annuler</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (group ? 'Modifier' : 'Créer')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showAddTypeModal && (
        <AddTypeModal
          onClose={() => setShowAddTypeModal(false)}
          onAdd={onAddType}
          existingTypes={allTypes.map(t => t.id)}
        />
      )}
    </>
  )
}

export default function Groupes() {
  const { members, getMemberFullName, refreshGroups } = useApp()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editGroup, setEditGroup] = useState<Group | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // États pour les types personnalisés avec emojis
  const [customTypes, setCustomTypes] = useState<{ id: string; name: string; emoji: string }[]>(() => {
    const saved = localStorage.getItem('customGroupTypes')
    return saved ? JSON.parse(saved) : []
  })

  // Sauvegarder les types personnalisés
  const saveCustomTypes = (types: { id: string; name: string; emoji: string }[]) => {
    setCustomTypes(types)
    localStorage.setItem('customGroupTypes', JSON.stringify(types))
  }

  const handleAddType = (newType: { id: string; name: string; emoji: string }) => {
    if (!customTypes.some(t => t.id === newType.id)) {
      saveCustomTypes([...customTypes, newType])
    }
  }

  // Tous les types pour l'affichage
  const allTypes = [...defaultTypes, ...customTypes]

  const getTypeEmoji = (typeId: string) => {
    const found = allTypes.find(t => t.id === typeId)
    return found?.emoji || '📌'
  }

  const getTypeName = (typeId: string) => {
    const found = allTypes.find(t => t.id === typeId)
    return found?.name || typeId
  }

  const getTypeColor = (typeId: string) => {
    return typeColors[typeId] || typeColors.autre
  }

  // Charger les groupes depuis Supabase avec le responsable
  const fetchGroups = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('sampana')
        .select('*')
        .order('nom', { ascending: true })

      if (error) throw error

      const formattedGroups: Group[] = (data || []).map((sampana: any) => ({
        id: sampana.id,
        name: sampana.nom,
        description: sampana.description || '',
        type: sampana.type || 'autre',
        leader: sampana.responsable || '', // ← Récupération du responsable depuis la base
        members: [],
        meetingDay: sampana.jour_reunion || '',
        meetingTime: sampana.heure_reunion ? sampana.heure_reunion.substring(0, 5) : '',
        meetingLocation: sampana.lieu_reunion || '',
        active: true,
      }))

      setGroups(formattedGroups)
    } catch (error) {
      console.error('Erreur lors du chargement des groupes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const addGroup = async (group: Group) => {
    const { error } = await supabase
      .from('sampana')
      .insert([{
        id: group.id,
        nom: group.name,
        description: group.description,
        type: group.type,
        responsable: group.leader || null, // ← Sauvegarde du responsable
        jour_reunion: group.meetingDay,
        heure_reunion: group.meetingTime,
        lieu_reunion: group.meetingLocation,
      }])

    if (error) throw error
    await fetchGroups()
    if (refreshGroups) await refreshGroups()
  }

  const updateGroup = async (group: Group) => {
    const { error } = await supabase
      .from('sampana')
      .update({
        nom: group.name,
        description: group.description,
        type: group.type,
        responsable: group.leader || null, // ← Mise à jour du responsable
        jour_reunion: group.meetingDay,
        heure_reunion: group.meetingTime,
        lieu_reunion: group.meetingLocation,
      })
      .eq('id', group.id)

    if (error) throw error
    await fetchGroups()
    if (refreshGroups) await refreshGroups()
  }

  const deleteGroup = async (id: string) => {
    const { error } = await supabase
      .from('sampana')
      .delete()
      .eq('id', id)

    if (error) throw error
    await fetchGroups()
    if (refreshGroups) await refreshGroups()
  }

  const filtered = groups.filter(g => filterType === 'all' || g.type === filterType)

  const handleSave = async (g: Group) => {
    setSaving(true)
    try {
      if (editGroup) {
        await updateGroup(g)
      } else {
        await addGroup(g)
      }
      setShowModal(false)
      setEditGroup(null)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce groupe ? Cette action est irréversible.')) {
      setDeletingId(id)
      try {
        await deleteGroup(id)
      } catch (err: any) {
        alert(err.message)
      } finally {
        setDeletingId(null)
      }
    }
  }

  // Statistiques
  const totalMembersInGroups = groups.reduce((s, g) => s + g.members.length, 0)
  const assignedMembers = members.filter((m: any) => groups.some(g => g.members.includes(m.id))).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
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
            <p className="text-2xl font-bold text-gray-800">{totalMembersInGroups}</p>
            <p className="text-sm text-gray-500">Membres en groupes</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{assignedMembers}</p>
            <p className="text-sm text-gray-500">Membres assignés</p>
          </div>
        </div>
      </div>

      {/* Types personnalisés */}
      {customTypes.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Types personnalisés</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {customTypes.map(type => (
              <span key={type.id} className={`badge ${getTypeColor(type.id)}`}>
                {type.emoji} {type.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <select className="input-field max-w-[200px]" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">Tous les types</option>
            {allTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.emoji} {type.name}
              </option>
            ))}
          </select>
          <button onClick={() => { setEditGroup(null); setShowModal(true) }} className="btn-primary whitespace-nowrap">
            <Plus className="w-4 h-4" /> Nouveau groupe
          </button>
        </div>
      </div>

      {/* Grille de groupes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(group => {
          const responsable = members.find((m: any) => m.id === group.leader)
          return (
            <div key={group.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl">
                    {getTypeEmoji(group.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{group.name}</h4>
                    <span className={`badge ${getTypeColor(group.type)}`}>
                      {getTypeEmoji(group.type)} {getTypeName(group.type)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditGroup(group); setShowModal(true) }}
                    className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(group.id)} disabled={deletingId === group.id}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 disabled:opacity-50">
                    {deletingId === group.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {group.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{group.description}</p>
              )}

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {/* Affichage du responsable */}
                {responsable ? (
                  <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg">
                    <UserCog className="w-4 h-4 text-indigo-500" />
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700">
                        {responsable.prenom?.[0]}{responsable.nom?.[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{responsable.prenom} {responsable.nom}</span>
                      <span className="text-xs text-indigo-600 ml-auto">Responsable</span>
                    </div>
                  </div>
                ) : group.leader ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <UserCog className="w-4 h-4 text-gray-400" />
                    <span>Responsable: <span className="font-medium">{getMemberFullName(group.leader)}</span></span>
                  </div>
                ) : null}
                
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
                    const m = members.find((mb: any) => mb.id === mid)
                    return m ? (
                      <div key={mid} title={`${m.prenom} ${m.nom}`}
                        className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700 border-2 border-white">
                        {m.prenom?.[0] || '?'}{m.nom?.[0] || ''}
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
          )
        })}
        {filtered.length === 0 && (
          <div className="col-span-full card text-center py-16">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <p className="text-gray-400">Aucun groupe trouvé</p>
          </div>
        )}
      </div>

      {showModal && (
        <GroupModal
          group={editGroup}
          onClose={() => { setShowModal(false); setEditGroup(null) }}
          onSave={handleSave}
          saving={saving}
          customTypes={customTypes}
          onAddType={handleAddType}
        />
      )}
    </div>
  )
}