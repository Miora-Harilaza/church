import { useState } from 'react'
import { Church, Bell, Shield, Palette, Globe, Save, Check } from 'lucide-react'

interface ChurchSettings {
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
}

const defaultSettings: ChurchSettings = {
  name: 'Église Évangélique de la Grâce',
  pastor: 'Paul Bernard',
  address: '15 Rue de la Paix, 75001 Paris',
  phone: '+33 1 23 45 67 89',
  email: 'contact@eglise-grace.fr',
  website: 'www.eglise-grace.fr',
  denomination: 'Évangélique',
  founded: '2005',
  vision: 'Aller, faire des disciples, baptiser et enseigner toutes les nations.',
  currency: 'EUR',
  language: 'fr',
  timezone: 'Europe/Paris',
}

export default function Parametres() {
  const [settings, setSettings] = useState<ChurchSettings>(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState('church')

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const sections = [
    { id: 'church', label: 'Informations église', icon: Church },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'regional', label: 'Régional', icon: Globe },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar paramètres */}
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

        {/* Contenu */}
        <div className="lg:col-span-3 space-y-4">
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
                    <option>Évangélique</option>
                    <option>Baptiste</option>
                    <option>Pentecôtiste</option>
                    <option>Protestante</option>
                    <option>Catholique</option>
                    <option>Orthodoxe</option>
                    <option>Autre</option>
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

          {activeSection === 'notifications' && (
            <div className="card">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                Préférences de Notifications
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Rappel événements (48h avant)', desc: 'Recevoir un rappel 2 jours avant chaque événement' },
                  { label: 'Nouveaux membres', desc: 'Notification à l\'ajout d\'un nouveau membre' },
                  { label: 'Transactions importantes', desc: 'Alertes pour les transactions > 1000€' },
                  { label: 'Rapport hebdomadaire', desc: 'Résumé automatique chaque lundi matin' },
                  { label: 'Anniversaires des membres', desc: 'Rappel des anniversaires de la semaine' },
                  { label: 'Faible présence', desc: 'Alerte si taux de présence < 50%' },
                ].map((notif, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-800">{notif.label}</p>
                      <p className="text-sm text-gray-500">{notif.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={i < 3} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <h4 className="font-semibold text-amber-800 mb-2">Rôles et permissions</h4>
                  <div className="space-y-2 text-sm text-amber-700">
                    <p>🔴 <strong>Pasteur</strong> - Accès complet</p>
                    <p>🟡 <strong>Ancien/Diacre</strong> - Lecture et modification</p>
                    <p>🟢 <strong>Responsable</strong> - Lecture seule</p>
                    <p>⚪ <strong>Membre</strong> - Profil personnel uniquement</p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                      { name: 'Indigo', class: 'bg-indigo-600' },
                      { name: 'Violet', class: 'bg-violet-600' },
                      { name: 'Bleu', class: 'bg-blue-600' },
                      { name: 'Vert', class: 'bg-emerald-600' },
                      { name: 'Orange', class: 'bg-orange-500' },
                      { name: 'Rose', class: 'bg-pink-600' },
                    ].map(c => (
                      <button key={c.name} className={`w-10 h-10 rounded-xl ${c.class} ring-2 ring-offset-2 ring-transparent hover:ring-gray-400 transition-all`}
                        title={c.name} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Mode d'affichage</label>
                  <div className="flex gap-3">
                    <button className="flex-1 p-4 border-2 border-indigo-600 rounded-xl text-center bg-white">
                      <p className="text-2xl mb-1">☀️</p>
                      <p className="text-sm font-medium text-gray-700">Clair</p>
                    </button>
                    <button className="flex-1 p-4 border-2 border-gray-200 rounded-xl text-center">
                      <p className="text-2xl mb-1">🌙</p>
                      <p className="text-sm font-medium text-gray-500">Sombre</p>
                    </button>
                    <button className="flex-1 p-4 border-2 border-gray-200 rounded-xl text-center">
                      <p className="text-2xl mb-1">💻</p>
                      <p className="text-sm font-medium text-gray-500">Système</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="pt">Português</option>
                    <option value="ar">العربية</option>
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
                    <option value="MAD">DH Dirham (MAD)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuseau horaire</label>
                  <select className="input-field" value={settings.timezone}
                    onChange={e => setSettings(p => ({ ...p, timezone: e.target.value }))}>
                    <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                    <option value="Africa/Casablanca">Africa/Casablanca (UTC+1)</option>
                    <option value="Africa/Dakar">Africa/Dakar (UTC+0)</option>
                    <option value="America/New_York">America/New_York (UTC-5)</option>
                    <option value="America/Montreal">America/Montréal (UTC-5)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Format de date</label>
                  <select className="input-field">
                    <option>jj/mm/aaaa</option>
                    <option>mm/jj/aaaa</option>
                    <option>aaaa-mm-jj</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Bouton sauvegarder */}
          <div className="flex justify-end">
            <button onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all
                ${saved ? 'bg-green-500 text-white' : 'btn-primary'}`}>
              {saved ? <><Check className="w-4 h-4" /> Sauvegardé !</> : <><Save className="w-4 h-4" /> Sauvegarder</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
