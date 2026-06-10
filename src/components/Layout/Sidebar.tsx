import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, DollarSign, Calendar,
  Users2, CheckSquare, Settings, Church, ChevronRight, X
} from 'lucide-react'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Tableau de bord', exact: true },
  { path: '/membres', icon: Users, label: 'Membres' },
  { path: '/finances', icon: DollarSign, label: 'Finances' },
  { path: '/evenements', icon: Calendar, label: 'Événements' },
  { path: '/groupes', icon: Users2, label: 'Groupes & Cellules' },
  { path: '/presence', icon: CheckSquare, label: 'Présences' },
  { path: '/parametres', icon: Settings, label: 'Paramètres' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-indigo-900 to-indigo-800
        z-30 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-indigo-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Church className="w-6 h-6 text-indigo-700" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">FJKM - AntsoMaFi</h1>
              <p className="text-indigo-300 text-xs">Antsongo Mandroso Fiderana</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-indigo-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider px-3 mb-3">
            Navigation
          </p>
          {navItems.map(({ path, icon: Icon, label, exact }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group
                ${isActive
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'text-indigo-200 hover:bg-indigo-700/50 hover:text-white'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-indigo-300 group-hover:text-white'}`} />
                    {label}
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-indigo-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Version */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-700">
          <p className="text-indigo-400 text-xs text-center">FJKM - AntsoMaFi v1.0</p>
      
        </div>
      </aside>
    </>
  )
}
