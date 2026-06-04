import { useState } from 'react'
import { useApp } from '../context/AppContext'
import type { Member } from '../types'
import { Plus, Search, Filter, Edit2, Trash2, Mail, Phone, X, Users, UserCheck, UserX, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const roleColors: Record<string, string> = {
  pasteur: 'bg-purple-100 text-purple-700',
  ancien: 'bg-indigo-100 text-indigo-700',
  diacre: 'bg-blue-100 text-blue-700',
  responsable: 'bg-amber-100 text-amber-700',
  membre: 'bg-gray-100 text-gray-700',
}
const statusColors: Record<string, string> = {
  actif: 'bg-green-100 text-green-700',
  inactif: 'bg-red-100 text-red-700',
  visiteur: 'bg-amber-100 text-amber-700',
}

const defaultMember: Omit<Member, 'id'> = {
  firstName: '', lastName: '', email: '', phone: '', address: '',
  birthDate: '', joinDate: new Date().toISOString().split('T')[0],
  status: 'actif', role: 'membre', groups: [], notes: '',
}

function MemberModal({ member, onClose, onSave }: {
  member: Member | null
  onClose: () => void
  onSave: (m: Member) => void
}) {
  const [form, setForm] = useState<Omit<Member, 'id'>>(member ? { ...member } : { ...defaultMember })
  const isEdit = !!member

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...form, id: member?.id || crypto.randomUUID() })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">
            {isEdit ? 'Modifier le membre' : 'Ajouter un membre'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input required className="input-field" value={form.firstName}
                onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input required className="input-field" value={form.lastName}
                onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="input-field" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input className="input-field" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input className="input-field" value={form.address}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
              <input type="date" className="input-field" value={form.birthDate}
                onChange={e => setForm(p => ({ ...p, birthDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'adhésion</label>
              <input type="date" className="input-field" value={form.joinDate}
                onChange={e => setForm(p => ({ ...p, joinDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select className="input-field" value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as Member['status'] }))}>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="visiteur">Visiteur</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
              <select className="input-field" value={form.role}
                onChange={e => setForm(p => ({ ...p, role: e.target.value as Member['role'] }))}>
                <option value="membre">Membre</option>
                <option value="diacre">Diacre</option>
                <option value="pasteur">Pasteur</option>
                <option value="ancien">Ancien</option>
                <option value="responsable">Responsable</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea rows={3} className="input-field resize-none" value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Annuler</button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              {isEdit ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MemberDetailModal({ member, onClose, onEdit }: { member: Member, onClose: () => void, onEdit: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">Détails du membre</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-indigo-700">
                {member.firstName[0]}{member.lastName[0]}
              </span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800">{member.firstName} {member.lastName}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge ${roleColors[member.role]}`}>{member.role}</span>
                <span className={`badge ${statusColors[member.status]}`}>{member.status}</span>
              </div>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            {member.email && <div className="flex items-center gap-3 text-gray-600"><Mail className="w-4 h-4" />{member.email}</div>}
            {member.phone && <div className="flex items-center gap-3 text-gray-600"><Phone className="w-4 h-4" />{member.phone}</div>}
            {member.address && <p className="text-gray-600 pl-7">{member.address}</p>}
            {member.birthDate && (
              <p className="text-gray-600">📅 Né(e) le {format(new Date(member.birthDate), 'd MMMM yyyy', { locale: fr })}</p>
            )}
            <p className="text-gray-600">
              🕊️ Membre depuis {format(new Date(member.joinDate), 'd MMMM yyyy', { locale: fr })}
            </p>
            {member.notes && (
              <div className="bg-gray-50 rounded-xl p-3 mt-2">
                <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                <p className="text-gray-700">{member.notes}</p>
              </div>
            )}
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

export default function Membres() {
  const { members, addMember, updateMember, deleteMember } = useApp()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editMember, setEditMember] = useState<Member | null>(null)
  const [viewMember, setViewMember] = useState<Member | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  const filtered = members.filter(m => {
    const matchSearch = `${m.firstName} ${m.lastName} ${m.email}`.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || m.status === filterStatus
    const matchRole = filterRole === 'all' || m.role === filterRole
    return matchSearch && matchStatus && matchRole
  })

  const handleSave = (m: Member) => {
    if (editMember) updateMember(m)
    else addMember(m)
    setShowModal(false)
    setEditMember(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Supprimer ce membre ?')) deleteMember(id)
  }

  return (
    <div className="space-y-6">
      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: members.length, icon: Users, color: 'bg-indigo-500' },
          { label: 'Actifs', value: members.filter(m => m.status === 'actif').length, icon: UserCheck, color: 'bg-green-500' },
          { label: 'Inactifs', value: members.filter(m => m.status === 'inactif').length, icon: UserX, color: 'bg-red-500' },
          { label: 'Visiteurs', value: members.filter(m => m.status === 'visiteur').length, icon: Eye, color: 'bg-amber-500' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres & Actions */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" placeholder="Rechercher..."
                className="input-field pl-10"
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="input-field max-w-[160px]" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">Tous statuts</option>
              <option value="actif">Actifs</option>
              <option value="inactif">Inactifs</option>
              <option value="visiteur">Visiteurs</option>
            </select>
            <select className="input-field max-w-[160px]" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option value="all">Tous rôles</option>
              <option value="pasteur">Pasteur</option>
              <option value="ancien">Ancien</option>
              <option value="diacre">Diacre</option>
              <option value="responsable">Responsable</option>
              <option value="membre">Membre</option>
            </select>
          </div>
          <button onClick={() => { setEditMember(null); setShowModal(true) }} className="btn-primary whitespace-nowrap">
            <Plus className="w-4 h-4" /> Nouveau membre
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">{filtered.length} membre(s) trouvé(s)</p>
      </div>

      {/* Tableau */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Membre</th>
                <th className="table-header hidden sm:table-cell">Contact</th>
                <th className="table-header">Rôle</th>
                <th className="table-header">Statut</th>
                <th className="table-header hidden lg:table-cell">Adhésion</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {filtered.map(member => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-indigo-700">
                          {member.firstName[0]}{member.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-gray-500 sm:hidden">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell hidden sm:table-cell">
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <p className="text-xs text-gray-400">{member.phone}</p>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${roleColors[member.role]}`}>{member.role}</span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${statusColors[member.status]}`}>{member.status}</span>
                  </td>
                  <td className="table-cell hidden lg:table-cell text-gray-500">
                    {format(new Date(member.joinDate), 'd MMM yyyy', { locale: fr })}
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewMember(member)}
                        className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setEditMember(member); setShowModal(true) }}
                        className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(member.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Aucun membre trouvé</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <MemberModal
          member={editMember}
          onClose={() => { setShowModal(false); setEditMember(null) }}
          onSave={handleSave}
        />
      )}
      {viewMember && (
        <MemberDetailModal
          member={viewMember}
          onClose={() => setViewMember(null)}
          onEdit={() => { setEditMember(viewMember); setViewMember(null); setShowModal(true) }}
        />
      )}
    </div>
  )
}
