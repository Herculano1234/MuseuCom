import React, { useState } from 'react';
import use from '../../../hooks/useProfessor';
import { useAuth } from '../../../context/AuthContext';

interface Props {
  onToggleSidebar: () => void;
  title?: string;
}

export default function Navbar({ onToggleSidebar, title = 'Painel do Museu' }: Props) {
  // 1. Hook para gerenciar o estado do menu mobile no navbar
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { professor } = use();
  const { logout } = useAuth();

  // Função para alternar o menu mobile
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="w-full bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Lado Esquerdo: Sidebar Toggle e Título */}
          <div className="flex items-center gap-3">
            {/* Botão para a Sidebar Principal (mantido) */}
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150 ease-in-out focus:outline-none"
              aria-label="Abrir/Fechar Sidebar"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>

            {/* Título Principal */}
            <div className="flex items-baseline">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">{title}</h1>
            </div>
          </div>

          {/* Lado Direito: Ações e Perfil */}
          <div className="flex items-center gap-4">
            {/* Botões de Ação (Apenas para telas maiores) */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              <button className="px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium transition duration-150 ease-in-out">
                <i className="fas fa-bell mr-2"></i>Notificações
              </button>
              <button className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150 ease-in-out" aria-label="Configurações">
                <i className="fas fa-cog text-lg"></i>
              </button>
            </div>

            {/* Perfil do Usuário (foto e nome vindos do backend) */}
            <div className="flex items-center gap-2 cursor-pointer group">
              <img src={professor?.foto || '/public/avatar-placeholder.png'} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-sky-500 transition duration-150" />
              <div className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">{professor?.nome_completo || 'Museu'}</div>
            </div>

            <button onClick={logout} title="Sair" className="hidden sm:inline-flex p-2 rounded-md text-red-600 hover:bg-red-50 ml-2">
              <i className="fas fa-sign-out-alt"></i>
            </button>

            {/* Botão Hambúrguer Mobile (Aparece apenas em telas menores) */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150 ease-in-out focus:outline-none"
              aria-label="Menu Mobile"
            >
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-ellipsis-v'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile (Aparece condicionalmente) */}
      {isMobileMenuOpen && (
        <div className="md:hidden pb-3 border-t border-gray-200 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button className="block w-full text-left px-3 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white font-medium text-base transition duration-150 ease-in-out">
              <i className="fas fa-bell mr-2"></i>Notificações
            </button>
            <button className="block w-full text-left px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-base transition duration-150 ease-in-out">
              <i className="fas fa-cog mr-2"></i>Configurações
            </button>
          </div>
        </div>
      )}
    </header>
  );
}