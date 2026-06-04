import { Menu, Bell, Search, User } from 'lucide-react'
import { useApp } from '../../context/AppContext'

interface HeaderProps {
  onMenuClick: () => void
  title: string
}

export default function Header({ onMenuClick, title }: HeaderProps) {
  const { members, events } = useApp()
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date() && e.status === 'planifie').length

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

        {/* User */}
        <div className="flex items-center gap-2 bg-indigo-50 rounded-lg px-3 py-2 cursor-pointer hover:bg-indigo-100 transition-colors">
          <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-indigo-900">Paul Bernard</p>
            <p className="text-xs text-indigo-600">Pasteur</p>
          </div>
        </div>
      </div>
    </header>
  )
}
