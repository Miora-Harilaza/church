import { useState } from 'react'
import { useApp } from '../context/AppContext'
import type { Attendance } from '../types'
import { CheckSquare, Users, TrendingUp, Calendar, Plus, X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function AttendanceModal({ onClose, onSave }: { onClose: () => void, onSave: (a: Attendance) => void }) {
  const { members, events } = useApp()
  const [form, setForm] = useState({
    eventId: '',
    date: new Date().toISOString().split('T')[0],
    presentMembers: [] as string[],
    totalPresent: 0,
    notes: '',
  })

  const toggleMember = (id: string) => {
    setForm(p => ({
      ...p,
      presentMembers: p.presentMembers.includes(id)
        ? p.presentMembers.filter(m => m !== id)
        : [...p.presentMembers, id],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: crypto.randomUUID(),
      eventId: form.eventId,
      date: form.date,
      presentMembers: form.presentMembers,
      totalPresent: form.totalPresent || form.presentMembers.length,
      totalMembers: members.filter(m => m.status === 'actif').length,
      notes: form.notes,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">Enregistrer une présence</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Événement</label>
            <select className="input-field" value={form.eventId} onChange={e => setForm(p => ({ ...p, eventId: e.target.value }))}>
              <option value="">-- Sélectionner un événement --</option>
              {events.map(e => <option key={e.id} value={e.id}>{e.title} - {format(new Date(e.date), 'd MMM yyyy', { locale: fr })}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input required type="date" className="input-field" value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Présents membres ({form.presentMembers.length})
            </label>
            <div className="grid grid-cols-2 gap-2 border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
              {members.filter(m => m.status === 'actif').map(m => (
                <label key={m.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                  <input type="checkbox" checked={form.presentMembers.includes(m.id)}
                    onChange={() => toggleMember(m.id)} className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm">{m.firstName} {m.lastName}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total présents (inclut visiteurs non membres)
            </label>
            <input type="number" min="0" className="input-field" value={form.totalPresent}
              onChange={e => setForm(p => ({ ...p, totalPresent: Number(e.target.value) }))}
              placeholder={`${form.presentMembers.length} membres sélectionnés`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={2} className="input-field resize-none" value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Annuler</button>
            <button type="submit" className="btn-primary flex-1 justify-center">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Presence() {
  const { attendance, addAttendance, members, events } = useApp()
  const [showModal, setShowModal] = useState(false)

  const getEventTitle = (id: string) => events.find(e => e.id === id)?.title || 'Événement inconnu'

  const avgAttendanceRate = attendance.length > 0
    ? Math.round(attendance.reduce((s, a) => s + (a.totalPresent / a.totalMembers * 100), 0) / attendance.length)
    : 0

  const totalPresences = attendance.reduce((s, a) => s + a.totalPresent, 0)
  const activeMembers = members.filter(m => m.status === 'actif').length

  // Stats par membre (fidélité)
  const memberPresences = members.filter(m => m.status === 'actif').map(m => ({
    name: `${m.firstName} ${m.lastName}`,
    presences: attendance.filter(a => a.presentMembers.includes(m.id)).length,
    taux: attendance.length > 0
      ? Math.round(attendance.filter(a => a.presentMembers.includes(m.id)).length / attendance.length * 100)
      : 0,
  })).sort((a, b) => b.presences - a.presences)

  // Évolution des présences
  const attendanceHistory = [...attendance]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(a => ({
      date: format(new Date(a.date), 'd MMM', { locale: fr }),
      présents: a.totalPresent,
      taux: Math.round(a.totalPresent / a.totalMembers * 100),
    }))

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{attendance.length}</p>
            <p className="text-sm text-gray-500">Sessions enregistrées</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{avgAttendanceRate}%</p>
            <p className="text-sm text-gray-500">Taux moyen</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{totalPresences}</p>
            <p className="text-sm text-gray-500">Total présences</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{activeMembers}</p>
            <p className="text-sm text-gray-500">Membres actifs</p>
          </div>
        </div>
      </div>

      {/* Bouton nouveau */}
      <div className="flex justify-end">
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Enregistrer une présence
        </button>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Évolution des présences</h3>
          {attendanceHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={attendanceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="présents" stroke="#6366f1" strokeWidth={2} dot />
                <Line yAxisId="right" type="monotone" dataKey="taux" stroke="#10b981" strokeWidth={2} dot strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <p>Aucune donnée de présence</p>
            </div>
          )}
        </div>

        {/* Top membres */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Fidélité des membres</h3>
          {memberPresences.slice(0, 8).length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={memberPresences.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                <Tooltip />
                <Bar dataKey="presences" fill="#6366f1" radius={[0, 4, 4, 0]} name="Présences" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <p>Aucune donnée</p>
            </div>
          )}
        </div>
      </div>

      {/* Tableau des sessions */}
      <div className="card p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Historique des présences</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Date</th>
                <th className="table-header">Événement</th>
                <th className="table-header text-center">Présents</th>
                <th className="table-header text-center">Taux</th>
                <th className="table-header hidden md:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {attendance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(a => {
                const rate = Math.round(a.totalPresent / a.totalMembers * 100)
                return (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="table-cell text-gray-500">
                      {format(new Date(a.date), 'd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="table-cell font-medium">{getEventTitle(a.eventId)}</td>
                    <td className="table-cell text-center">
                      <span className="font-bold text-indigo-600">{a.totalPresent}</span>
                      <span className="text-gray-400 text-xs">/{a.totalMembers}</span>
                    </td>
                    <td className="table-cell text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${rate >= 70 ? 'bg-green-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${rate}%` }} />
                        </div>
                        <span className={`text-sm font-bold ${rate >= 70 ? 'text-green-600' : rate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                          {rate}%
                        </span>
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell text-gray-500 text-sm">{a.notes || '-'}</td>
                  </tr>
                )
              })}
              {attendance.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">
                  <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  Aucune présence enregistrée
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <AttendanceModal
          onClose={() => setShowModal(false)}
          onSave={a => { addAttendance(a); setShowModal(false) }}
        />
      )}
    </div>
  )
}
