import { useApp } from '../context/AppContext'
import { Users, DollarSign, Calendar, TrendingUp, TrendingDown, UserPlus, CheckCircle, Clock } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

function StatCard({ title, value, subtitle, icon: Icon, color, trend }: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ElementType
  color: string
  trend?: { value: number; positive: boolean }
}) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          {trend.positive ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs text-gray-400">vs mois précédent</span>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { members, transactions, events, groups, attendance } = useApp()

  // Calculs stats
  const activeMembers = members.filter(m => m.status === 'actif').length
  const newThisMonth = members.filter(m => {
    const d = new Date(m.joinDate)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const totalIncome = transactions.filter(t => t.type === 'recette').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'depense').reduce((s, t) => s + t.amount, 0)
  const balance = totalIncome - totalExpenses

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date() && e.status === 'planifie')
  const activeGroups = groups.filter(g => g.active).length

  // Données graphique revenus 6 mois
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i)
    const start = startOfMonth(d)
    const end = endOfMonth(d)
    const income = transactions
      .filter(t => t.type === 'recette' && new Date(t.date) >= start && new Date(t.date) <= end)
      .reduce((s, t) => s + t.amount, 0)
    const expenses = transactions
      .filter(t => t.type === 'depense' && new Date(t.date) >= start && new Date(t.date) <= end)
      .reduce((s, t) => s + t.amount, 0)
    return {
      mois: format(d, 'MMM', { locale: fr }),
      recettes: income,
      dépenses: expenses,
    }
  })

  // Pie chart catégories dépenses
  const expenseByCategory = transactions
    .filter(t => t.type === 'depense')
    .reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {})
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }))

  // Pie chart membres par statut
  const membersByStatus = [
    { name: 'Actifs', value: members.filter(m => m.status === 'actif').length },
    { name: 'Inactifs', value: members.filter(m => m.status === 'inactif').length },
    { name: 'Visiteurs', value: members.filter(m => m.status === 'visiteur').length },
  ]

  // Dernières présences
  const avgAttendance = attendance.length > 0
    ? Math.round(attendance.reduce((s, a) => s + (a.totalPresent / a.totalMembers * 100), 0) / attendance.length)
    : 0

  return (
    <div className="space-y-6">
      {/* Bienvenue */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold">Bienvenue, Pasteur Paul ! 🙏</h2>
        <p className="mt-1 text-indigo-200">
          Voici un aperçu de votre église pour {format(new Date(), 'MMMM yyyy', { locale: fr })}
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="bg-white/20 rounded-xl px-4 py-2">
            <p className="text-xs text-indigo-200">Membres actifs</p>
            <p className="text-2xl font-bold">{activeMembers}</p>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2">
            <p className="text-xs text-indigo-200">Solde actuel</p>
            <p className="text-2xl font-bold">{balance.toLocaleString('fr-FR')} €</p>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2">
            <p className="text-xs text-indigo-200">Taux de présence</p>
            <p className="text-2xl font-bold">{avgAttendance}%</p>
          </div>
        </div>
      </div>

      {/* Statistiques cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Membres"
          value={members.length}
          subtitle={`${activeMembers} actifs · ${newThisMonth} nouveaux ce mois`}
          icon={Users}
          color="bg-indigo-600"
          trend={{ value: 8, positive: true }}
        />
        <StatCard
          title="Recettes (Total)"
          value={`${totalIncome.toLocaleString('fr-FR')} €`}
          subtitle="Dîmes, offrandes & dons"
          icon={DollarSign}
          color="bg-emerald-500"
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          title="Événements à venir"
          value={upcomingEvents.length}
          subtitle={`Ce mois : ${events.filter(e => {
            const d = new Date(e.date)
            const now = new Date()
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
          }).length} événements`}
          icon={Calendar}
          color="bg-amber-500"
        />
        <StatCard
          title="Groupes Actifs"
          value={activeGroups}
          subtitle={`${groups.reduce((s, g) => s + g.members.length, 0)} membres en groupes`}
          icon={Users}
          color="bg-purple-500"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Évolution financière */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Évolution Financière (6 mois)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={last6Months}>
              <defs>
                <linearGradient id="colorRecettes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k€`} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString('fr-FR')} €`} />
              <Legend />
              <Area type="monotone" dataKey="recettes" stroke="#6366f1" strokeWidth={2} fill="url(#colorRecettes)" />
              <Area type="monotone" dataKey="dépenses" stroke="#ef4444" strokeWidth={2} fill="url(#colorDepenses)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition dépenses */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition des Dépenses</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `${v.toLocaleString('fr-FR')} €`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bas de page */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Prochains événements */}
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Prochains Événements</h3>
            <span className="badge bg-indigo-100 text-indigo-700">{upcomingEvents.length} à venir</span>
          </div>
          <div className="space-y-3">
            {upcomingEvents.slice(0, 5).map(event => {
              const typeColors: Record<string, string> = {
                culte: 'bg-indigo-100 text-indigo-700',
                reunion: 'bg-blue-100 text-blue-700',
                conference: 'bg-purple-100 text-purple-700',
                formation: 'bg-amber-100 text-amber-700',
                social: 'bg-green-100 text-green-700',
                autre: 'bg-gray-100 text-gray-700',
              }
              return (
                <div key={event.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0">
                    <span className="text-lg font-bold leading-none">{new Date(event.date).getDate()}</span>
                    <span className="text-xs">{format(new Date(event.date), 'MMM', { locale: fr })}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{event.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{event.time} · {event.location}</span>
                    </div>
                  </div>
                  <span className={`badge ${typeColors[event.type]} hidden sm:inline-flex`}>
                    {event.type}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Répartition membres */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Membres par Statut</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={membersByStatus} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                {membersByStatus.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {membersByStatus.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nouveaux membres */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Membres Récents</h3>
          <UserPlus className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">Nom</th>
                <th className="table-header">Rôle</th>
                <th className="table-header hidden sm:table-cell">Date d'adhésion</th>
                <th className="table-header">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.slice(-5).reverse().map(member => {
                const statusColors = {
                  actif: 'bg-green-100 text-green-700',
                  inactif: 'bg-red-100 text-red-700',
                  visiteur: 'bg-amber-100 text-amber-700',
                }
                return (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-700 font-semibold text-xs">
                            {member.firstName[0]}{member.lastName[0]}
                          </span>
                        </div>
                        <span className="font-medium">{member.firstName} {member.lastName}</span>
                      </div>
                    </td>
                    <td className="table-cell capitalize">{member.role}</td>
                    <td className="table-cell hidden sm:table-cell">
                      {format(new Date(member.joinDate), 'd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${statusColors[member.status]}`}>{member.status}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
