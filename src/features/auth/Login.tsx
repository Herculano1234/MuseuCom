import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion"; // Importação para animações
import "@fortawesome/fontawesome-free/css/all.min.css";
import api from "../../api";

const SIDE_BG_IMAGE = "https://images.unsplash.com/photo-1554907984-15263bfd63bd?q=80&w=2070&auto=format&fit=crop";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Preencha todos os campos.");

    try {
      setLoading(true);
      const resp = await api.post("/auth/login", { email: email.trim(), password });
      // resp.data contém { ...user, token }
      const { token, refreshToken, ...user } = resp.data || {};
      if (token) {
        localStorage.setItem('museucom-token', token);
      }
      if (refreshToken) {
        localStorage.setItem('museucom-refresh', refreshToken);
      }
      localStorage.setItem("museucom-auth", "true");
      localStorage.setItem("museucom-user", JSON.stringify(user));
      const userRole = (user && user.role) ? user.role : "user";
      localStorage.setItem("museucom-perfil", userRole);
      navigate(userRole === "administrador" ? "/admin" : "/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Erro ao autenticar.");
      console.error("Erro ao autenticar", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
      {/* Container Principal com Animação de Entrada */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col lg:flex-row w-full max-w-5xl min-h-[600px] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-100 border border-slate-100"
      >
        
        {/* LADO ESQUERDO: IMAGEM COM EFEITO DE ZOOM */}
        <div className="hidden lg:flex flex-1 relative p-12 flex-col justify-between overflow-hidden text-white">
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${SIDE_BG_IMAGE})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/95 via-indigo-900/80 to-indigo-800/60" />
          
          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link to="/" className="flex items-center gap-3 text-2xl font-black mb-16">
                <div className="w-10 h-10 bg-white text-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="fas fa-landmark"></i>
                </div>
                MuseuCom
              </Link>
              <h1 className="text-4xl font-black leading-tight mb-6">
                Acesse o nosso <br /> <span className="text-indigo-300">Acervo Histórico.</span>
              </h1>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="relative z-10"
          >
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <i className="fas fa-shield-alt text-indigo-300"></i>
              <span className="text-sm font-medium">Portal de Acesso Seguro</span>
            </div>
          </motion.div>
        </div>
        
        {/* LADO DIREITO: FORMULÁRIO COM ANIMAÇÃO STAGGER */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-white"
        >
          <div className="flex justify-between items-center mb-12">
            <Link to="/" className="text-slate-400 hover:text-indigo-600 font-bold flex items-center gap-2 transition-all">
              <i className="fas fa-arrow-left text-xs"></i> Voltar à Home
            </Link>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Entrar</h2>
            <p className="text-slate-500 font-medium">Bem-vindo à plataforma MuseuCom.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium flex items-center gap-3 border border-red-100"
            >
              <i className="fas fa-exclamation-circle"></i> {error}
            </motion.div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-black text-slate-400 ml-1">E-mail</label>
              <input
                type="email"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-800"
                placeholder="nome@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs uppercase tracking-widest font-black text-slate-400">Senha</label>
              </div>
              <input
                type="password"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-800"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Autenticando..." : "Entrar no Sistema"}
            </motion.button>
          </form>
          
          <div className="mt-10 text-center">
            <p className="text-slate-500 text-sm font-medium">
              Ainda não tem conta? <Link to="/signup" className="text-indigo-600 font-black hover:underline">Registe-se agora</Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}