import { Menu, Bell, Search, User, LogOut, UserCircle, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabaseclient'

interface HeaderProps {
  onMenuClick: () => void
  title: string
}

interface AdminProfile {
  nom: string
  prenom: string
  email: string
  telephone?: string
  role?: string
}

export default function Header({ onMenuClick, title }: HeaderProps) {
  const { members, events } = useApp()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)
  
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date() && e.status === 'planifie').length

  // Récupérer le profil de l'administrateur connecté
  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('membre')
            .select('nom, prenom, email, telephone, sokajy')
            .eq('id', user.id)
            .single()
          
          if (error) throw error
          
          setAdminProfile({
            nom: data.nom,
            prenom: data.prenom,
            email: data.email,
            telephone: data.telephone,
            role: data.sokajy || 'Administrateur'
          })
        } catch (error) {
          console.error('Erreur chargement profil:', error)
          // Utiliser les données de l'utilisateur connecté comme fallback
          setAdminProfile({
            nom: user.user_metadata?.nom || 'Admin',
            prenom: user.user_metadata?.prenom || '',
            email: user.email || '',
            role: 'Administrateur'
          })
        } finally {
          setLoading(false)
        }
      }
    }
    
    fetchAdminProfile()
  }, [user])

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Gérer la déconnexion
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Gérer la navigation vers le profil
  const handleViewProfile = () => {
    navigate('/parametres') // ou '/profile' selon votre route
    setShowUserMenu(false)
  }

  // Nom complet de l'admin
  const adminFullName = adminProfile 
    ? `${adminProfile.prenom} ${adminProfile.nom}`.trim() 
    : user?.email?.split('@')[0] || 'Utilisateur'
  
  const adminInitial = adminFullName.charAt(0).toUpperCase()

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <p className="text-xs text-gray-500 hidden sm:block capitalize">{today}</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-56">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="bg-transparent text-sm outline-none text-gray-600 w-full placeholder-gray-400"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <Bell className="w-5 h-5" />
          {upcomingEvents > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
              {upcomingEvents > 9 ? '9+' : upcomingEvents}
            </span>
          )}
        </button>

        {/* User Menu Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 bg-indigo-50 rounded-lg px-3 py-2 cursor-pointer hover:bg-indigo-100 transition-colors"
          >
            <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-white text-xs font-semibold">{adminInitial}</span>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-indigo-900">{adminFullName}</p>
              <p className="text-xs text-indigo-600">{adminProfile?.role || 'Administrateur'}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-indigo-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-20">
              {/* Profile Header */}
              <div className="bg-indigo-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{adminInitial}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{adminFullName}</p>
                    <p className="text-xs text-gray-500">{adminProfile?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={handleViewProfile}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <UserCircle className="w-4 h-4 text-gray-500" />
                  Voir mon profil
                </button>
                
                <hr className="my-1 border-gray-200" />
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}