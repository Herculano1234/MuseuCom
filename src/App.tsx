import React, { useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Login from "./features/auth/Login";
import NotFound from './components/NotFound';
import LandingPage from "./features/LandingPage";
import CadastroMaterial from './features/CadastroMaterial';
import Signup from "./features/auth/Signup";
import UsersPage from './features/Users';
import ProfessorLayout from './features/Dashboard/components/ProfessorLayout';
import MateriaisProfPage from './features/Dashboard/materiais';
import UserHome from './features/Dashboard/UserHome';
import { Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import api from './api';
import { AuthProvider, useAuth } from './context/AuthContext';

function RequireAuth({ perfil }: { children?: React.ReactNode; perfil: string }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null; // ou um spinner
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (perfil && (user.role || '') !== perfil) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

function App() {
  // Ao carregar a app, se existir token, pede /me para validar/atualizar usuário
  useEffect(() => {
    const token = localStorage.getItem('museucom-token');
    if (!token) return;

    api.get('/me')
        .then((resp) => {
        const user = resp.data;
        if (user) {
          localStorage.setItem('museucom-user', JSON.stringify(user));
          localStorage.setItem('museucom-auth', 'true');
          localStorage.setItem('museucom-perfil', user.role || 'user');
        }
      })
      .catch((err) => {
        console.error('Falha ao validar token /me:', err?.response?.data || err.message || err);
        // limpa estado local se token inválido
        localStorage.removeItem('museucom-token');
        localStorage.removeItem('museucom-user');
        localStorage.removeItem('museucom-auth');
        localStorage.removeItem('museucom-perfil');
      });
  }, []);
  return (
    <AuthProvider>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/user/cadastro-material" element={<CadastroMaterial />} />
      <Route path="/usuarios" element={<UsersPage />} />

      {/* Dashboard (layout com sidebar + navbar) */}
      <Route path="/dashboard" element={<ProfessorLayout/>}>
        <Route index element={<UserHome />} />
        <Route path="materiais" element={<MateriaisProfPage />} />
        <Route path="cadastro-material" element={<CadastroMaterial />} />
      </Route>
      {/* Rotas do Profissional */}
      {/* Rotas públicas/guest */}
      {/* Catch-all: mostra NotFound em vez de tela em branco */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </AuthProvider>
  );
}

export default App;
