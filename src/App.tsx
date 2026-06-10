import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Membres from './pages/Membres';
import Finances from './pages/Finances';
import Evenements from './pages/Evenements';
import Groupes from './pages/Groupes';
import Presence from './pages/Presence';
import Parametres from './pages/Parametres';
import Login from './pages/Login';
import { ThemeProvider } from './components/Content/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/membres" element={<Membres />} />
                <Route path="/finances" element={<Finances />} />
                <Route path="/evenements" element={<Evenements />} />
                <Route path="/groupes" element={<Groupes />} />
                <Route path="/presence" element={<Presence />} />
                <Route path="/parametres" element={<Parametres />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}