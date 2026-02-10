import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { Link } from 'react-router-dom';
import { 
  Cpu, 
  Search, 
  ArrowLeft, 
  Package, 
  ExternalLink, 
  LayoutGrid, 
  Layers 
} from 'lucide-react';

interface MaterialCard {
  id: number;
  nome: string;
  numero_serie?: string | null;
  modelo?: string | null;
  fabricante?: string | null;
  foto?: string | null;
}

export default function AllMaterials() {
  const [materiais, setMateriais] = useState<MaterialCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(24);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const resp = await api.get('/materiais', { params: { page, limit } });
        if (!mounted) return;
        // API agora retorna { items, meta }
        const items = resp?.data?.items ?? [];
        const meta = resp?.data?.meta ?? {};
        const normalized = items.map((r: any) => ({
          id: r.id,
          nome: r.nome || r.nome_material || '—',
          numero_serie: r.numero_serie ?? null,
          modelo: r.modelo ?? null,
          fabricante: r.fabricante ?? null,
          foto: r.foto ?? null,
        }));
        setMateriais(normalized);
        setTotal(Number(meta.total || 0));
        setTotalPages(Number(meta.totalPages || 1));
        setPage(Number(meta.page || page));
      } catch (err: any) {
        setError(err?.response?.data?.error || err?.message || 'Erro ao carregar materiais');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [page, limit]);

  // Filtro em tempo real
  const filteredMaterials = materiais.filter(m => 
    m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.numero_serie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.fabricante?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="mb-4"
      >
        <Layers className="w-12 h-12 text-sky-500" />
      </motion.div>
      <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Sincronizando inventário...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-20">
      {/* Background Decorativo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Profissional */}
        <header className="py-8 md:py-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-sky-600 transition-colors mb-6 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Voltar ao Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight dark:text-white">
                Materiais <span className="text-sky-600">Disponíveis</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Consulte e gerencie o catálogo técnico de equipamentos.</p>
            </div>

            {/* Barra de Busca Estilizada */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por nome, série..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-sky-500 transition-all outline-none text-sm"
              />
            </div>
          </div>
        </header>

        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-6 rounded-3xl text-center">
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          </div>
        ) : (
          <>
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode='popLayout'>
              {filteredMaterials.map((m, index) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group bg-white dark:bg-gray-800 rounded-[2rem] p-4 shadow-sm hover:shadow-xl hover:shadow-sky-500/10 transition-all border border-transparent hover:border-sky-100 dark:hover:border-sky-900/50 flex flex-col"
                >
                  {/* Container da Imagem */}
                  <div className="relative aspect-[4/3] bg-gray-50 dark:bg-gray-900/50 rounded-2xl mb-4 overflow-hidden flex items-center justify-center p-4">
                    {m.foto ? (
                      <img src={m.foto} alt={m.nome} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <Package size={40} className="text-gray-300 dark:text-gray-700" />
                    )}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-2 rounded-xl shadow-sm">
                        <Cpu size={16} className="text-sky-600" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 px-1">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-sky-600 dark:text-sky-400 mb-1 block">
                      {m.fabricante || 'Fabricante N/A'}
                    </span>
                    <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-1 group-hover:text-sky-600 transition-colors">
                      {m.nome}
                    </h3>
                    
                    <div className="space-y-1.5 mb-6">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Nº Série</span>
                        <span className="font-mono font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                          {m.numero_serie || '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Modelo</span>
                        <span className="text-gray-600 dark:text-gray-300 truncate max-w-[120px]">
                          {m.modelo || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botão de Ação */}
                  <Link 
                    to={`/ver/${encodeURIComponent(String(m.numero_serie ?? String(m.id)))}`}
                    className="w-full flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-sky-600 hover:text-white dark:hover:bg-sky-600 py-3 rounded-xl font-bold text-sm transition-all group/btn"
                  >
                    Detalhes Completos
                    <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Pagination Controls */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm disabled:opacity-40"
            >Prev</button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                // center page buttons around current page
                const half = Math.floor(Math.min(totalPages,7) / 2);
                let start = Math.max(1, page - half);
                if (start + 6 > totalPages) start = Math.max(1, totalPages - 6);
                const pnum = start + i;
                if (pnum > totalPages) return null;
                return (
                  <button
                    key={pnum}
                    onClick={() => setPage(pnum)}
                    className={`px-3 py-2 rounded-lg ${pnum === page ? 'bg-sky-600 text-white' : 'bg-white dark:bg-gray-800'}`}
                  >{pnum}</button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm disabled:opacity-40"
            >Next</button>
          </div>
          </>
        )}

        {/* Empty State */}
        {!loading && filteredMaterials.length === 0 && (
          <div className="py-20 text-center">
            <LayoutGrid size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhum material encontrado com "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
}