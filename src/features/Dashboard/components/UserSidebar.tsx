import React, { useState, useEffect } from 'react';
import useProfessor from '../../../hooks/useProfessor';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

interface Props {
  // 'isOpen' agora é usado principalmente para o estado Mobile.
  isOpen: boolean; 
  onClose: () => void;
  // Nova prop para alternar o estado compacto no desktop.
  onToggleCompact: () => void; 
}

// 📌 Estrutura de Link (Reaproveitada do código anterior)
interface NavLinkItem {
  to: string;
  icon: string;
  label: string;
}


const navLinks: NavLinkItem[] = [
  { to: "/user", icon: "fas fa-home", label: "Início" },
  { to: "/user/cadastro-material", icon: "fas fa-layer-group", label: "Cadastrar Material" },
  { to: "/user/materiais", icon: "fas fa-boxes", label: "Materiais" },
  { to: "/user/estatistica", icon: "fas fa-file-alt", label: "Estatísticas" },
];

export default function ProfSidebar({ isOpen, onClose, onToggleCompact }: Props) {
  const location = useLocation();
  const { professor } = useProfessor();
  // Novo estado local para gerenciar o modo compactado/expandido no desktop.
  // A lógica de setar este estado deve vir de 'onToggleCompact' no componente pai.
  const [isCompact, setIsCompact] = useState(false); 

  // Ajusta o estado 'isCompact' com base no tamanho da tela
  useEffect(() => {
    const checkViewport = () => {
      // Se a tela for XL ou maior, expande por padrão.
      // Se for LG, compacta. Isso simula o comportamento do Sidebar.tsx (w-64 xl:w-64 lg:w-20).
      if (window.innerWidth >= 1280) { // xl
        setIsCompact(false);
      } else if (window.innerWidth >= 1024) { // lg
        setIsCompact(true);
      }
    };
    
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // Determina a largura base para o Tailwind
  const sidebarWidthClass = isCompact ? 'w-20' : 'w-64';

  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // logout() já navega para /login
  };

  return (
    <>
      {/* 1. Overlay (Fundo Escuro para Mobile) - Padrão do Sidebar.tsx */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-900 bg-opacity-50 transition-opacity lg:hidden"
          onClick={onClose}
          aria-hidden={!isOpen}
        />
      )}

      {/* 2. Sidebar Principal */}
      <aside
        // Classes de largura e transição: mobile usa 'isOpen', desktop usa 'isCompact' (via sidebarWidthClass)
        className={`bg-white dark:bg-gray-900 shadow-2xl ${sidebarWidthClass}
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          fixed lg:static inset-y-0 left-0 z-40`}
      >
        <div className="h-full flex flex-col py-6 px-4">
          
          {/* Cabeçalho do Perfil/Logo */}
          <div className="mb-8 flex items-center justify-center lg:justify-start gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
            {/* Foto do professor vindo do backend */}
            <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shadow-md flex-shrink-0 ${isCompact ? 'mx-auto' : ''}`}>
              <img src={professor?.foto || '/public/avatar-placeholder.png'} alt="avatar" className="w-full h-full object-cover" />
            </div>
            {/* Esconde texto no modo compacto */}
            <div className={`transition-opacity duration-300 ${isCompact ? 'opacity-0 hidden' : 'opacity-100 block'}`}>
              <div className="text-sm font-extrabold text-gray-800 dark:text-gray-100">{professor?.nome_completo || 'Museu'}</div>
              <div className="text-xs text-sky-600 dark:text-sky-400 font-medium">Departamento</div>
            </div>
            {/* Botão de Toggle (Apenas em telas grandes) */}
            <button
                className="text-gray-500 hover:text-sky-600 dark:text-gray-400 dark:hover:text-sky-400 p-1 rounded-full ml-auto hidden xl:block"
                onClick={() => setIsCompact(!isCompact)}
                aria-label={isCompact ? "Expandir Sidebar" : "Compactar Sidebar"}
            >
                <i className={`fas ${isCompact ? 'fa-angle-right' : 'fa-angle-left'} text-lg`}></i>
            </button>
          </div>

          {/* Navegação Principal */}
          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;

                const baseClasses = "flex items-center gap-3 py-2 rounded-lg font-medium transition duration-200 ease-in-out";
                
                // Classes de destaque (mais suaves)
                const activeClasses = "bg-sky-500 text-white shadow-md shadow-sky-500/50";
                
                const inactiveClasses = "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-sky-600 dark:hover:text-sky-400";
                
                return (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      onClick={onClose}
                      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${isCompact ? 'justify-center px-0' : 'px-4'}`}
                      title={isCompact ? link.label : undefined} // Tooltip para modo compacto
                    >
                      <i className={`${link.icon} ${isCompact ? 'text-xl' : 'text-lg w-4'}`}></i>
                      {/* Esconde o label no modo compacto */}
                      <span className={`transition-opacity duration-300 ${isCompact ? 'opacity-0 hidden' : 'opacity-100 block'}`}>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Rodapé - Botão Sair */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button onClick={handleLogout} className={`w-full text-left py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition duration-200 ${isCompact ? 'text-center' : 'px-4'}`}>
              <i className={`fas fa-sign-out-alt ${isCompact ? 'text-xl' : 'mr-3'}`}></i>
              {/* Esconde o texto 'Sair' no modo compacto */}
              <span className={`transition-opacity duration-300 ${isCompact ? 'opacity-0 hidden' : 'opacity-100 block align-middle'}`}>Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}