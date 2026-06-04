import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard'
import Membres from './pages/Membres'
import Finances from './pages/Finances'
import Evenements from './pages/Evenements'
import Groupes from './pages/Groupes'
import Presence from './pages/Presence'
import Parametres from './pages/Parametres'

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/membres" element={<Membres />} />
            <Route path="/finances" element={<Finances />} />
            <Route path="/evenements" element={<Evenements />} />
            <Route path="/groupes" element={<Groupes />} />
            <Route path="/presence" element={<Presence />} />
            <Route path="/parametres" element={<Parametres />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}
