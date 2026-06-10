import { useState, useEffect } from 'react'
import { Church, Bell, Shield, Palette, Globe, Save, Check, Loader2, User, Mail, Phone, MapPin, Globe2, Clock, DollarSign, Languages } from 'lucide-react'
import supabase from '../lib/supabaseclient'
import { useApp } from '../context/AppContext'

interface ChurchSettings {
  id?: string
  name: string
  pastor: string
  address: string
  phone: string
  email: string
  website: string
  denomination: string
  founded: string
  vision: string
  currency: string
  language: string
  timezone: string
  date_format: string
}

const defaultSettings: ChurchSettings = {
  name: '',
  pastor: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  denomination: 'Évangélique',
  founded: new Date().getFullYear().toString(),
  vision: '',
  currency: 'EUR',
  language: 'fr',
  timezone: 'Europe/Paris',
  date_format: 'dd/MM/yyyy',
}

export default function Parametres() {
  const { user } = useApp()
  const [settings, setSettings] = useState<ChurchSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState('church')
  const [error, setError] = useState('')

  // Charger les paramètres depuis Supabase
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('church_settings')
        .select('*')
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
        setSettings(data)
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const { error } = await supabase
        .from('church_settings')
        .upsert({
          ...settings,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })

      if (error) throw error
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const sections = [
    { id: 'church', label: 'Informations', icon: Church },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'regional', label: 'Régional', icon: Globe },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="card lg:col-span-1 h-fit">
          <nav className="space-y-1">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left
                  ${activeSection === s.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <s.icon className={`w-5 h-5 ${activeSection === s.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-3 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Section Église */}
          {activeSection === 'church' && (
            <div className="card">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Church className="w-5 h-5 text-indigo-600" />
                Informations de l'Église
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'église</label>
                  <input className="input-field" value={settings.name}
                    onChange={e => setSettings(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pasteur principal</label>
                  <input className="input-field" value={settings.pastor}
                    onChange={e => setSettings(p => ({ ...p, pastor: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dénomination</label>
                  <select className="input-field" value={settings.denomination}
                    onChange={e => setSettings(p => ({ ...p, denomination: e.target.value }))}>
                    <option>Évangélique</option><option>Baptiste</option><option>Pentecôtiste</option>
                    <option>Protestante</option><option>Catholique</option><option>Orthodoxe</option><option>Autre</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input className="input-field" value={settings.address}
                    onChange={e => setSettings(p => ({ ...p, address: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input className="input-field" value={settings.phone}
                    onChange={e => setSettings(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="input-field" value={settings.email}
                    onChange={e => setSettings(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
                  <input className="input-field" value={settings.website}
                    onChange={e => setSettings(p => ({ ...p, website: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Année de fondation</label>
                  <input type="number" className="input-field" value={settings.founded}
                    onChange={e => setSettings(p => ({ ...p, founded: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vision / Mission</label>
                  <textarea rows={3} className="input-field resize-none" value={settings.vision}
                    onChange={e => setSettings(p => ({ ...p, vision: e.target.value }))} />
                </div>
              </div>
            </div>
          )}

          {/* Section Notifications */}
          {activeSection === 'notifications' && (
            <div className="card">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                Préférences de Notifications
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'event_reminder', label: 'Rappel événements (48h avant)', desc: 'Recevoir un rappel 2 jours avant chaque événement', default: true },
                  { id: 'new_member', label: 'Nouveaux membres', desc: 'Notification à l\'ajout d\'un nouveau membre', default: true },
                  { id: 'large_transaction', label: 'Transactions importantes', desc: 'Alertes pour les transactions > 1000€', default: true },
                  { id: 'weekly_report', label: 'Rapport hebdomadaire', desc: 'Résumé automatique chaque lundi matin', default: false },
                  { id: 'birthday', label: 'Anniversaires des membres', desc: 'Rappel des anniversaires de la semaine', default: false },
                  { id: 'low_attendance', label: 'Faible présence', desc: 'Alerte si taux de présence < 50%', default: false },
                ].map((notif, i) => (
                  <div key={notif.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{notif.label}</p>
                      <p className="text-xs text-gray-500">{notif.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={notif.default} className="sr-only peer" />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section Sécurité */}
          {activeSection === 'security' && (
            <div className="card">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                Sécurité & Accès
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                  <input type="password" className="input-field" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                  <input type="password" className="input-field" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                  <input type="password" className="input-field" placeholder="••••••••" />
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-amber-800 mb-2">Rôles et permissions</h4>
                  <div className="space-y-1 text-sm text-amber-700">
                    <p>🔴 <strong>Admin</strong> - Accès complet</p>
                    <p>🟡 <strong>Modérateur</strong> - Lecture et modification limitée</p>
                    <p>🟢 <strong>Utilisateur</strong> - Lecture seule</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section Apparence */}
          {activeSection === 'appearance' && (
            <div className="card">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-600" />
                Apparence
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Couleur principale</label>
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { name: 'Indigo', class: 'bg-indigo-600', value: 'indigo' },
                      { name: 'Violet', class: 'bg-violet-600', value: 'violet' },
                      { name: 'Bleu', class: 'bg-blue-600', value: 'blue' },
                      { name: 'Vert', class: 'bg-emerald-600', value: 'emerald' },
                      { name: 'Orange', class: 'bg-orange-500', value: 'orange' },
                      { name: 'Rose', class: 'bg-pink-600', value: 'pink' },
                    ].map(c => (
                      <button key={c.name} className={`w-10 h-10 rounded-full ${c.class} ring-2 ring-offset-2 ring-transparent hover:ring-gray-400 transition-all`}
                        title={c.name} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Mode d'affichage</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { mode: 'light', label: 'Clair', icon: '☀️' },
                      { mode: 'dark', label: 'Sombre', icon: '🌙' },
                      { mode: 'system', label: 'Système', icon: '💻' },
                    ].map(m => (
                      <button key={m.mode} className="p-3 border-2 border-gray-200 rounded-lg text-center hover:border-indigo-500 transition-all">
                        <p className="text-2xl mb-1">{m.icon}</p>
                        <p className="text-sm font-medium">{m.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section Régional */}
          {activeSection === 'regional' && (
            <div className="card">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                Paramètres Régionaux
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
                  <select className="input-field" value={settings.language}
                    onChange={e => setSettings(p => ({ ...p, language: e.target.value }))}>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="pt">🇵🇹 Português</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                  <select className="input-field" value={settings.currency}
                    onChange={e => setSettings(p => ({ ...p, currency: e.target.value }))}>
                    <option value="EUR">€ Euro (EUR)</option>
                    <option value="USD">$ Dollar (USD)</option>
                    <option value="GBP">£ Livre (GBP)</option>
                    <option value="XAF">FCFA (XAF)</option>
                    <option value="XOF">CFA (XOF)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuseau horaire</label>
                  <select className="input-field" value={settings.timezone}
                    onChange={e => setSettings(p => ({ ...p, timezone: e.target.value }))}>
                    <option value="Europe/Paris">🇫🇷 Europe/Paris</option>
                    <option value="Africa/Casablanca">🇲🇦 Africa/Casablanca</option>
                    <option value="Africa/Dakar">🇸🇳 Africa/Dakar</option>
                    <option value="America/New_York">🇺🇸 America/New_York</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Format de date</label>
                  <select className="input-field" value={settings.date_format}
                    onChange={e => setSettings(p => ({ ...p, date_format: e.target.value }))}>
                    <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                    <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                    <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Bouton sauvegarder */}
          <div className="flex justify-end sticky bottom-4">
            <button onClick={handleSave} disabled={saving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all shadow-md
                ${saved ? 'bg-emerald-500 text-white' : 'btn-primary'} disabled:opacity-50`}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><Check className="w-4 h-4" /> Sauvegardé !</> : <><Save className="w-4 h-4" /> Sauvegarder</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}