import { useState, useEffect } from 'react'
import { Users, DollarSign, Calendar, TrendingUp, TrendingDown, UserPlus, Clock, Loader2, Church, Gift } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'

import { useAuth } from '../context/AuthContext'
import supabase from '../lib/supabaseclient'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

function StatCard({ title, value, subtitle, icon: Icon, color, trend, loading }: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ElementType
  color: string
  trend?: { value: number; positive: boolean }
  loading?: boolean
}) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          {loading ? (
            <div className="h-9 mt-1 flex items-center">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            </div>
          ) : (
            <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend && !loading && (
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
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    membres: [],
    finances: [],
    evenements: [],
    sampana: []
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Récupérer les membres
        const { data: membres, error: membresError } = await supabase
          .from('membre')
          .select('*')
          .order('created_at', { ascending: false })

        if (membresError) throw membresError

        // Récupérer les finances
        const { data: finances, error: financesError } = await supabase
          .from('finances')
          .select('*')
          .order('date', { ascending: false })

        if (financesError) throw financesError

        // Récupérer les événements
        const { data: evenements, error: evenementsError } = await supabase
          .from('evenement')
          .select('*')
          .order('date', { ascending: true })

        if (evenementsError) throw evenementsError

        // Récupérer les groupes/sampana
        const { data: sampana, error: sampanaError } = await supabase
          .from('sampana')
          .select('*')

        if (sampanaError) throw sampanaError

        setStats({ membres: membres || [], finances: finances || [], evenements: evenements || [], sampana: sampana || [] })
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const membres = stats.membres
  const finances = stats.finances
  const evenements = stats.evenements
  const sampana = stats.sampana

  // Calculs stats membres
  const totalMembres = membres.length
  const nouveauxCeMois = membres.filter((m: any) => {
    if (!m.created_at) return false
    const joinDate = new Date(m.created_at)
    const now = new Date()
    return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear()
  }).length

  // Répartition par sokajy
  const membresParSokajy = membres.reduce((acc: Record<string, number>, m: any) => {
    const sokajy = m.sokajy || 'Non défini'
    acc[sokajy] = (acc[sokajy] || 0) + 1
    return acc
  }, {})

  const membresActifs = membresParSokajy['actif'] || 0

  // Calculs finances
  const revenus = finances
    .filter((f: any) => f.type === 'revenu')
    .reduce((sum: number, f: any) => sum + (Number(f.montant) || 0), 0)
  
  const depenses = finances
    .filter((f: any) => f.type === 'depense')
    .reduce((sum: number, f: any) => sum + (Number(f.montant) || 0), 0)
  
  const solde = revenus - depenses

  // Événements à venir
  const evenementsAVenir = evenements.filter((e: any) => {
    if (!e.date) return false
    const eventDate = new Date(e.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return eventDate >= today && e.statut === 'planifie'
  })

  const evenementsCeMois = evenements.filter((e: any) => {
    if (!e.date) return false
    const eventDate = new Date(e.date)
    const now = new Date()
    return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
  }).length

  const groupesActifs = sampana.length

  // Données graphique 6 mois
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i)
    const start = startOfMonth(d)
    const end = endOfMonth(d)
    
    const revenusMois = finances
      .filter((f: any) => {
        if (!f.date) return false
        const financeDate = new Date(f.date)
        return f.type === 'revenu' && financeDate >= start && financeDate <= end
      })
      .reduce((sum: number, f: any) => sum + (Number(f.montant) || 0), 0)
    
    const depensesMois = finances
      .filter((f: any) => {
        if (!f.date) return false
        const financeDate = new Date(f.date)
        return f.type === 'depense' && financeDate >= start && financeDate <= end
      })
      .reduce((sum: number, f: any) => sum + (Number(f.montant) || 0), 0)
    
    return {
      mois: format(d, 'MMM', { locale: fr }),
      revenus: revenusMois,
      depenses: depensesMois,
    }
  })

  // Dépenses par catégorie
  const depensesParCategorie = finances
    .filter((f: any) => f.type === 'depense')
    .reduce((acc: Record<string, number>, f: any) => {
      const categorie = f.categorie || 'Autres'
      acc[categorie] = (acc[categorie] || 0) + (Number(f.montant) || 0)
      return acc
    }, {})
  
  const pieData = Object.entries(depensesParCategorie).map(([name, value]) => ({ 
    name: name.charAt(0).toUpperCase() + name.slice(1), 
    value 
  }))

  // Membres par statut pour le graphique
  const membresPieData = Object.entries(membresParSokajy).map(([name, value]) => ({ 
    name: name === 'actif' ? 'Actifs' : name === 'inactif' ? 'Inactifs' : name === 'visiteur' ? 'Visiteurs' : name,
    value 
  }))

  // Nom de l'utilisateur
  const userName = user?.email?.split('@')[0] || 'Cher frère/sœur'

  // Tendances
  const lastMonthMembers = membres.filter((m: any) => {
    if (!m.created_at) return false
    const joinDate = new Date(m.created_at)
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    return joinDate.getMonth() === lastMonth.getMonth() && joinDate.getFullYear() === lastMonth.getFullYear()
  }).length
  
  const memberTrend = nouveauxCeMois > 0 && lastMonthMembers > 0 
    ? Math.round((nouveauxCeMois / lastMonthMembers) * 100) 
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bienvenue */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold">Bienvenue, {userName} ! 🙏</h2>
        <p className="mt-1 text-indigo-200">
          Voici un aperçu de votre église pour {format(new Date(), 'MMMM yyyy', { locale: fr })}
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="bg-white/20 rounded-xl px-4 py-2">
            <p className="text-xs text-indigo-200">Membres totaux</p>
            <p className="text-2xl font-bold">{totalMembres}</p>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2">
            <p className="text-xs text-indigo-200">Solde actuel</p>
            <p className="text-2xl font-bold">{solde.toLocaleString('fr-FR')} Ar</p>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2">
            <p className="text-xs text-indigo-200">Groupes</p>
            <p className="text-2xl font-bold">{groupesActifs}</p>
          </div>
        </div>
      </div>

      {/* Statistiques cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Membres"
          value={totalMembres}
          subtitle={`${membresActifs} actifs · ${nouveauxCeMois} nouveaux ce mois`}
          icon={Users}
          color="bg-indigo-600"
          trend={{ value: memberTrend, positive: memberTrend > 0 }}
          loading={loading}
        />
        <StatCard
          title="Revenus (Total)"
          value={`${revenus.toLocaleString('fr-FR')} Ar`}
          subtitle="Dîmes, offrandes & dons"
          icon={Gift}
          color="bg-emerald-500"
          loading={loading}
        />
        <StatCard
          title="Événements à venir"
          value={evenementsAVenir.length}
          subtitle={`Ce mois : ${evenementsCeMois} événements`}
          icon={Calendar}
          color="bg-amber-500"
          loading={loading}
        />
        <StatCard
          title="Groupes/Sampana"
          value={groupesActifs}
          subtitle={`Sampana actives`}
          icon={Church}
          color="bg-purple-500"
          loading={loading}
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Évolution Financière (6 mois)</h3>
          {last6Months.some(m => m.revenus > 0 || m.depenses > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={last6Months}>
                <defs>
                  <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
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
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString('fr-FR')} Ar`} />
                <Legend />
                <Area type="monotone" dataKey="revenus" stroke="#6366f1" strokeWidth={2} fill="url(#colorRevenus)" name="Revenus" />
                <Area type="monotone" dataKey="depenses" stroke="#ef4444" strokeWidth={2} fill="url(#colorDepenses)" name="Dépenses" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400">
              Aucune donnée financière disponible
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition des Dépenses</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie 
                  data={pieData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={90} 
                  paddingAngle={3} 
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v.toLocaleString('fr-FR')} Ar`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400">
              Aucune donnée de dépense disponible
            </div>
          )}
        </div>
      </div>

      {/* Prochains événements et Répartition membres */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Prochains Événements</h3>
            <span className="badge bg-indigo-100 text-indigo-700">{evenementsAVenir.length} à venir</span>
          </div>
          <div className="space-y-3">
            {evenementsAVenir.length > 0 ? (
              evenementsAVenir.slice(0, 5).map((event: any) => {
                const eventDate = event.date ? new Date(event.date) : new Date()
                return (
                  <div key={event.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0">
                      <span className="text-lg font-bold leading-none">{eventDate.getDate()}</span>
                      <span className="text-xs">{format(eventDate, 'MMM', { locale: fr })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{event.titre}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {event.heure ? event.heure.substring(0, 5) : 'Horaire à définir'} · {event.lieu || 'Lieu à définir'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-400">
                Aucun événement à venir
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Membres par Statut</h3>
          {membresPieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie 
                    data={membresPieData} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={70} 
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {membresPieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {membresPieData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400">
              Aucun membre disponible
            </div>
          )}
        </div>
      </div>

      {/* Nouveaux membres */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Membres Récents</h3>
          <UserPlus className="w-5 h-5 text-indigo-600" />
        </div>
        {membres.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Nom</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Téléphone</th>
                  <th className="text-left py-3 px-4 hidden sm:table-cell text-sm font-semibold text-gray-600">Faritra</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {membres.slice(0, 5).map((member: any) => {
                  const statusColors: Record<string, string> = {
                    actif: 'bg-green-100 text-green-700',
                    inactif: 'bg-red-100 text-red-700',
                    visiteur: 'bg-amber-100 text-amber-700',
                  }
                  return (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-700 font-semibold text-xs">
                              {member.prenom?.[0] || ''}{member.nom?.[0] || ''}
                            </span>
                          </div>
                          <span className="font-medium">{member.prenom} {member.nom}</span>
                        </div>
                       </td>
                      <td className="py-3 px-4">{member.telephone || '-'}</td>
                      <td className="py-3 px-4 hidden sm:table-cell">{member.faritra || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`badge ${statusColors[member.sokajy] || 'bg-gray-100 text-gray-700'}`}>
                          {member.sokajy || 'Non défini'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            Aucun membre enregistré
          </div>
        )}
      </div>
    </div>
  )
}