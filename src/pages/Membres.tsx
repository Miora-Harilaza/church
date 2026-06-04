import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseclient'
import { Plus, Search, Filter, Edit2, Trash2, Mail, Phone, X, Users, UserCheck, UserX, Eye, Loader2, Printer } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Member {
  id: string
  nom: string
  prenom: string
  telephone: string
  adresse: string
  faritra: string
  sokajy: string
  created_at: string
  updated_at: string
}

const roleColors: Record<string, string> = {
  Pasteur: 'bg-purple-100 text-purple-700',
  Mpandray: 'bg-indigo-100 text-indigo-700',
  Diakona: 'bg-blue-100 text-blue-700',
  "Vita batisa": 'bg-amber-100 text-amber-700',
  membre: 'bg-gray-100 text-gray-700',
  visiteur: 'bg-green-100 text-green-700',
}

// Traduction des rôles en français
const roleLabels: Record<string, string> = {
  Pasteur: 'Pasteur',
  Mpandray: 'Mpandray (Accueil)',
  Diakona: 'Diacre',
  "Vita batisa": 'Vita Batisa (Baptisé)',
  membre: 'Membre',
  visiteur: 'Visiteur',
}

const defaultMember = {
  nom: '',
  prenom: '',
  telephone: '',
  adresse: '',
  faritra: '',
  sokajy: 'Mpandray',
}

