import { useState } from 'react'
import { useApp } from '../context/AppContext'
import type { Transaction } from '../types'
import { Plus, TrendingUp, TrendingDown, DollarSign, X, Trash2, Edit2, Download } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6']

const categories = {
  recette: ['Dîme', 'Offrande', 'Don spécial', 'Don en ligne', 'Collecte', 'Subvention', 'Autre recette'],
  depense: ['Location', 'Salaires', 'Fournitures', 'Entretien', 'Ministère', 'Évangélisation', 'Formation', 'Missions', 'Autre dépense'],
}

const defaultTx: Omit<Transaction, 'id'> = {
  date: new Date().toISOString().split('T')[0],
  type: 'recette', category: 'Dîme',
  description: '', amount: 0,
  paymentMethod: 'especes', memberId: '', reference: '',
}

function TransactionModal({ transaction, onClose, onSave }: {
  transaction: Transaction | null
  onClose: () => void
  onSave: (t: Transaction) => void
}) {
  const { members } = useApp()
  const [form, setForm] = useState<Omit<Transaction, 'id'>>(transaction ? { ...transaction } : { ...defaultTx })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...form, id: transaction?.id || crypto.randomUUID(), amount: Number(form.amount) })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">
            {transaction ? 'Modifier la transaction' : 'Nouvelle transaction'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select required className="input-field" value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value as Transaction['type'], category: categories[e.target.value as Transaction['type']][0] }))}>
                <option value="recette">✅ Recette</option>
                <option value="depense">❌ Dépense</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input required type="date" className="input-field" value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
              <select required className="input-field" value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {categories[form.type].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€) *</label>
              <input required type="number" min="0" step="0.01" className="input-field" value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: Number(e.target.value) }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <input required className="input-field" value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode de paiement</label>
              <select className="input-field" value={form.paymentMethod}
                onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value as Transaction['paymentMethod'] }))}>
                <option value="especes">Espèces</option>
                <option value="virement">Virement</option>
                <option value="cheque">Chèque</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Membre associé</label>
              <select className="input-field" value={form.memberId}
                onChange={e => setForm(p => ({ ...p, memberId: e.target.value }))}>
                <option value="">-- Aucun --</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
              <input className="input-field" value={form.reference}
                onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Annuler</button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              {transaction ? 'Modifier' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Finances() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, getMemberFullName } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterMonth, setFilterMonth] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'liste' | 'stats'>('liste')

  const totalIncome = transactions.filter(t => t.type === 'recette').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'depense').reduce((s, t) => s + t.amount, 0)
  const balance = totalIncome - totalExpenses

  // Données mensuel
  const monthOptions = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), i)
    return { value: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy', { locale: fr }) }
  })

  const filtered = transactions.filter(t => {
    const matchType = filterType === 'all' || t.type === filterType
    const matchMonth = filterMonth === 'all' || t.date.startsWith(filterMonth)
    return matchType && matchMonth
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleSave = (t: Transaction) => {
    if (editTx) updateTransaction(t)
    else addTransaction(t)
    setShowModal(false); setEditTx(null)
  }

  // Graphique mensuel
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i)
    const start = startOfMonth(d); const end = endOfMonth(d)
    return {
      mois: format(d, 'MMM yy', { locale: fr }),
      recettes: transactions.filter(t => t.type === 'recette' && new Date(t.date) >= start && new Date(t.date) <= end).reduce((s, t) => s + t.amount, 0),
      dépenses: transactions.filter(t => t.type === 'depense' && new Date(t.date) >= start && new Date(t.date) <= end).reduce((s, t) => s + t.amount, 0),
    }
  })

  const categoryData = transactions
    .filter(t => t.type === 'recette')
    .reduce((acc: Record<string, number>, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc }, {})
  const pieCategoryData = Object.entries(categoryData).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-emerald-600 font-medium">Total Recettes</p>
              <p className="text-3xl font-bold text-emerald-700 mt-1">{totalIncome.toLocaleString('fr-FR')} €</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Total Dépenses</p>
              <p className="text-3xl font-bold text-red-700 mt-1">{totalExpenses.toLocaleString('fr-FR')} €</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className={`card bg-gradient-to-br ${balance >= 0 ? 'from-indigo-50 to-indigo-100 border-indigo-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-sm font-medium ${balance >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>Solde</p>
              <p className={`text-3xl font-bold mt-1 ${balance >= 0 ? 'text-indigo-700' : 'text-orange-700'}`}>
                {balance >= 0 ? '+' : ''}{balance.toLocaleString('fr-FR')} €
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${balance >= 0 ? 'bg-indigo-500' : 'bg-orange-500'}`}>
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[{ id: 'liste', label: '📋 Transactions' }, { id: 'stats', label: '📊 Statistiques' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as 'liste' | 'stats')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'liste' && (
        <>
          {/* Filtres */}
          <div className="card">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-3">
                <select className="input-field max-w-[150px]" value={filterType} onChange={e => setFilterType(e.target.value)}>
                  <option value="all">Tous types</option>
                  <option value="recette">Recettes</option>
                  <option value="depense">Dépenses</option>
                </select>
                <select className="input-field max-w-[200px]" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                  <option value="all">Tous les mois</option>
                  {monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary">
                  <Download className="w-4 h-4" /> Exporter
                </button>
                <button onClick={() => { setEditTx(null); setShowModal(true) }} className="btn-primary whitespace-nowrap">
                  <Plus className="w-4 h-4" /> Nouvelle transaction
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{filtered.length} transaction(s)</p>
          </div>

          {/* Tableau */}
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Date</th>
                    <th className="table-header">Description</th>
                    <th className="table-header hidden sm:table-cell">Catégorie</th>
                    <th className="table-header hidden md:table-cell">Mode</th>
                    <th className="table-header text-right">Montant</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {filtered.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="table-cell text-gray-500 whitespace-nowrap">
                        {format(new Date(tx.date), 'd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="table-cell max-w-xs">
                        <p className="font-medium text-gray-800 truncate">{tx.description}</p>
                        {tx.memberId && <p className="text-xs text-gray-400">{getMemberFullName(tx.memberId)}</p>}
                      </td>
                      <td className="table-cell hidden sm:table-cell">
                        <span className="badge bg-gray-100 text-gray-600">{tx.category}</span>
                      </td>
                      <td className="table-cell hidden md:table-cell capitalize text-gray-500">{tx.paymentMethod}</td>
                      <td className="table-cell text-right">
                        <span className={`font-bold text-base ${tx.type === 'recette' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {tx.type === 'recette' ? '+' : '-'}{tx.amount.toLocaleString('fr-FR')} €
                        </span>
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditTx(tx); setShowModal(true) }}
                            className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => { if (confirm('Supprimer ?')) deleteTransaction(tx.id) }}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400">Aucune transaction</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recettes vs Dépenses (6 mois)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString('fr-FR')} €`} />
                  <Legend />
                  <Bar dataKey="recettes" fill="#10b981" radius={[4,4,0,0]} />
                  <Bar dataKey="dépenses" fill="#ef4444" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Sources de Recettes</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieCategoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieCategoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v.toLocaleString('fr-FR')} €`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Résumé mensuel */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Résumé mensuel</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="table-header">Mois</th>
                    <th className="table-header text-right">Recettes</th>
                    <th className="table-header text-right">Dépenses</th>
                    <th className="table-header text-right">Solde</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {chartData.reverse().map(row => {
                    const s = row.recettes - row.dépenses
                    return (
                      <tr key={row.mois} className="hover:bg-gray-50">
                        <td className="table-cell font-medium capitalize">{row.mois}</td>
                        <td className="table-cell text-right text-emerald-600 font-semibold">+{row.recettes.toLocaleString('fr-FR')} €</td>
                        <td className="table-cell text-right text-red-600 font-semibold">-{row.dépenses.toLocaleString('fr-FR')} €</td>
                        <td className={`table-cell text-right font-bold ${s >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>
                          {s >= 0 ? '+' : ''}{s.toLocaleString('fr-FR')} €
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <TransactionModal transaction={editTx} onClose={() => { setShowModal(false); setEditTx(null) }} onSave={handleSave} />
      )}
    </div>
  )
}
