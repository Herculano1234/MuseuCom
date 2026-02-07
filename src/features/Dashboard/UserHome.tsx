import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion'; // Importação essencial para animações avançadas
import {
  Users,
  PlayCircle,
  FileText,
  Package,
  
  BarChart,
  PieChart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// === TIPAGEM ===

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  Icon: LucideIcon; 
  color: string;
  action: string;
  link: string;
}


// Estado dinâmico: vamos buscar do backend via `api.ts`
import api from '../../api';

// Estado inicial simples — os dados reais chegam via chamadas HTTP
const initialIndicators: StatCardProps[] = [];

// Obs: removemos o bloco de "Alertas Pendentes" — mantemos apenas indicadores

// Componente Card com Animações (motion.a)
const StatCard: React.FC<StatCardProps> = ({ 
    title, 
    value, 
    description, 
    Icon, 
    color, 
    action, 
    link 
}) => (
  <motion.a 
    href={link} 
    className={`
      bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg 
      border-t-4 ${color} 
      flex flex-col justify-between h-full
      transition duration-300 ease-in-out 
      hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700
      group relative overflow-hidden // Necessário para a animação interna
    `}
    // Animações de Hover
    whileHover={{ 
        scale: 1.03, // Efeito de Zoom
        transition: { duration: 0.2 } 
    }}
  >
    {/* Ícone Flutuante / Animado no Hover */}
    <motion.div
        className={`absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        initial={{ y: -50, x: 50, scale: 0.5 }}
        animate={{ rotate: 360 }} // Animação de rotação contínua (sutil)
        transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "linear" 
        }}
    >
        <Icon className={`w-10 h-10 ${color.replace('border', 'text')} opacity-10`} />
    </motion.div>

    <div className="flex justify-between items-start z-10">
      <div className="flex flex-col">
        <Icon className={`w-8 h-8 ${color.replace('border', 'text')}`} />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">{title}</p>
      </div>
      <h2 className="text-4xl font-bold text-gray-900 dark:text-white transition transform duration-300 group-hover:translate-x-1">{value}</h2>
    </div>
    <div className='mt-3 z-10'>
      <p className="text-xs text-gray-400 dark:text-gray-500 h-8">{description}</p>
      <div className={`mt-4 inline-flex items-center text-sm font-semibold ${color.replace('border', 'text')} transition duration-150`}>
        {action}
        <span className="ml-1 transition transform duration-200 group-hover:translate-x-1">→</span>
      </div>
    </div>
  </motion.a>
);

// Variantes para Animação de Entrada
const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            delayChildren: 0.1,
            staggerChildren: 0.15,
            duration: 0.5
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};


// Componente principal da Home
export default function UserHome() {
  const [professorName, setProfessorName] = useState<string>('Carregando...');
  const [indicators, setIndicators] = useState<StatCardProps[]>(initialIndicators);
  const [materialCount, setMaterialCount] = useState<number>(0);
  const [mostViewed, setMostViewed] = useState<{ nome: string; views: number | null } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        // 1) Buscar usuário autenticado (usa /me em vez de listar todos os usuários)
        try {
          const profRes = await api.get('/me');
          if (profRes && profRes.data) {
            const profData = profRes.data;
            if (profData) setProfessorName(profData.nome || profData.username || 'Museu');
          }
        } catch (e) {
          // se /me falhar, não interrompe carregamento dos demais dados
          console.warn('Falha ao obter /me, tentando fallback para /usuarios', e);
          const profRes = await api.get('/usuarios');
          const profData = Array.isArray(profRes.data) && profRes.data.length ? profRes.data[0] : null;
          if (profData) setProfessorName(profData.nome || profData.username || 'Museu');
        }

        // 2) Buscar dashboard (totais)
        const dashRes = await api.get('/dashboard');
        const dash = dashRes.data || {};

        

        // 4) Buscar materiais para contar e calcular o mais visto da semana (melhor esforço)
        let mats: any[] = [];
        try {
          const matsRes = await api.get('/materiais');
          mats = Array.isArray(matsRes.data) ? matsRes.data : [];
        } catch (e) {
          mats = [];
        }
        const matCount = mats.length;
        setMaterialCount(matCount);

        // Determina o material mais visto por heurística: procura chaves comuns
        if (mats.length > 0) {
          const sortKeys = ['views_week', 'visualizacoes_semana', 'views', 'visualizacoes'];
          let candidate: any = mats[0];
          for (const key of sortKeys) {
            const has = mats.some(m => m && (m[key] !== undefined && m[key] !== null));
            if (has) {
              candidate = mats.slice().sort((a,b) => Number(b[key]||0) - Number(a[key]||0))[0];
              setMostViewed({ nome: candidate.nome_material || candidate.nome || candidate.title || '—', views: Number(candidate[key] || 0) });
              break;
            }
          }
          if (!mostViewed) {
            // fallback: escolhe o primeiro material (sem contagem de views)
            const first = mats[0];
            setMostViewed({ nome: first.nome_material || first.nome || '—', views: null });
          }
        } else {
          setMostViewed(null);
        }

        // Monta indicadores a partir dos dados do backend
        const newIndicators: StatCardProps[] = [
          {
            title: 'Total de Usuários',
            value: Number(dash.total_usuarios ?? dash.total_estagiarios ?? 0),
            description: 'Usuários cadastrados no sistema.',
            Icon: Users,
            color: 'border-sky-600',
            action: 'Ver Lista',
            link: '/usuarios'
          },
          {
            title: 'Total de Materiais',
            value: Number(dash.total_materiais || 0),
            description: 'Itens catalogados no inventário.',
            Icon: PlayCircle,
            color: 'border-green-600',
            action: 'Ver Materiais',
            link: '/materiais'
          },
          // Complementamos com indicadores derivados localmente (ex.: relatórios pendentes)
         
        ];

        if (!mounted) return;
        setIndicators(newIndicators);
      } catch (err: any) {
        console.error('Erro ao carregar dados do ProfessorHome', err);
        console.error('Resposta do servidor:', err?.response?.data ?? err?.response);
        if (!mounted) return;
        const serverMsg = err?.response?.data?.error || err?.response?.data?.message || err?.response?.data || null;
        setError(serverMsg ? String(serverMsg) : (err?.message || 'Erro desconhecido'));
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    loadData();

    return () => { mounted = false; };
  }, []);

  return (
    // Usa motion.div para a animação de entrada geral (Fade-in Up)
    <motion.div 
        className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 sm:pt-10 lg:pt-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
      
      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto py-0 px-4 sm:px-6 lg:px-8">
        
        {/* Saudação */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Painel de Controle</h1>
        </div>

        {/* Top Cards: Quantidade de Materiais e Material Mais Visto da Semana */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Materiais Cadastrados</h3>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{loading ? '...' : materialCount}</div>
                <div className="text-xs text-gray-500">Total de materiais no inventário</div>
              </div>
              <Package className="w-10 h-10 text-sky-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Material Mais Visto (Semana)</h3>
            <div className="mt-3">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{mostViewed ? mostViewed.nome : (loading ? 'Carregando...' : 'Nenhum material')}</div>
              <div className="text-sm text-gray-500 mt-1">{mostViewed && mostViewed.views !== null ? `${mostViewed.views} visualizações esta semana` : 'Dados de visualizações não disponíveis'}</div>
            </div>
          </div>
        </div>


      </main>

      {/* Rodapé Institucional */}
      <footer className="bg-gray-100 dark:bg-gray-950 mt-12 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-xs text-gray-500 dark:text-gray-600 space-y-2 sm:space-y-0 sm:space-x-4">
            <span>© {new Date().getFullYear()}MuseuCom.</span>
            <span className="hidden sm:inline text-gray-400 dark:text-gray-700">|</span>
            <div className='inline-block sm:inline'>
                <a href="/privacidade" className="hover:text-gray-700 dark:hover:text-white transition px-2">Política de Privacidade</a>
                <span className="text-gray-400 dark:text-gray-700">|</span>
                <a href="/termos" className="hover:text-gray-700 dark:hover:text-white transition px-2">Termos de Uso</a>
                <span className="text-gray-400 dark:text-gray-700">|</span>
                <a href="/suporte" className="hover:text-gray-700 dark:hover:text-white transition px-2">Suporte Técnico</a>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}