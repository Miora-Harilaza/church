import { useState, useRef, useMemo, useEffect } from 'react'
import { useFinances } from '../hooks/useFinances'
import { useApp } from '../context/AppContext'
import type { Transaction } from '../types'
import { 
  Plus, TrendingUp, TrendingDown, DollarSign, X, Trash2, Edit2, 
  Loader, Search, Calendar, Printer, Filter, ChevronDown, ChevronUp,
  RefreshCw, AlertCircle
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

const categories = {
  recette: ['Dîme', 'Offrande', 'Don spécial', 'Don en ligne', 'Collecte', 'Subvention', 'Autre recette'],
  depense: ['Location', 'Salaires', 'Fournitures', 'Entretien', 'Ministère', 'Évangélisation', 'Formation', 'Missions', 'Autre dépense'],
}

const defaultTx: Omit<Transaction, 'id'> = {
  date: new Date().toISOString().split('T')[0],
  type: 'recette',
  category: 'Dîme',
  description: '',
  amount: 0,
  paymentMethod: 'especes',
  memberId: '',
  reference: '',
}

function TransactionModal({ transaction, onClose, onSave, loading, selectedYear }: {
  transaction: Transaction | null
  onClose: () => void
  onSave: (t: Transaction) => Promise<void>
  loading?: boolean
  selectedYear: number
}) {
  const { members } = useApp()
  const [form, setForm] = useState<Omit<Transaction, 'id'>>(() => {
    if (transaction) return { ...transaction }
    return { 
      ...defaultTx,
      date: `${selectedYear}-${new Date().toISOString().split('T')[0].split('-')[1]}-${new Date().toISOString().split('T')[0].split('-')[2]}`
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSave({ ...form, id: transaction?.id || crypto.randomUUID(), amount: Number(form.amount) })
      onClose()
    } catch (error) {
      console.error('Save error:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">
            {transaction ? 'Modifier la transaction' : 'Nouvelle transaction'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={form.type}
                onChange={e => setForm(p => ({ 
                  ...p, 
                  type: e.target.value as Transaction['type'], 
                  category: categories[e.target.value as Transaction['type']][0] 
                }))}
              >
                <option value="recette">✅ Recette</option>
                <option value="depense">❌ Dépense</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input 
                required 
                type="date" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
              <select 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              >
                {categories[form.type].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€) *</label>
              <input 
                required 
                type="number" 
                min="0" 
                step="0.01" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: Number(e.target.value) }))}
              />
            </div>
            
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <input 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode de paiement</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={form.paymentMethod}
                onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value as Transaction['paymentMethod'] }))}
              >
                <option value="especes">Espèces</option>
                <option value="virement">Virement</option>
                <option value="cheque">Chèque</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Membre associé</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={form.memberId}
                onChange={e => setForm(p => ({ ...p, memberId: e.target.value }))}
              >
                <option value="">-- Aucun --</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
              </select>
            </div>
            
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={form.reference}
                onChange={e => setForm(p => ({ ...p, reference: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {transaction ? 'Modifier' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Finances() {
  const { transactions, loading, error, addTransaction, updateTransaction, deleteTransaction, refresh } = useFinances()
  const { getMemberFullName } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [activeTab, setActiveTab] = useState<'liste' | 'stats'>('liste')
  const [saving, setSaving] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  // Année sélectionnée (année actuelle par défaut)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  
  // Filtres supplémentaires
  const [searchDate, setSearchDate] = useState<string>('')
  const [searchDescription, setSearchDescription] = useState<string>('')
  const [searchCategory, setSearchCategory] = useState<string>('')
  const [searchType, setSearchType] = useState<string>('all')
  const [searchPaymentMethod, setSearchPaymentMethod] = useState<string>('all')
  const [minAmount, setMinAmount] = useState<string>('')
  const [maxAmount, setMaxAmount] = useState<string>('')
  
  const printRef = useRef<HTMLDivElement>(null)

  // Obtenir les années disponibles à partir des transactions
  const availableYears = useMemo(() => {
    const years = new Set<number>()
    transactions.forEach(t => {
      const year = new Date(t.date).getFullYear()
      years.add(year)
    })
    // Ajouter l'année courante si pas de transactions
    if (years.size === 0) {
      years.add(new Date().getFullYear())
    }
    return Array.from(years).sort((a, b) => b - a)
  }, [transactions])

  // Filtrer les transactions par année sélectionnée
  const transactionsByYear = useMemo(() => {
    return transactions.filter(t => new Date(t.date).getFullYear() === selectedYear)
  }, [transactions, selectedYear])

  // Filtrer les transactions par tous les critères
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactionsByYear]
    
    // Filtre par date exacte
    if (searchDate) {
      filtered = filtered.filter(t => t.date === searchDate)
    }
    
    // Filtre par description
    if (searchDescription) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchDescription.toLowerCase())
      )
    }
    
    // Filtre par catégorie
    if (searchCategory) {
      filtered = filtered.filter(t => 
        t.category.toLowerCase().includes(searchCategory.toLowerCase())
      )
    }
    
    // Filtre par type
    if (searchType !== 'all') {
      filtered = filtered.filter(t => t.type === searchType)
    }
    
    // Filtre par mode de paiement
    if (searchPaymentMethod !== 'all') {
      filtered = filtered.filter(t => t.paymentMethod === searchPaymentMethod)
    }
    
    // Filtre par montant minimum
    if (minAmount) {
      filtered = filtered.filter(t => t.amount >= Number(minAmount))
    }
    
    // Filtre par montant maximum
    if (maxAmount) {
      filtered = filtered.filter(t => t.amount <= Number(maxAmount))
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactionsByYear, searchDate, searchDescription, searchCategory, searchType, searchPaymentMethod, minAmount, maxAmount])

  // Calcul des totaux pour l'année sélectionnée
  const totalIncome = transactionsByYear.filter(t => t.type === 'recette').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactionsByYear.filter(t => t.type === 'depense').reduce((s, t) => s + t.amount, 0)
  const balance = totalIncome - totalExpenses

  // Réinitialiser tous les filtres (sauf l'année)
  const resetFilters = () => {
    setSearchDate('')
    setSearchDescription('')
    setSearchCategory('')
    setSearchType('all')
    setSearchPaymentMethod('all')
    setMinAmount('')
    setMaxAmount('')
  }

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = searchDate || searchDescription || searchCategory || searchType !== 'all' || 
                          searchPaymentMethod !== 'all' || minAmount || maxAmount

  const handleSave = async (t: Transaction) => {
    setSaving(true)
    try {
      if (editTx) {
        await updateTransaction(t)
      } else {
        await addTransaction(t)
      }
      setShowModal(false)
      setEditTx(null)
    } finally {
      setSaving(false)
    }
  }

  // Changement d'année
  const handleYearChange = (year: number) => {
    setSelectedYear(year)
    resetFilters() // Réinitialiser les filtres quand on change d'année
  }

  // Fonction d'impression
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Rapport Finances ${selectedYear}</title>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                padding: 20px;
                color: #333;
                line-height: 1.6;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #6366f1;
              }
              .header h1 {
                color: #6366f1;
                margin-bottom: 10px;
                font-size: 28px;
              }
              .header p { color: #666; }
              .summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
              }
              .card {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 12px;
                text-align: center;
                border: 1px solid #e0e0e0;
              }
              .card h3 {
                margin-bottom: 10px;
                font-size: 14px;
                color: #666;
              }
              .card .amount { font-size: 24px; font-weight: bold; }
              .positive { color: #10b981; }
              .negative { color: #ef4444; }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                overflow-x: auto;
                display: block;
              }
              th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #dee2e6;
              }
              th {
                background-color: #f8f9fa;
                font-weight: 600;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                text-align: center;
                font-size: 12px;
                color: #999;
                border-top: 1px solid #dee2e6;
              }
              @media (max-width: 768px) {
                body { padding: 10px; }
                .card .amount { font-size: 18px; }
                th, td { padding: 8px; font-size: 12px; }
              }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Rapport des Finances - Année ${selectedYear}</h1>
              <p>Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}</p>
              ${hasActiveFilters ? '<p><strong>Filtres appliqués</strong></p>' : ''}
            </div>
            
            <div class="summary">
              <div class="card">
                <h3>Total des Recettes</h3>
                <div class="amount positive">+${totalIncome.toLocaleString('fr-FR')} Ar</div>
              </div>
              <div class="card">
                <h3>Total des Dépenses</h3>
                <div class="amount negative">-${totalExpenses.toLocaleString('fr-FR')} Ar</div>
              </div>
              <div class="card">
                <h3>Solde</h3>
                <div class="amount ${balance >= 0 ? 'positive' : 'negative'}">
                  ${balance >= 0 ? '+' : ''}${balance.toLocaleString('fr-FR')} Ar
                </div>
              </div>
            </div>

            <h3 style="margin: 30px 0 15px 0;">Détail des transactions - ${selectedYear}</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Catégorie</th>
                  <th>Type</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                ${filteredTransactions.map(tx => `
                  <tr>
                    <td>${format(new Date(tx.date), 'dd/MM/yyyy')}</td>
                    <td>${tx.description}</td>
                    <td>${tx.category}</td>
                    <td>${tx.type === 'recette' ? 'Recette' : 'Dépense'}</td>
                    <td style="color: ${tx.type === 'recette' ? '#10b981' : '#ef4444'}">
                      ${tx.type === 'recette' ? '+' : '-'}${tx.amount.toLocaleString('fr-FR')} Ar
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="footer">
              <p>Système de Gestion d'Église</p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
      printWindow.onafterprint = () => printWindow.close()
    }
  }

  // Obtenir toutes les catégories uniques pour l'année sélectionnée
  const uniqueCategories = useMemo(() => {
    const cats = new Set(transactionsByYear.map(t => t.category))
    return Array.from(cats).sort()
  }, [transactionsByYear])

  // Obtenir tous les modes de paiement uniques pour l'année sélectionnée
  const uniquePaymentMethods = useMemo(() => {
    const methods = new Set(transactionsByYear.map(t => t.paymentMethod))
    return Array.from(methods)
  }, [transactionsByYear])

  // Données pour les graphiques mensuels de l'année sélectionnée
  const monthlyChartData = useMemo(() => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    return months.map((month, index) => {
      const monthNumber = index + 1
      const monthStr = monthNumber.toString().padStart(2, '0')
      const recettes = transactionsByYear
        .filter(t => t.type === 'recette' && new Date(t.date).getMonth() === index)
        .reduce((s, t) => s + t.amount, 0)
      const dépenses = transactionsByYear
        .filter(t => t.type === 'depense' && new Date(t.date).getMonth() === index)
        .reduce((s, t) => s + t.amount, 0)
      return { mois: month, recettes, dépenses }
    })
  }, [transactionsByYear])

  // Données pour le graphique des catégories de recettes
  const categoryData = transactionsByYear
    .filter(t => t.type === 'recette')
    .reduce((acc: Record<string, number>, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc }, {})
  const pieCategoryData = Object.entries(categoryData).map(([name, value]) => ({ name, value }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <p className="text-red-600 mb-4">Erreur: {error}</p>
        <button onClick={refresh} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Sélecteur d'année */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-white">
            <h2 className="text-lg sm:text-xl font-bold">Gestion financière</h2>
            <p className="text-indigo-100 text-sm">Visualisation par année</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-white font-medium">Année :</label>
            <select
              className="px-4 py-2 rounded-lg bg-white text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-white"
              value={selectedYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards pour l'année sélectionnée */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm text-emerald-600 font-medium">
                Total Recettes {selectedYear}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-1">
                {totalIncome.toLocaleString('fr-FR')} Ar
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs sm:text-sm text-red-600 font-medium">
                Total Dépenses {selectedYear}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-red-700 mt-1">
                {totalExpenses.toLocaleString('fr-FR')} Ar
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className={`bg-gradient-to-br ${balance >= 0 ? 'from-indigo-50 to-indigo-100 border-indigo-200' : 'from-orange-50 to-orange-100 border-orange-200'} rounded-xl p-4 sm:p-5 sm:col-span-2 lg:col-span-1`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-xs sm:text-sm font-medium ${balance >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>
                Solde {selectedYear}
              </p>
              <p className={`text-2xl sm:text-3xl font-bold mt-1 ${balance >= 0 ? 'text-indigo-700' : 'text-orange-700'}`}>
                {balance >= 0 ? '+' : ''}{balance.toLocaleString('fr-FR')} Ar
              </p>
            </div>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${balance >= 0 ? 'bg-indigo-500' : 'bg-orange-500'}`}>
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Barres de recherche avancées */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-600" />
            Filtres supplémentaires
          </h3>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showAdvancedFilters ? 'Masquer' : 'Plus de filtres'}
            </button>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex-1 sm:flex-none px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Réinitialiser
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>
            <button
              onClick={() => { setEditTx(null); setShowModal(true) }}
              className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouveau</span>
            </button>
          </div>
        </div>

        {/* Filtres de base */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />
              Date exacte
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              <Search className="w-3 h-3 inline mr-1" />
              Description
            </label>
            <input
              type="text"
              placeholder="Rechercher par description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={searchDescription}
              onChange={(e) => setSearchDescription(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <input
              type="text"
              list="categories-list"
              placeholder="Rechercher par catégorie..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
            />
            <datalist id="categories-list">
              {uniqueCategories.map(cat => <option key={cat} value={cat} />)}
            </datalist>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="all">Tous les types</option>
              <option value="recette">Recettes</option>
              <option value="depense">Dépenses</option>
            </select>
          </div>
        </div>

        {/* Filtres avancés */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Mode de paiement
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={searchPaymentMethod}
                  onChange={(e) => setSearchPaymentMethod(e.target.value)}
                >
                  <option value="all">Tous les modes</option>
                  {uniquePaymentMethods.map(method => (
                    <option key={method} value={method}>
                      {method === 'especes' ? 'Espèces' : 
                       method === 'virement' ? 'Virement' :
                       method === 'cheque' ? 'Chèque' : 'Mobile'}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Montant minimum (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Montant maximum (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Illimité"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Résumé des filtres actifs */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
            <p className="text-xs sm:text-sm text-indigo-700 flex flex-wrap gap-2 items-center">
              <span className="font-semibold">Filtres actifs :</span>
              {searchDate && <span className="bg-indigo-100 px-2 py-1 rounded">Date: {format(new Date(searchDate), 'dd/MM/yyyy')}</span>}
              {searchDescription && <span className="bg-indigo-100 px-2 py-1 rounded">Description: {searchDescription}</span>}
              {searchCategory && <span className="bg-indigo-100 px-2 py-1 rounded">Catégorie: {searchCategory}</span>}
              {searchType !== 'all' && <span className="bg-indigo-100 px-2 py-1 rounded">Type: {searchType === 'recette' ? 'Recettes' : 'Dépenses'}</span>}
              {searchPaymentMethod !== 'all' && <span className="bg-indigo-100 px-2 py-1 rounded">Paiement: {searchPaymentMethod}</span>}
              {minAmount && <span className="bg-indigo-100 px-2 py-1 rounded">Min: {Number(minAmount).toLocaleString('fr-FR')} Ar</span>}
              {maxAmount && <span className="bg-indigo-100 px-2 py-1 rounded">Max: {Number(maxAmount).toLocaleString('fr-FR')} Ar</span>}
            </p>
          </div>
        )}
        
        <div className="mt-3 text-xs sm:text-sm text-gray-500">
          {filteredTransactions.length} transaction(s) trouvée(s) pour l'année {selectedYear}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('liste')}
          className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === 'liste' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📋 Transactions {selectedYear}
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === 'stats' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📊 Statistiques {selectedYear}
        </button>
      </div>

      {activeTab === 'liste' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Catégorie</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Mode</th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {format(new Date(tx.date), 'd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 break-words max-w-[150px] sm:max-w-xs">
                        {tx.description}
                      </p>
                      {tx.memberId && (
                        <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                          {getMemberFullName(tx.memberId)}
                        </p>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell text-xs sm:text-sm text-gray-500 capitalize">
                      {tx.paymentMethod === 'especes' ? 'Espèces' : 
                       tx.paymentMethod === 'virement' ? 'Virement' :
                       tx.paymentMethod === 'cheque' ? 'Chèque' : 'Mobile'}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                      <span className={`text-sm sm:text-base font-bold ${tx.type === 'recette' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {tx.type === 'recette' ? '+' : '-'}{tx.amount.toLocaleString('fr-FR')} Ar
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button 
                          onClick={() => { setEditTx(tx); setShowModal(true) }}
                          className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600 transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          onClick={async () => { if (window.confirm('Supprimer cette transaction ?')) await deleteTransaction(tx.id) }}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 sm:px-6 py-12 text-center text-gray-400">
                      Aucune transaction trouvée pour l'année {selectedYear}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Graphique mensuel */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                Recettes vs Dépenses par mois - {selectedYear}
              </h3>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mois" tick={{ fontSize: 10, sm: 12 }} />
                    <YAxis tick={{ fontSize: 10, sm: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => `${v.toLocaleString('fr-FR')} Ar`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="recettes" fill="#10b981" radius={[4,4,0,0]} />
                    <Bar dataKey="dépenses" fill="#ef4444" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Graphique des catégories */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                Sources de Recettes - {selectedYear}
              </h3>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieCategoryData} 
                      cx="50%" 
                      cy="50%" 
                      outerRadius="80%" 
                      dataKey="value" 
                      label={({ name, percent }) => `${percent > 0.05 ? name : ''}`}
                    >
                      {pieCategoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v.toLocaleString('fr-FR')} Ar`} />
                    <Legend wrapperStyle={{ fontSize: '10px', sm: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Résumé mensuel */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm overflow-x-auto">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Résumé mensuel {selectedYear}</h3>
            <table className="min-w-[500px] sm:min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mois</th>
                  <th className="px-3 sm:px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Recettes</th>
                  <th className="px-3 sm:px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Dépenses</th>
                  <th className="px-3 sm:px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Solde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {monthlyChartData.map(row => {
                  const solde = row.recettes - row.dépenses
                  return (
                    <tr key={row.mois} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900">{row.mois}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm text-emerald-600 font-semibold">
                        +{row.recettes.toLocaleString('fr-FR')} Ar
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm text-red-600 font-semibold">
                        -{row.dépenses.toLocaleString('fr-FR')} Ar
                      </td>
                      <td className={`px-3 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-bold ${solde >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>
                        {solde >= 0 ? '+' : ''}{solde.toLocaleString('fr-FR')} Ar
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <TransactionModal 
          transaction={editTx} 
          onClose={() => { setShowModal(false); setEditTx(null) }} 
          onSave={handleSave}
          loading={saving}
          selectedYear={selectedYear}
        />
      )}
    </div>
  )
}