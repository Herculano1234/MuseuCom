import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import api from "../../api";

// URL de uma imagem artística para o lado esquerdo (pode substituir por uma local depois)
const BG_IMAGE = "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070&auto=format&fit=crop";

export default function Signup() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [contacto, setContacto] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!nome || !email || !senha || !confirmarSenha)
      return setError("Por favor, preencha os campos obrigatórios.");
    
    if (senha !== confirmarSenha) 
      return setError("As senhas não coincidem.");

    if (senha.length < 6)
      return setError("A senha deve ter pelo menos 6 caracteres.");

    setLoading(true);

    try {
      // Usa o cliente `api` para chamar o backend
      const body = { nome, email, senha, telefone: contacto };
      await api.post('/usuarios', body);

      // Após cadastro, tentar login automático para melhor UX
      try {
        const loginResp = await api.post('/auth/login', { email: email.trim(), password: senha });
        const { token, refreshToken, ...user } = loginResp.data || {};
        if (token) localStorage.setItem('museucom-token', token);
        if (refreshToken) localStorage.setItem('museucom-refresh', refreshToken);
        localStorage.setItem('museucom-auth', 'true');
        localStorage.setItem('museucom-user', JSON.stringify(user));
        localStorage.setItem('museucom-perfil', user.role || 'user');
        navigate('/dashboard');
        return;
      } catch (loginErr: any) {
        // Se login automático falhar, segue para a tela de login
        console.warn('Cadastro ok, mas login automático falhou:', loginErr);
        setTimeout(() => {
          alert('Conta criada com sucesso. Por favor, faça login.');
          navigate('/login');
        }, 300);
        return;
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || err.message || 'Falha na conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      {/* Container Principal com Sombra e Bordas Arredondadas */}
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-fade-in-up">
        
        {/* Lado Esquerdo - Visual/Artistico */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform duration-1000 hover:scale-105"
            style={{ backgroundImage: `url(${BG_IMAGE})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 to-transparent"></div>
          
          <div className="relative z-10 p-12 text-white text-center">
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <i className="fas fa-landmark text-4xl"></i>
            </div>
            <h2 className="text-4xl font-bold mb-4">MuseuCom</h2>
            <p className="text-lg text-indigo-100 max-w-md mx-auto leading-relaxed">
              Conectando cultura, história e pessoas. Junte-se à nossa comunidade e explore o acervo digital.
            </p>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 relative">
          
          {/* Header Mobile/Desktop */}
          <div className="flex justify-between items-center mb-10">
            <a href="/" className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-2 font-medium text-sm">
              <i className="fas fa-arrow-left"></i> Voltar
            </a>
            <div className="lg:hidden text-indigo-700 font-bold text-xl flex items-center gap-2">
              <i className="fas fa-landmark"></i> MuseuCom
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Criar Conta</h1>
            <p className="text-gray-500 mb-8">Preencha seus dados para começar a explorar.</p>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-3 text-sm animate-shake">
                <i className="fas fa-exclamation-circle text-lg"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Input Nome */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Nome Completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="fas fa-user text-gray-400 group-focus-within:text-indigo-500 transition-colors"></i>
                  </div>
                  <input 
                    type="text" 
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-700"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                  />
                </div>
              </div>

              {/* Input Email */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="fas fa-envelope text-gray-400 group-focus-within:text-indigo-500 transition-colors"></i>
                  </div>
                  <input 
                    type="email" 
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-700"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Input Telefone */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Contacto (Opcional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="fas fa-phone text-gray-400 group-focus-within:text-indigo-500 transition-colors"></i>
                  </div>
                  <input 
                    type="tel" 
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-700"
                    placeholder="+244 9..."
                    value={contacto}
                    onChange={e => setContacto(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Input Senha */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <i className="fas fa-lock text-gray-400 group-focus-within:text-indigo-500 transition-colors"></i>
                    </div>
                    <input 
                      type="password" 
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-700"
                      placeholder="••••••"
                      value={senha}
                      onChange={e => setSenha(e.target.value)}
                    />
                  </div>
                </div>

                {/* Input Confirmar Senha */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Confirmar</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <i className="fas fa-check-circle text-gray-400 group-focus-within:text-indigo-500 transition-colors"></i>
                    </div>
                    <input 
                      type="password" 
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-700"
                      placeholder="••••••"
                      value={confirmarSenha}
                      onChange={e => setConfirmarSenha(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-6"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Criando...
                  </>
                ) : (
                  <>
                    Criar Minha Conta <i className="fas fa-arrow-right text-sm"></i>
                  </>
                )}
              </button>

              <div className="text-center mt-6 text-gray-500 text-sm">
                Já tem cadastro?{" "}
                <a href="/login" className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline">
                  Entrar agora
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Styles inline para animações simples sem precisar de config extra */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}