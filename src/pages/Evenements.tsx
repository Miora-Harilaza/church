import { useState, useMemo, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import type { ChurchEvent } from '../types'
import { 
  Plus, Calendar, MapPin, Clock, Users, X, Edit2, Trash2, 
  CheckCircle, XCircle, PlayCircle, Search, Filter, Download, 
  ChevronLeft, ChevronRight, Tag, PlusCircle, UserCog, Check, 
  Building2, Sparkles, Info, AlertCircle, Globe, Award, Heart, Star 
} from 'lucide-react'
import { format, isPast, isToday, getYear, isThisWeek, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import supabase from '../lib/supabaseclient'

// Types par défaut avec leurs emojis
const defaultTypes = [
  { id: 'culte', name: 'Culte', emoji: '🙏', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'reunion', name: 'Réunion', emoji: '🤝', color: 'bg-blue-100 text-blue-700' },
  { id: 'conference', name: 'Conférence', emoji: '🎤', color: 'bg-purple-100 text-purple-700' },
  { id: 'formation', name: 'Formation', emoji: '📚', color: 'bg-amber-100 text-amber-700' },
  { id: 'social', name: 'Social', emoji: '🎉', color: 'bg-green-100 text-green-700' },
  { id: 'autre', name: 'Autre', emoji: '📌', color: 'bg-gray-100 text-gray-700' },
]

const typeLabels: Record<string, string> = {
  culte: 'Culte', reunion: 'Réunion', conference: 'Conférence',
  formation: 'Formation', social: 'Social', autre: 'Autre',
}

const typeEmojis: Record<string, string> = {
  culte: '🙏', reunion: '🤝', conference: '🎤',
  formation: '📚', social: '🎉', autre: '📌',
}

const typeColors: Record<string, string> = {
  culte: 'bg-indigo-100 text-indigo-700',
  reunion: 'bg-blue-100 text-blue-700',
  conference: 'bg-purple-100 text-purple-700',
  formation: 'bg-amber-100 text-amber-700',
  social: 'bg-green-100 text-green-700',
  autre: 'bg-gray-100 text-gray-700',
}

const statusColors: Record<string, string> = {
  planifie: 'bg-blue-100 text-blue-700',
  en_cours: 'bg-amber-100 text-amber-700',
  termine: 'bg-green-100 text-green-700',
  annule: 'bg-red-100 text-red-700',
}

const statusIcons: Record<string, React.ElementType> = {
  planifie: Clock,
  en_cours: PlayCircle,
  termine: CheckCircle,
  annule: XCircle,
}

const statusLabels: Record<string, string> = {
  planifie: 'Planifié',
  en_cours: 'En cours',
  termine: 'Terminé',
  annule: 'Annulé',
}

const defaultEvent: Omit<ChurchEvent, 'id'> = {
  title: '', description: '', date: new Date().toISOString().split('T')[0],
  time: '10:00', location: '', type: 'culte', status: 'planifie',
  organizer: '', attendees: [], recurring: false,
  organizers: [],
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
    '🙏', '🤝', '🎤', '📚', '🎉', '📌', '⭐', '❤️', 
    '💙', '💚', '💛', '🧡', '💜', '🔥', '✨', '🌟', 
    '💫', '⚡', '💎', '🔔', '🎈', '🎊', '🥇', '🥈', '🥉'
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">Nouveau type d'événement</h3>
          <p className="text-indigo-200 text-sm mt-1">Personnalisez vos catégories</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom du type</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Ex: Baptême, Mariage, Veillée..."
              value={newTypeName}
              onChange={e => setNewTypeName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Choisir un emoji</label>
            <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto p-2 border border-gray-100 rounded-xl bg-gray-50">
              {emojis.map((emoji, idx) => (
                <button
                  key={`${emoji}-${idx}`}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-10 h-10 text-2xl rounded-xl transition-all flex items-center justify-center ${
                    selectedEmoji === emoji ? 'bg-indigo-100 ring-2 ring-indigo-500 scale-110' : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
            <span className="text-sm text-gray-600">Aperçu:</span>
            <span className="text-3xl">{selectedEmoji}</span>
            <span className="text-base font-semibold text-gray-800">{newTypeName || 'Nouveau type'}</span>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium">
              Annuler
            </button>
            <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-md">
              Ajouter le type
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Composant pour sélectionner plusieurs groupes organisateurs
function OrganizersSelect({ selectedIds, onChange }: {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('sampana')
          .select('*')
          .order('nom', { ascending: true })

        if (error) throw error
        setGroups(data || [])
      } catch (error) {
        console.error('Erreur lors du chargement des groupes:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchGroups()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groups
    return groups.filter(g => 
      g.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.type?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [groups, searchTerm])

  const toggleOrganizer = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  const selectedGroups = groups.filter(g => selectedIds.includes(g.id))

  const getGroupIcon = (type: string) => {
    const icons: Record<string, string> = {
      cellule: '🏠', chorale: '🎵', jeunesse: '🌟',
      femmes: '👩', hommes: '👨', enfants: '👶', service: '🛠️',
    }
    return icons[type] || '📌'
  }

  return (
    <div className="space-y-3" ref={dropdownRef}>
      {selectedGroups.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedGroups.map(group => (
            <div key={group.id} className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-2 rounded-xl border border-indigo-100">
              <span className="text-xl">{getGroupIcon(group.type)}</span>
              <span className="text-sm font-medium text-gray-800">{group.nom}</span>
              <button
                type="button"
                onClick={() => toggleOrganizer(group.id)}
                className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white cursor-pointer"
            placeholder={selectedGroups.length > 0 ? "Ajouter un autre groupe..." : "Rechercher un groupe organisateur..."}
            value={searchTerm}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setIsOpen(true)
            }}
          />
        </div>
        
        {isOpen && (
          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-64 overflow-y-auto">
            <div className="sticky top-0 p-3 border-b border-gray-100 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Filtrer les groupes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="py-2">
              {loading ? (
                <div className="px-4 py-8 text-sm text-gray-500 text-center flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
                  Chargement...
                </div>
              ) : filteredGroups.length > 0 ? (
                filteredGroups.map(group => {
                  const isSelected = selectedIds.includes(group.id)
                  return (
                    <button
                      key={group.id}
                      type="button"
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                        isSelected ? 'bg-indigo-50' : ''
                      }`}
                      onClick={() => toggleOrganizer(group.id)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-xl shadow-md">
                        {getGroupIcon(group.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{group.nom}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="px-1.5 py-0.5 bg-gray-100 rounded">{group.type || 'Non défini'}</span>
                          {group.jour_reunion && <span>📅 {group.jour_reunion}</span>}
                        </div>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-indigo-600" />}
                    </button>
                  )
                })
              ) : (
                <div className="px-4 py-8 text-sm text-gray-500 text-center">
                  Aucun groupe trouvé
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EventModal({ event, onClose, onSave, saving, customTypes, onAddType }: {
  event: ChurchEvent | null
  onClose: () => void
  onSave: (e: ChurchEvent) => Promise<void>
  saving: boolean
  customTypes: { id: string; name: string; emoji: string }[]
  onAddType: (type: { id: string; name: string; emoji: string }) => void
}) {
  const [form, setForm] = useState<Omit<ChurchEvent, 'id'>>(event ? { 
    ...event, 
    organizers: event.organizers || []
  } : { ...defaultEvent, organizers: [] })
  const [error, setError] = useState('')
  const [showAddTypeModal, setShowAddTypeModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const modalRef = useRef<HTMLDivElement>(null)

  // Tous les types (par défaut + personnalisés)
  const allTypes = [...defaultTypes, ...customTypes]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await onSave({ 
        ...form, 
        id: event?.id || crypto.randomUUID(),
      })
    } catch (err: any) {
      setError(err.message)
    }
  }

  const getTypeLabel = (typeId: string) => {
    const found = allTypes.find(t => t.id === typeId)
    return found?.name || typeId
  }

  const getTypeEmoji = (typeId: string) => {
    const found = allTypes.find(t => t.id === typeId)
    return found?.emoji || '📌'
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
        <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          {/* Header avec progression */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  {event ? <Edit2 className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {event ? 'Modifier l\'événement' : 'Créer un événement'}
                  </h3>
                  <p className="text-indigo-200 text-sm mt-0.5">
                    {event ? 'Modifiez les informations' : 'Remplissez les détails ci-dessous'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {/* Barre de progression */}
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${currentStep >= 1 ? 'bg-white' : 'bg-white/30'}`} />
                <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${currentStep >= 2 ? 'bg-white' : 'bg-white/30'}`} />
                <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${currentStep >= 3 ? 'bg-white' : 'bg-white/30'}`} />
              </div>
              <div className="flex justify-between mt-2 text-xs text-indigo-200">
                <span>Informations</span>
                <span>Détails</span>
                <span>Organisateurs</span>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Section 1: Informations de base */}
            <div className="space-y-4" onFocus={() => setCurrentStep(1)}>
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Info className="w-4 h-4 text-indigo-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Informations générales</h4>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre de l'événement *</label>
                <input
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Ex: Culte de louange, Conférence annuelle..."
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                  placeholder="Description détaillée de l'événement..."
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>
            </div>

            {/* Section 2: Date et lieu */}
            <div className="space-y-4" onFocus={() => setCurrentStep(2)}>
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Date et lieu</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    required
                    type="date"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={form.date}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Heure *</label>
                  <input
                    required
                    type="time"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={form.time}
                    onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lieu</label>
                  <input
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Adresse ou nom du lieu"
                    value={form.location}
                    onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacité maximale</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nombre de places"
                    value={form.maxAttendees || ''}
                    onChange={e => setForm(p => ({ ...p, maxAttendees: e.target.value ? Number(e.target.value) : undefined }))}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Catégorisation */}
            <div className="space-y-4" onFocus={() => setCurrentStep(3)}>
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Tag className="w-4 h-4 text-indigo-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Catégorisation</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      value={form.type}
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
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                      title="Ajouter un nouveau type"
                    >
                      <PlusCircle className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value as ChurchEvent['status'] }))}>
                    <option value="planifie">📅 Planifié</option>
                    <option value="en_cours">▶️ En cours</option>
                    <option value="termine">✅ Terminé</option>
                    <option value="annule">❌ Annulé</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Groupes organisateurs
                  </label>
                  <OrganizersSelect
                    selectedIds={form.organizers || []}
                    onChange={(ids) => setForm(p => ({ ...p, organizers: ids }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-100">
              <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                Annuler
              </button>
              <button type="submit" disabled={saving} className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-md disabled:opacity-50">
                {saving ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enregistrement...
                  </div>
                ) : (event ? 'Modifier' : 'Créer l\'événement')}
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

function EventDetailModal({ event, onClose, onEdit, customTypes }: { 
  event: ChurchEvent, 
  onClose: () => void, 
  onEdit: () => void,
  customTypes: { id: string; name: string; emoji: string }[]
}) {
  const { getMemberFullName } = useApp()
  const StatusIcon = statusIcons[event.status]
  const eventDate = new Date(event.date)
  const [organizers, setOrganizers] = useState<any[]>([])
  
  const getTypeDetails = (typeId: string) => {
    const found = [...defaultTypes, ...customTypes].find(t => t.id === typeId)
    return found || { name: typeId, emoji: '📌' }
  }

  const typeDetails = getTypeDetails(event.type)

  useEffect(() => {
    const fetchOrganizers = async () => {
      if (event.organizers && event.organizers.length > 0) {
        const { data } = await supabase
          .from('sampana')
          .select('*')
          .in('id', event.organizers)
        if (data) setOrganizers(data)
      }
    }
    fetchOrganizers()
  }, [event.organizers])

  const getGroupIcon = (type: string) => {
    const icons: Record<string, string> = {
      cellule: '🏠', chorale: '🎵', jeunesse: '🌟',
      femmes: '👩', hommes: '👨', enfants: '👶', service: '🛠️',
    }
    return icons[type] || '📌'
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm">
                {typeDetails.emoji}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Détails de l'événement</h3>
                <p className="text-indigo-200 text-xs">{typeDetails.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className={`badge ${typeColors[event.type] || 'bg-gray-100 text-gray-700'}`}>
              {typeDetails.emoji} {typeDetails.name}
            </span>
            <span className={`badge ${statusColors[event.status]}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusLabels[event.status]}
            </span>
          </div>

          <div>
            <h4 className="text-xl font-bold text-gray-900">{event.title}</h4>
            {event.description && (
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{event.description}</p>
            )}
          </div>

          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium text-gray-900">{format(eventDate, 'EEEE d MMMM yyyy', { locale: fr })}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Clock className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-xs text-gray-500">Heure</p>
                <p className="font-medium text-gray-900">{event.time}</p>
              </div>
            </div>
            
            {event.location && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="text-xs text-gray-500">Lieu</p>
                  <p className="font-medium text-gray-900">{event.location}</p>
                </div>
              </div>
            )}
            
            {/* AFFICHAGE DES ORGANISATEURS DANS LE MODAL */}
            {organizers.length > 0 && (
              <div className="p-4 bg-indigo-50 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-indigo-800">Groupes organisateurs</span>
                  <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full">{organizers.length}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {organizers.map(org => (
                    <div key={org.id} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-indigo-100">
                      <span className="text-xl">{getGroupIcon(org.type)}</span>
                      <div>
                        <p className="font-medium text-gray-800">{org.nom}</p>
                        <p className="text-xs text-gray-500">{org.type || 'Groupe'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {event.maxAttendees && (
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>👥 Participants</span>
                  <span className="font-semibold text-indigo-600">{event.attendees.length}/{event.maxAttendees}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${(event.attendees.length / event.maxAttendees) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-white transition-colors font-medium">
            Fermer
          </button>
          <button onClick={onEdit} className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center gap-2 shadow-md">
            <Edit2 className="w-4 h-4" /> Modifier
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Evenements() {
  const { events, addEvent, updateEvent, deleteEvent, loading } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [editEvent, setEditEvent] = useState<ChurchEvent | null>(null)
  const [viewEvent, setViewEvent] = useState<ChurchEvent | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [groups, setGroups] = useState<any[]>([])
  
  const [customTypes, setCustomTypes] = useState<{ id: string; name: string; emoji: string }[]>(() => {
    const saved = localStorage.getItem('customEventTypes')
    return saved ? JSON.parse(saved) : []
  })

  const saveCustomTypes = (types: { id: string; name: string; emoji: string }[]) => {
    setCustomTypes(types)
    localStorage.setItem('customEventTypes', JSON.stringify(types))
  }

  const handleAddType = (newType: { id: string; name: string; emoji: string }) => {
    if (!customTypes.some(t => t.id === newType.id)) {
      saveCustomTypes([...customTypes, newType])
    }
  }

  // Charger les groupes pour l'affichage dans les cartes
  useEffect(() => {
    const fetchGroups = async () => {
      const { data } = await supabase.from('sampana').select('*')
      if (data) setGroups(data)
    }
    fetchGroups()
  }, [])

  const allTypes = [...defaultTypes, ...customTypes]

  const availableYears = useMemo(() => {
    const years = events.map(e => getYear(new Date(e.date)))
    return [...new Set(years)].sort((a, b) => b - a)
  }, [events])

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchSearch = searchQuery === '' || 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchType = filterType === 'all' || e.type === filterType
      const matchStatus = filterStatus === 'all' || e.status === filterStatus
      const matchYear = getYear(new Date(e.date)) === selectedYear
      return matchSearch && matchType && matchStatus && matchYear
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [events, searchQuery, filterType, filterStatus, selectedYear])

  const upcoming = filteredEvents.filter(e => new Date(e.date) >= new Date())
  const past = filteredEvents.filter(e => new Date(e.date) < new Date())

  const stats = {
    total: events.length,
    upcoming: events.filter(e => new Date(e.date) >= new Date()).length,
    today: events.filter(e => isToday(new Date(e.date))).length,
    thisWeek: events.filter(e => isThisWeek(new Date(e.date)) && !isPast(new Date(e.date))).length,
  }

  const handleSave = async (e: ChurchEvent) => {
    setSaving(true)
    try {
      if (editEvent) {
        await updateEvent(e)
      } else {
        await addEvent(e)
      }
      setShowModal(false)
      setEditEvent(null)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cet événement ?')) {
      setDeletingId(id)
      try {
        await deleteEvent(id)
      } catch (err: any) {
        alert(err.message)
      } finally {
        setDeletingId(null)
      }
    }
  }

  const exportCSV = () => {
    const data = filteredEvents.map(e => ({
      Titre: e.title,
      Date: e.date,
      Heure: e.time,
      Lieu: e.location,
      Type: typeLabels[e.type] || e.type,
      Statut: statusLabels[e.status],
    }))
    const csv = [Object.keys(data[0]).join(','), ...data.map(row => Object.values(row).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `evenements_${selectedYear}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getTypeLabel = (typeId: string) => {
    const found = allTypes.find(t => t.id === typeId)
    return found?.name || typeId
  }

  const getTypeEmoji = (typeId: string) => {
    const found = allTypes.find(t => t.id === typeId)
    return found?.emoji || '📌'
  }

  const getTypeColor = (typeId: string) => {
    const found = allTypes.find(t => t.id === typeId)
    return found?.color || 'bg-gray-100 text-gray-700'
  }

  const EventCard = ({ event }: { event: ChurchEvent }) => {
    const StatusIcon = statusIcons[event.status]
    const eventDate = new Date(event.date)
    const isPastEvent = isPast(eventDate)
    const isTodayEvent = isToday(eventDate)
    const daysLeft = differenceInDays(eventDate, new Date())
    
    // Récupérer les groupes organisateurs
    const eventOrganizers = groups.filter(g => event.organizers?.includes(g.id))
    const typeEmoji = getTypeEmoji(event.type)
    
    const getGroupIcon = (type: string) => {
      const icons: Record<string, string> = {
        cellule: '🏠', chorale: '🎵', jeunesse: '🌟',
        femmes: '👩', hommes: '👨', enfants: '👶', service: '🛠️',
      }
      return icons[type] || '📌'
    }

    return (
      <div
        className="card hover:shadow-lg transition-all cursor-pointer p-5 hover:scale-[1.02] duration-300"
        onClick={() => setViewEvent(event)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-center min-w-[55px]">
              <div className="text-2xl font-bold text-gray-800">{format(eventDate, 'dd')}</div>
              <div className="text-xs text-gray-500 uppercase">{format(eventDate, 'MMM', { locale: fr })}</div>
              <div className="text-[10px] text-gray-400">{format(eventDate, 'yyyy')}</div>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{typeEmoji}</span>
                <h4 className="font-semibold text-gray-900">{event.title}</h4>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <Clock className="w-3 h-3" />
                <span>{event.time}</span>
                {event.location && (
                  <>
                    <MapPin className="w-3 h-3 ml-1" />
                    <span className="truncate max-w-[150px]">{event.location}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { setEditEvent(event); setShowModal(true); }}
              className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(event.id)}
              disabled={deletingId === event.id}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              {deletingId === event.id ? <div className="w-4 h-4 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* AFFICHAGE DES ORGANISATEURS - GROUPES DANS LA CARTE */}
        {eventOrganizers.length > 0 && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-indigo-50 rounded-lg">
            <Building2 className="w-4 h-4 text-indigo-500" />
            <div className="flex flex-wrap gap-2">
              {eventOrganizers.map(org => (
                <div key={org.id} className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg shadow-sm">
                  <span className="text-sm">{getGroupIcon(org.type)}</span>
                  <span className="text-xs font-medium text-gray-700">{org.nom}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className={`badge ${getTypeColor(event.type)}`}>
              {getTypeEmoji(event.type)} {getTypeLabel(event.type)}
            </span>
            <span className={`badge ${statusColors[event.status]}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusLabels[event.status]}
            </span>
          </div>
          {isTodayEvent && !isPastEvent && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Aujourd'hui
            </span>
          )}
          {!isPastEvent && !isTodayEvent && daysLeft <= 7 && (
            <span className="text-xs text-indigo-600 font-medium">Dans {daysLeft}j</span>
          )}
        </div>

        {event.maxAttendees && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Places disponibles</span>
              <span className="font-medium text-indigo-600">{event.maxAttendees - event.attendees.length} restantes</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(100, (event.attendees.length / event.maxAttendees) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Événements</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez tous les événements de votre église</p>
        </div>
        <button
          onClick={() => { setEditEvent(null); setShowModal(true); }}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" /> Nouvel événement
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-emerald-600">{stats.upcoming}</p>
          <p className="text-sm text-gray-500">À venir</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-blue-600">{stats.thisWeek}</p>
          <p className="text-sm text-gray-500">Cette semaine</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-purple-600">{stats.today}</p>
          <p className="text-sm text-gray-500">Aujourd'hui</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un événement..."
              className="input-field pl-9"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="input-field sm:w-44"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="all">📌 Tous types</option>
            {allTypes.map(type => (
              <option key={type.id} value={type.id}>{type.emoji} {type.name}</option>
            ))}
          </select>
          <select
            className="input-field sm:w-40"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">📊 Tous statuts</option>
            <option value="planifie">📅 Planifié</option>
            <option value="en_cours">▶️ En cours</option>
            <option value="termine">✅ Terminé</option>
            <option value="annule">❌ Annulé</option>
          </select>
          <select
            className="input-field sm:w-32"
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>📅 {year}</option>
            ))}
          </select>
          <button onClick={exportCSV} className="btn-secondary px-4" title="Exporter">
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setSearchQuery(''); setFilterType('all'); setFilterStatus('all'); }}
            className="btn-secondary px-4"
          >
            Réinitialiser
          </button>
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

      {/* Événements à venir */}
      {upcoming.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
            <h2 className="text-lg font-semibold text-gray-900">À venir</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{upcoming.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {upcoming.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        </div>
      )}

      {/* Événements passés */}
      {past.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-gray-400 to-gray-500 rounded-full" />
            <h2 className="text-lg font-semibold text-gray-600">Passés</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{past.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {past.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        </div>
      )}

      {/* Aucun résultat */}
      {filteredEvents.length === 0 && (
        <div className="card text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Aucun événement trouvé</p>
          <p className="text-sm text-gray-400 mt-1">Pour l'année {selectedYear}</p>
          <button
            onClick={() => { setEditEvent(null); setShowModal(true); }}
            className="mt-4 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Créer un événement
          </button>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <EventModal
          event={editEvent}
          onClose={() => { setShowModal(false); setEditEvent(null); }}
          onSave={handleSave}
          saving={saving}
          customTypes={customTypes}
          onAddType={handleAddType}
        />
      )}

      {viewEvent && (
        <EventDetailModal
          event={viewEvent}
          onClose={() => setViewEvent(null)}
          onEdit={() => { setEditEvent(viewEvent); setViewEvent(null); setShowModal(true); }}
          customTypes={customTypes}
        />
      )}
    </div>
  )
}