function MemberModal({ member, onClose, onSave, saving }: {
  member: Member | null
  onClose: () => void
  onSave: (m: any) => void
  saving: boolean
}) {
  const [form, setForm] = useState({
    nom: member?.nom || '',
    prenom: member?.prenom || '',
    telephone: member?.telephone || '',
    adresse: member?.adresse || '',
    faritra: member?.faritra || '',
    sokajy: member?.sokajy || 'Mpandray',
  })
  const isEdit = !!member

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">
            {isEdit ? 'Modifier le membre' : 'Ajouter un membre'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input required className="input-field" value={form.prenom}
                onChange={e => setForm(p => ({ ...p, prenom: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input required className="input-field" value={form.nom}
                onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input className="input-field" value={form.telephone}
                onChange={e => setForm(p => ({ ...p, telephone: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input className="input-field" value={form.adresse}
                onChange={e => setForm(p => ({ ...p, adresse: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Faritra/Région</label>
              <input className="input-field" value={form.faritra}
                onChange={e => setForm(p => ({ ...p, faritra: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rôle / Catégorie</label>
              <select className="input-field" value={form.sokajy}
                onChange={e => setForm(p => ({ ...p, sokajy: e.target.value }))}>
                <option value="Pasteur">Pasteur</option>
                <option value="Mpandray">Mpandray (Accueil)</option>
                <option value="Diakona">Diakona (Diacre)</option>
                <option value="Vita batisa">Vita batisa (Baptisé)</option>
                <option value="membre">Membre</option>
                <option value="visiteur">Visiteur</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEdit ? 'Modifier' : 'Ajouter')}
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
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-indigo-700">
                {member.prenom?.[0]}{member.nom?.[0]}
              </span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-800">{member.prenom} {member.nom}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge ${roleColors[member.sokajy] || roleColors.membre}`}>
                  {roleLabels[member.sokajy] || member.sokajy}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            {member.telephone && (
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="w-4 h-4" /> {member.telephone}
              </div>
            )}
            {member.adresse && (
              <div className="flex items-center gap-3 text-gray-600">
                📍 {member.adresse}
              </div>
            )}
            {member.faritra && (
              <div className="flex items-center gap-3 text-gray-600">
                🌍 {member.faritra}
              </div>
            )}
            <p className="text-gray-600">
              🕊️ Membre depuis {format(new Date(member.created_at), 'd MMMM yyyy', { locale: fr })}
            </p>
          </div>
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button onClick={onClose} className="btn-secondary flex-1 justify-center">Fermer</button>
            <button onClick={onEdit} className="btn-primary flex-1 justify-center">
              <Edit2 className="w-4 h-4" /> Modifier
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Membres() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterFaritra, setFilterFaritra] = useState<string>('all')
  const [filterSokajy, setFilterSokajy] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editMember, setEditMember] = useState<Member | null>(null)
  const [viewMember, setViewMember] = useState<Member | null>(null)
  const [saving, setSaving] = useState(false)
  const [faritras, setFaritras] = useState<string[]>([])

  // Charger les membres
  const loadMembers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('membre')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMembers(data || [])
      
      const uniqueFaritras = [...new Set((data || []).map(m => m.faritra).filter(Boolean))] as string[]
      setFaritras(uniqueFaritras)
    } catch (error) {
      console.error('Erreur chargement membres:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [])

  // Fonction d'impression
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Veuillez autoriser les popups pour imprimer')
      return
    }

    const today = new Date()
    const formattedDate = format(today, 'dd/MM/yyyy HH:mm')

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Liste des membres - Église</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; }
          .header h1 { color: #4f46e5; font-size: 24px; margin-bottom: 10px; }
          .header p { color: #666; font-size: 12px; }
          .stats { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 15px; }
          .stat-card { background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; flex: 1; }
          .stat-card .value { font-size: 24px; font-weight: bold; color: #4f46e5; }
          .stat-card .label { font-size: 12px; color: #666; margin-top: 5px; }
          .filters-info { background: #f9fafb; padding: 10px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f3f4f6; padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; }
          td { padding: 10px 12px; font-size: 11px; border-bottom: 1px solid #e5e7eb; color: #4b5563; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 20px; font-size: 10px; font-weight: 500; }
          .bg-purple-100 { background: #f3e8ff; color: #6b21a5; }
          .bg-indigo-100 { background: #e0e7ff; color: #4338ca; }
          .bg-blue-100 { background: #dbeafe; color: #1e40af; }
          .bg-amber-100 { background: #fef3c7; color: #92400e; }
          .bg-gray-100 { background: #f3f4f6; color: #374151; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 Liste des membres de l'Église</h1>
          <p>Généré le ${formattedDate}</p>
        </div>
        <div class="stats">
          <div class="stat-card"><div class="value">${filtered.length}</div><div class="label">Total affiché</div></div>
          <div class="stat-card"><div class="value">${members.length}</div><div class="label">Total membres</div></div>
          <div class="stat-card"><div class="value">${members.filter(m => m.sokajy === 'Pasteur').length}</div><div class="label">Pasteurs</div></div>
          <div class="stat-card"><div class="value">${members.filter(m => m.sokajy === 'Mpandray').length}</div><div class="label">Mpandray</div></div>
        </div>
        ${(filterFaritra !== 'all' || filterSokajy !== 'all') ? `<div class="filters-info"><strong>Filtres appliqués :</strong><br/>${filterFaritra !== 'all' ? `Région: ${filterFaritra} | ` : ''}${filterSokajy !== 'all' ? `Rôle: ${filterSokajy}` : ''}</div>` : ''}
        <table>
          <thead><tr><th>#</th><th>Nom complet</th><th>Téléphone</th><th>Adresse</th><th>Région</th><th>Rôle</th><th>Date d'adhésion</th></tr></thead>
          <tbody>
            ${filtered.map((member, index) => `
              <tr>
                <td>${index + 1}</td>
                <td><strong>${member.prenom} ${member.nom}</strong></td>
                <td>${member.telephone || '-'}</td>
                <td>${member.adresse?.substring(0, 40) || '-'}</td>
                <td>${member.faritra || '-'}</td>
                <td><span class="badge bg-${member.sokajy === 'Pasteur' ? 'purple-100' : member.sokajy === 'Mpandray' ? 'indigo-100' : member.sokajy === 'Diakona' ? 'blue-100' : member.sokajy === 'Vita batisa' ? 'amber-100' : 'gray-100'}">${member.sokajy}</span></td>
                <td>${format(new Date(member.created_at), 'dd/MM/yyyy')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer"><p>Document généré automatiquement - Système de Gestion d'Église</p></div>
      </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  // Ajouter un membre
  const addMember = async (memberData: any) => {
    try {
      setSaving(true)
      const { data, error } = await supabase
        .from('membre')
        .insert([memberData])
        .select()
        .single()

      if (error) throw error
      
      setMembers([data, ...members])
      setShowModal(false)
    } catch (error: any) {
      console.error('Erreur ajout membre:', error)
      alert(`Erreur: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Modifier un membre
  const updateMember = async (memberData: any) => {
    if (!editMember) return
    
    try {
      setSaving(true)
      const { data, error } = await supabase
        .from('membre')
        .update(memberData)
        .eq('id', editMember.id)
        .select()
        .single()

      if (error) throw error
      
      setMembers(members.map(m => m.id === editMember.id ? data : m))
      setShowModal(false)
      setEditMember(null)
    } catch (error: any) {
      console.error('Erreur modification membre:', error)
      alert(`Erreur: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Supprimer un membre
  const deleteMember = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) return
    
    try {
      const { error } = await supabase
        .from('membre')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setMembers(members.filter(m => m.id !== id))
    } catch (error: any) {
      console.error('Erreur suppression membre:', error)
      alert(`Erreur: ${error.message}`)
    }
  }

  const handleSave = (memberData: any) => {
    if (editMember) {
      updateMember(memberData)
    } else {
      addMember(memberData)
    }
  }

  const filtered = members.filter(m => {
    const matchSearch = `${m.nom} ${m.prenom} ${m.telephone}`.toLowerCase().includes(search.toLowerCase())
    const matchFaritra = filterFaritra === 'all' || m.faritra === filterFaritra
    const matchSokajy = filterSokajy === 'all' || m.sokajy === filterSokajy
    return matchSearch && matchFaritra && matchSokajy
  })

  const stats = {
    total: members.length,
    pasteurs: members.filter(m => m.sokajy === 'Pasteur').length,
    mpandray: members.filter(m => m.sokajy === 'Mpandray').length,
    diakona: members.filter(m => m.sokajy === 'Diakona').length,
    vitaBatisa: members.filter(m => m.sokajy === 'Vita batisa').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.pasteurs}</p>
            <p className="text-sm text-gray-500">Pasteurs</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.mpandray}</p>
            <p className="text-sm text-gray-500">Mpandray</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.diakona}</p>
            <p className="text-sm text-gray-500">Diakona</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.vitaBatisa}</p>
            <p className="text-sm text-gray-500">Vita batisa</p>
          </div>
        </div>
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
            <select className="input-field max-w-[160px]" value={filterFaritra} onChange={e => setFilterFaritra(e.target.value)}>
              <option value="all">Toutes régions</option>
              {faritras.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <select className="input-field max-w-[180px]" value={filterSokajy} onChange={e => setFilterSokajy(e.target.value)}>
              <option value="all">Tous les rôles</option>
              <option value="Pasteur">Pasteur</option>
              <option value="Mpandray">Mpandray</option>
              <option value="Diakona">Diakona</option>
              <option value="Vita batisa">Vita batisa</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="btn-secondary whitespace-nowrap">
              <Printer className="w-4 h-4" /> Imprimer
            </button>
            <button onClick={() => { setEditMember(null); setShowModal(true) }} className="btn-primary whitespace-nowrap">
              <Plus className="w-4 h-4" /> Nouveau membre
            </button>
          </div>
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
                <th className="table-header">Rôle / Catégorie</th>
                <th className="table-header hidden lg:table-cell">Région</th>
                <th className="table-header hidden lg:table-cell">Date d'ajout</th>
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
                          {member.prenom?.[0]}{member.nom?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{member.prenom} {member.nom}</p>
                        <p className="text-xs text-gray-500 sm:hidden">{member.telephone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell hidden sm:table-cell">
                    <p className="text-sm text-gray-600">{member.telephone || '-'}</p>
                    <p className="text-xs text-gray-400">{member.adresse?.substring(0, 30)}</p>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${roleColors[member.sokajy] || roleColors.membre}`}>
                      {roleLabels[member.sokajy] || member.sokajy}
                    </span>
                  </td>
                  <td className="table-cell hidden lg:table-cell text-gray-500">
                    {member.faritra || '-'}
                  </td>
                  <td className="table-cell hidden lg:table-cell text-gray-500">
                    {format(new Date(member.created_at), 'd MMM yyyy', { locale: fr })}
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
                      <button onClick={() => deleteMember(member.id)}
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
          saving={saving}
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