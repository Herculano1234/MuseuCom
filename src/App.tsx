import React from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Login from "./features/auth/Login";
import NotFound from './components/NotFound';
import LandingPage from "./features/LandingPage";
import CadastroMaterial from './features/CadastroMaterial';
import Signup from "./features/auth/Signup";
import { Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";

function RequireAuth({ perfil }: { children?: React.ReactNode; perfil: string }) {
  const isAuth = localStorage.getItem("moyo-auth") === "true";
  const userPerfil = localStorage.getItem("moyo-perfil");
  const location = useLocation();
  if (!isAuth || userPerfil !== perfil) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/cadastro-material" element={<CadastroMaterial />} />
      {/* Rotas do Profissional */}
      {/* Rotas públicas/guest */}
      {/* Catch-all: mostra NotFound em vez de tela em branco */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
