import React from 'react';
import ProfSidebar from '../components/UserSidebar';
import ProfNavbar from '../components/UserNavbar';
import { Outlet } from 'react-router-dom';
import { ToastProvider } from '../../../components/ToastContext';

export default function ProfessorLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  // 💡 Recomendação: Criar um estado para o modo compacto aqui (no layout pai)
  // para que o conteúdo principal (a div 'flex-1') possa se ajustar
  // quando o sidebar mudar de largura.
  // const [isCompact, setIsCompact] = React.useState(false);

  return (
    // ✅ MUDANÇA 1: Usar 'h-screen' em vez de 'min-h-screen' e adicionar 'overflow-hidden' 
    // para garantir que o contêiner principal não role.
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900"> 
      
      {/* O ProfSidebar já está configurado como 'fixed' e 'h-full' */}
      <ProfSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggleCompact={() => {
          // Lógica para alternar modo compacto:
          // setIsCompact((s) => !s); // Descomente se usar o estado `isCompact`
          console.log("Compact mode toggled");
        }}
      />
      
      {/* Container do Conteúdo Principal (Navbar + Main) */}
      <div className="flex-1 flex flex-col overflow-hidden"> 
        
        {/* Navbar (sempre visível no topo, não rola) */}
        <ProfNavbar onToggleSidebar={() => setSidebarOpen((s) => !s)} />
        
        {/* Conteúdo Principal */}
        {/* ✅ MUDANÇA 2: Adicionar 'overflow-y-auto' para permitir que apenas esta área role 
             se o conteúdo for maior que o espaço disponível. */}
        <main className="flex-1 p-6 md:pl-7 overflow-y-auto">
          <ToastProvider>
            <Outlet />
          </ToastProvider>
        </main>
      </div>
    </div>
  );
}