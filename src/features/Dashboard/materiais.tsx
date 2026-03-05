import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import {
  Search,
  Package,
  Gauge,
  FlaskConical,
  Book,
  CheckCircle,
  Clock,
  Wrench,
  AlertTriangle,
  Eye,
  Send,
  Edit,
  LucideIcon,
  FileText,
  Box,
  Calendar,
  Server,
  ShieldCheck,
} from 'lucide-react';
import api from '../../api';
import { useToast } from '../../components/ToastContext';
import { useNavigate } from 'react-router-dom';

// === TIPAGEM E DADOS MOCKADOS ===

type MaterialType = string;

interface Material {
  id: number;
  // Core DB columns (init_db.sql)
  nome_material: string; // maps to `nome` in DB
  numero_serie?: string | null;
  modelo?: string | null;
  fabricante?: string | null;
  data_fabrico?: string | null;
  infor_ad?: string | null;
  perfil_fabricante?: string | null;
  foto?: string | null; // base64 or data URL
  pdf?: string | null; // base64 or data URL
  created_at?: string | null;
  // legacy / UI helpers
  code_id?: string | null;
  nome_tipo?: string | null;
  id_tipo_material?: number | null;
  descricao?: string | null;
}


const typeIcons: Record<MaterialType, LucideIcon> = {
  Eletrônico: Package,
  Mecânico: Gauge,
  Didático: Book,
  Químico: FlaskConical,
};

// Variantes de Animação para a entrada em cascata (Staggered Fade-in)
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1, // Atraso entre os elementos filhos
            duration: 0.3
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

// === COMPONENTE PRINCIPAL ===

export default function MateriaisProfPage() {
  // helper: read file as data URL for foto upload
  const readFileAsDataURL = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

  // Helper para contar campos em FormData (compatível com iterador)
  const countFormDataFields = (formData: FormData): number => {
    let count = 0;
    try {
      for (const _ of formData.entries()) {
        count++;
      }
    } catch(e) {}
    return count;
  };

  const toLocalDateTimeInput = (dt: Date) => {
    const pad = (n:number) => n.toString().padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  };

  const toISOStringFromLocalInput = (val?: string | null) => {
    if (!val) return null;
    const d = new Date(val);
    return d.toISOString();
  };

  const formatDateOnly = (val?: string | null) => {
    if (!val) return null;
    const d = new Date(val);
    const pad = (n:number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string | 'Todos'>('Todos');

  // paginação (para pesquisa em servidor)
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(50);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<Partial<Material> | null>(null);

  const reloadMateriais = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page, limit };
      if (searchTerm) params.search = searchTerm;
      if (filterType && filterType !== 'Todos') {
        params.fabricante = filterType;
      }
      const res = await api.get('/materiais', { params });
      // Support both legacy array response and new { items, meta } shape
      const dataArray = Array.isArray(res.data)
        ? res.data
        : (Array.isArray(res.data?.items) ? res.data.items : []);
      if (Array.isArray(dataArray)) {
        const normalized = dataArray.map((r:any) => ({
          id: Number(r.id),
          // DB fields
          nome_material: r.nome || r.nome_material || '—',
          numero_serie: r.numero_serie ?? null,
          modelo: r.modelo ?? null,
          fabricante: r.fabricante ?? null,
          data_fabrico: r.data_fabrico ?? null,
          infor_ad: r.infor_ad ?? null,
          perfil_fabricante: r.perfil_fabricante ?? null,
          foto: r.foto || null,
          pdf: r.pdf || r.pdf_url || null,
          created_at: r.created_at || null,
          // legacy/UI helpers
          code_id: r.code_id || null,
          nome_tipo: r.nome_tipo || null,
          id_tipo_material: r.id_tipo_material ?? null,
          descricao: r.descricao ?? r.infor_ad ?? null,
        } as Material));
        setMateriais(normalized);
        // atualizar paginação se meta estiver presente
        if (res.data?.meta) {
          setTotal(Number(res.data.meta.total || 0));
          setTotalPages(Number(res.data.meta.totalPages || 1));
          setPage(Number(res.data.meta.page || page));
        }
      } else {
        setMateriais([]);
      }
    } catch (err:any) {
      console.error('Erro ao carregar materiais', err);
      setError(err?.response?.data?.error || err?.message || 'Erro ao carregar materiais');
      try { toast.showToast('Erro ao carregar materiais: ' + (err?.response?.data?.error || err?.message || ''), 'error'); } catch(e){}
    } finally {
      setLoading(false);
    }
  };

  // Busca completo de material por id (carrega foto/pdf somente quando necessário)
  const fetchMaterialById = async (id: number) => {
    try {
      const res = await api.get(`/materiais/${encodeURIComponent(String(id))}`);
      return res.data;
    } catch (err:any) {
      console.error('Erro ao buscar material por id', err);
      try { toast.showToast('Erro ao carregar detalhes do material', 'error'); } catch(e){}
      return null;
    }
  };

  // carrega a cada mudança de pesquisa, filtro ou página
  useEffect(() => { reloadMateriais(); }, [searchTerm, filterType, page, limit]);

  // reset page ao mudar pesquisa ou filtro
  useEffect(() => { setPage(1); }, [searchTerm, filterType]);

  // (Empréstimo/beneficiário removido) – lista de usuários não mais carregada aqui


  // Lógica de Filtragem por fabricante somente (busca SQL é feita no servidor)
  const filteredMateriais = useMemo(() => {
    if (filterType && filterType !== 'Todos') {
      return materiais.filter(material => (material.fabricante || '') === filterType);
    }
    return materiais;
  }, [materiais, filterType]);

  // Renderiza a lista de filtros de forma elegante (sem alteração)
  const renderFilterButtons = (label: string, options: string[], currentFilter: string, setFilter: (val: any) => void) => (
    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}:</span>
      <div className="flex flex-wrap gap-2">
        {['Todos', ...options.filter(Boolean) as string[]].map(option => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`
              px-3 py-1 text-xs rounded-full transition-all duration-200
              ${currentFilter === option
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }
            `}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  // Filtragem por fabricante (substitui filtro por tipo)
  const availableTypes = useMemo(() => Array.from(new Set(materiais.map(m => m.fabricante).filter(Boolean))), [materiais]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* Container principal com animação de entrada */}
      <motion.main 
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Gestão de Materiais
        </h1>

        {/* NOVO BOTÃO: Cadastrar Material (Item animado) */}
        <motion.button 
          variants={itemVariants} 
          onClick={() => navigate('/dashboard/cadastro-material')}
            className="mb-6 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200 flex items-center space-x-2"
            whileHover={{ scale: 1.05 }} 
        >
            <Package className="w-5 h-5" />
            <span>Cadastrar Material</span>
        </motion.button>
        {/* FIM NOVO BOTÃO */}

        <div className="space-y-8">
            
            {/* 1. Seção de Filtros e Busca (Item animado) */}
            <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg space-y-4"
                variants={itemVariants}
                whileHover={{ y: -2 }} // Efeito sutil de levantar no hover
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Busca e Filtragem</h2>
              
              {/* Barra de Busca (sem animação para manter o foco) */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou descrição (pesquisa completa)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Controles de Filtro */}
                <div className="space-y-4 pt-2">
                {renderFilterButtons(
                  "Fabricante",
                  availableTypes as string[],
                  filterType,
                  setFilterType
                )}
              </div>
            </motion.div>

            {/* 2. Tabela/Lista de Materiais (Item animado) */}
            <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg overflow-x-auto"
                variants={itemVariants}
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Lista de Materiais ({total > 0 ? total : filteredMateriais.length})
              </h2>
              
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                    </div>
                  ))}
                </div>
              ) : filteredMateriais.length === 0 ? (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? `Nenhum material encontrado para "${searchTerm}".`
                    : 'Nenhum material encontrado com os filtros aplicados.'}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Número de Série</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Modelo</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Criado em</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Ficha (PDF)</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <motion.tbody 
                    className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                    // Animação da Tabela: Sem variants aqui, mas com whileHover nas linhas
                  >
                    {filteredMateriais.map(m => {
                      return (
                        <motion.tr 
                          key={m.id} 
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 cursor-pointer"
                          whileHover={{ scale: 1.01, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                          onClick={async () => { 
                            const full = await fetchMaterialById(m.id);
                            setSelectedMaterial(full || m);
                            setIsEditing(false);
                            setFormState(null);
                          }}
                        >
                          
                          {/* Coluna 1: Material e ID */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              {m.foto ? (
                                <img
                                  src={m.foto}
                                  alt={m.nome_material}
                                  onError={(e:any) => { e.currentTarget.onerror = null; e.currentTarget.src = ''; }}
                                  className="w-8 h-8 rounded-md object-cover bg-gray-100 dark:bg-gray-700 flex-shrink-0"
                                />
                              ) : (
                                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                              )}
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white underline">{m.nome_material}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Código: {m.code_id ?? m.id}</div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Coluna 2: Tipo (Oculta em telas muito pequenas) */}
                          <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                            <div className="text-sm text-gray-700 dark:text-gray-300">{m.numero_serie ?? '—'}</div>
                          </td>
                          
                          {/* Coluna 3: Código (visible on sm+) */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center hidden sm:table-cell">
                            <div className="text-gray-700 dark:text-gray-300">{m.modelo ?? '—'}</div>
                          </td>
                          
                          {/* Coluna 4: Criado em */}
                          <td className="px-6 py-4 whitespace-nowrap text-center hidden sm:table-cell">
                            <div className="text-gray-700 dark:text-gray-300 text-sm">{m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}</div>
                          </td>

                          {/* Coluna PDF: mostra link se disponível */}
                          <td className="px-6 py-4 whitespace-nowrap text-center hidden sm:table-cell">
                            {m.pdf ? (
                              <a href={m.pdf} target="_blank" rel="noreferrer" className="text-sky-600 hover:text-sky-800 underline text-sm">Ver PDF</a>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          
                          {/* Coluna 5: Ações */}
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="flex justify-center space-x-2">
                              <motion.button title="Ver Detalhes" className="p-2 text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 transition" whileHover={{ scale: 1.15 }} onClick={async (ev)=>{ ev.stopPropagation(); const full = await fetchMaterialById(m.id); setSelectedMaterial(full || m); setIsEditing(false); setFormState(null); }}><Eye className="w-5 h-5" /></motion.button>
                              
                              {/* ATUALIZAÇÃO: Inicialização do empForm */}
                              {/* Empréstimo removed per request */}
                              
                              <motion.button title="Editar Informações" className="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition" whileHover={{ scale: 1.15 }} onClick={async (ev)=>{ ev.stopPropagation(); const full = await fetchMaterialById(m.id); setSelectedMaterial(full || m); setIsEditing(true); setFormState({ ...(full || m) }); }}><Edit className="w-5 h-5" /></motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </motion.tbody>
                </table>
              )}
            </motion.div>

            {/* Pagination Controls similar ao AllMaterials */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm disabled:opacity-40"
                >Prev</button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
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
            )}

            {/* Modal de Detalhes / Edição de Material */}
            <AnimatePresence>
              {selectedMaterial && (
                <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setSelectedMaterial(null); setFormState(null); setIsEditing(false); }}>
                  <motion.div className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-auto z-10 shadow-2xl" initial={{ y: 20, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()}>
                    
                    {/* Header Modal */}
                    <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
                      <div className="flex items-start space-x-4 flex-1">
                        {selectedMaterial.foto ? (
                          <img src={selectedMaterial.foto} alt={selectedMaterial.nome_material} className="w-16 h-16 rounded-lg object-cover bg-gray-100 dark:bg-gray-700 flex-shrink-0" />
                        ) : (
                          <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-blue-600 flex-shrink-0"><Package className="w-8 h-8" /></div>
                        )}
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedMaterial.nome_material}</h2>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                              <ShieldCheck size={14} /> SN: {selectedMaterial.numero_serie || 'N/A'}
                            </span>
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                              <Box size={14} /> {selectedMaterial.modelo || 'Modelo padrão'}
                            </span>
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                              <Calendar size={14} /> {selectedMaterial.created_at ? new Date(selectedMaterial.created_at).toLocaleDateString() : 'Sem data'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!isEditing && (
                          <motion.button title="Editar" className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 dark:text-indigo-400 rounded-lg transition" whileHover={{ scale: 1.1 }} onClick={() => { setIsEditing(true); setFormState({ ...selectedMaterial }); }}>
                            <Edit className="w-5 h-5" />
                          </motion.button>
                        )}
                        <button className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition" onClick={() => { setSelectedMaterial(null); setFormState(null); setIsEditing(false); }}>Fechar</button>
                      </div>
                    </div>

                    {/* Conteúdo Modal */}
                    <div className="p-8">
                    {!isEditing ? (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Coluna Imagem (Esquerda) */}
                        <div className="lg:col-span-5">
                          <div className="sticky top-32 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 overflow-hidden flex items-center justify-center" style={{ aspectRatio: '1' }}>
                            {selectedMaterial.foto ? (
                              <motion.img 
                                whileHover={{ scale: 1.05 }}
                                src={selectedMaterial.foto} 
                                alt={selectedMaterial.nome_material} 
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-3 text-gray-400">
                                <Box size={48} strokeWidth={1} />
                                <span className="text-sm font-medium">Imagem indisponível</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Coluna Informações (Direita) */}
                        <div className="lg:col-span-7 space-y-6">
                          {/* Informações Adicionais */}
                          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                            <h3 className="text-xs uppercase tracking-widest font-black text-sky-600 dark:text-sky-400 mb-3">Informações Adicionais</h3>
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                              {selectedMaterial.infor_ad || "Nenhuma descrição adicional informada para este item."}
                            </p>
                          </motion.section>

                          {/* Sobre o Fabricante */}
                          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                            <h3 className="text-xs uppercase tracking-widest font-black text-sky-600 dark:text-sky-400 mb-4">Sobre o Fabricante</h3>
                            <div className="flex items-start gap-4">
                              <div className="mt-1 bg-sky-100 dark:bg-sky-900/30 p-3 rounded-lg text-sky-600 dark:text-sky-400 flex-shrink-0">
                                <Server size={20} />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-800 dark:text-gray-200">{selectedMaterial.fabricante || "Fabricante Desconhecido"}</h4>
                                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed">
                                  {selectedMaterial.perfil_fabricante || "Detalhes do fabricante não disponíveis."}
                                </p>
                              </div>
                            </div>
                          </motion.section>

                          {/* Especificações Técnicas */}
                          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                            <h3 className="text-xs uppercase tracking-widest font-black text-sky-600 dark:text-sky-400 mb-4">Especificações</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Número de Série</div>
                                <div className="text-sm font-mono text-gray-900 dark:text-gray-100">{selectedMaterial.numero_serie ?? '—'}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Modelo</div>
                                <div className="text-sm text-gray-900 dark:text-gray-100">{selectedMaterial.modelo ?? '—'}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Data de Fabrico</div>
                                <div className="text-sm text-gray-900 dark:text-gray-100">{selectedMaterial.data_fabrico ? new Date(selectedMaterial.data_fabrico).toLocaleDateString('pt-PT') : '—'}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Criado em</div>
                                <div className="text-sm text-gray-900 dark:text-gray-100">{selectedMaterial.created_at ? new Date(selectedMaterial.created_at).toLocaleDateString('pt-PT') : '—'}</div>
                              </div>
                            </div>
                          </motion.section>

                          {/* PDF Link */}
                          {selectedMaterial.pdf && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                <span className="text-sm font-medium text-indigo-900 dark:text-indigo-300">Ficha Técnica PDF</span>
                              </div>
                              <a href={selectedMaterial.pdf} target="_blank" rel="noreferrer" className="px-3 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                                Abrir
                              </a>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="max-h-[60vh] overflow-y-auto pr-4">
                        <div>
                          <label className="text-sm text-gray-500">Nome</label>
                          <input className="w-full p-2 mt-1 rounded border" value={formState?.nome_material ?? selectedMaterial.nome_material ?? ''} onChange={(e)=> setFormState(s => ({ ...(s||{}), nome_material: e.target.value }))} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm text-gray-500">Número de Série</label>
                            <input className="w-full p-2 mt-1 rounded border" value={formState?.numero_serie ?? (selectedMaterial.numero_serie ?? '')} onChange={(e)=> setFormState(s => ({ ...(s||{}), numero_serie: e.target.value }))} />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Modelo</label>
                            <input className="w-full p-2 mt-1 rounded border" value={formState?.modelo ?? (selectedMaterial.modelo ?? '')} onChange={(e)=> setFormState(s => ({ ...(s||{}), modelo: e.target.value }))} />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm text-gray-500">Fabricante</label>
                          <input className="w-full p-2 mt-1 rounded border" value={formState?.fabricante ?? (selectedMaterial.fabricante ?? '')} onChange={(e)=> setFormState(s => ({ ...(s||{}), fabricante: e.target.value }))} />
                        </div>

                        <div>
                          <label className="text-sm text-gray-500">Data de Fabrico</label>
                          <input type="date" className="w-full p-2 mt-1 rounded border" value={formState?.data_fabrico ?? (selectedMaterial.data_fabrico ?? '')} onChange={(e)=> setFormState(s => ({ ...(s||{}), data_fabrico: e.target.value }))} />
                        </div>

                        <div>
                          <label className="text-sm text-gray-500">Informações Adicionais</label>
                          <textarea className="w-full p-2 mt-1 rounded border" rows={4} value={formState?.infor_ad ?? (selectedMaterial.infor_ad ?? '')} onChange={(e)=> setFormState(s => ({ ...(s||{}), infor_ad: e.target.value }))} />
                        </div>

                        <div>
                          <label className="text-sm text-gray-500">Perfil do Fabricante</label>
                          <textarea className="w-full p-2 mt-1 rounded border" rows={3} value={formState?.perfil_fabricante ?? (selectedMaterial.perfil_fabricante ?? '')} onChange={(e)=> setFormState(s => ({ ...(s||{}), perfil_fabricante: e.target.value }))} />
                        </div>

                        <div>
                          <label className="text-sm text-gray-500">Foto</label>
                          <input type="file" accept="image/*" className="w-full mt-1" onChange={async (e) => {
                            const file = e.currentTarget.files?.[0];
                            if (!file) return;
                            try {
                              const dataUrl = await readFileAsDataURL(file);
                              setFormState(s => ({ ...(s||{}), foto: dataUrl }));
                            } catch(err) {
                              console.error('Erro ao ler arquivo', err);
                              try { toast.showToast('Não foi possível ler a imagem selecionada', 'error'); } catch(e){}
                            }
                          }} />
                          {(formState?.foto || selectedMaterial.foto) && (
                            <div className="mt-2">
                              <img src={formState?.foto ?? selectedMaterial.foto ?? ''} alt="preview" className="w-40 h-28 object-cover rounded" onError={(e:any)=>{ e.currentTarget.onerror=null; e.currentTarget.src=''; }} />
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-sm text-gray-500">Ficha (PDF)</label>
                          <input type="file" accept="application/pdf" className="w-full mt-1" onChange={async (e) => {
                            const file = e.currentTarget.files?.[0];
                            if (!file) return;
                            try {
                              const dataUrl = await readFileAsDataURL(file);
                              setFormState(s => ({ ...(s||{}), pdf: dataUrl }));
                            } catch(err) {
                              console.error('Erro ao ler PDF', err);
                              try { toast.showToast('Não foi possível ler o PDF selecionado', 'error'); } catch(e){}
                            }
                          }} />
                          {(formState?.pdf || selectedMaterial.pdf) && (
                            <div className="mt-2">
                              <a className="text-sky-600 underline" href={formState?.pdf ?? selectedMaterial.pdf ?? '#'} target="_blank" rel="noreferrer">Abrir Ficha PDF</a>
                            </div>
                          )}
                        </div>

                        </div>
                        <div className="flex justify-between items-center sticky bottom-0 bg-white dark:bg-gray-800 p-4 rounded-b-xl mt-4">
                          <div className="text-xs text-gray-500">Campos salvos são aplicados à tabela `materiais`.</div>
                          <div className="flex items-center gap-2">
                            <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => { setIsEditing(false); setFormState(null); }}>Cancelar</button>
                            <button className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!formState} onClick={async (btn)=>{
                              if (!formState) return;
                              btn.currentTarget.disabled = true;
                              try {
                                // Prepara FormData para suportar arquivo
                                const formData = new FormData();
                                
                                // Adiciona campos de texto (apenas se modificados)
                                if (formState.nome_material !== undefined && formState.nome_material !== selectedMaterial.nome_material) {
                                  formData.append('nome', String(formState.nome_material));
                                  console.log('[FORM] Modificado: nome_material');
                                }
                                if (formState.numero_serie !== undefined && formState.numero_serie !== selectedMaterial.numero_serie) {
                                  formData.append('numero_serie', String(formState.numero_serie || ''));
                                  console.log('[FORM] Modificado: numero_serie');
                                }
                                if (formState.modelo !== undefined && formState.modelo !== selectedMaterial.modelo) {
                                  formData.append('modelo', String(formState.modelo || ''));
                                  console.log('[FORM] Modificado: modelo');
                                }
                                if (formState.fabricante !== undefined && formState.fabricante !== selectedMaterial.fabricante) {
                                  formData.append('fabricante', String(formState.fabricante || ''));
                                  console.log('[FORM] Modificado: fabricante');
                                }
                                if (formState.data_fabrico !== undefined && formState.data_fabrico !== selectedMaterial.data_fabrico) {
                                  formData.append('data_fabrico', String(formState.data_fabrico || ''));
                                  console.log('[FORM] Modificado: data_fabrico');
                                }
                                if (formState.infor_ad !== undefined && formState.infor_ad !== selectedMaterial.infor_ad) {
                                  formData.append('infor_ad', String(formState.infor_ad || ''));
                                  console.log('[FORM] Modificado: infor_ad');
                                }
                                if (formState.perfil_fabricante !== undefined && formState.perfil_fabricante !== selectedMaterial.perfil_fabricante) {
                                  formData.append('perfil_fabricante', String(formState.perfil_fabricante || ''));
                                  console.log('[FORM] Modificado: perfil_fabricante');
                                }

                                // Se foto foi modificada (novo arquivo ou removido)
                                if (formState.foto !== selectedMaterial.foto) {
                                  if (formState.foto && formState.foto.startsWith('data:')) {
                                    // Conversão de data URL para Blob para envio
                                    const response = await fetch(formState.foto);
                                    const blob = await response.blob();
                                    formData.append('foto', blob, 'foto.jpg');
                                    console.log('[FORM] Adicionado arquivo: foto');
                                  } else if (!formState.foto) {
                                    formData.append('foto', '');
                                    console.log('[FORM] Removido: foto');
                                  }
                                }

                                // Se PDF foi modificado
                                if (formState.pdf !== selectedMaterial.pdf) {
                                  if (formState.pdf && formState.pdf.startsWith('data:')) {
                                    const response = await fetch(formState.pdf);
                                    const blob = await response.blob();
                                    formData.append('pdf', blob, 'ficha.pdf');
                                    console.log('[FORM] Adicionado arquivo: pdf');
                                  } else if (!formState.pdf) {
                                    formData.append('pdf', '');
                                    console.log('[FORM] Removido: pdf');
                                  }
                                }

                                // Se nenhum campo foi modificado
                                if (countFormDataFields(formData) === 0) {
                                  try { toast.showToast('Nenhuma alteração detectada', 'info'); } catch(e){}
                                  return;
                                }

                                console.log(`[SAVE] Enviando ${countFormDataFields(formData)} campos para /materiais/${selectedMaterial.id}`);

                                // Envia com PUT
                                const response = await api.put(`/materiais/${encodeURIComponent(String(selectedMaterial.id))}`, formData, {
                                  headers: {
                                    'Content-Type': 'multipart/form-data',
                                  }
                                });

                                console.log('[SAVE] Sucesso:', response.data);

                                // Atualiza localmente
                                await reloadMateriais();
                                setSelectedMaterial(null);
                                setFormState(null);
                                setIsEditing(false);
                                try { toast.showToast('Material atualizado com sucesso', 'success'); } catch(e){}
                              } catch (err:any) {
                                console.error('[SAVE] Erro:', err);
                                const errorMsg = err?.response?.data?.error || err?.message || 'Erro desconhecido';
                                console.error('[SAVE] Status:', err?.response?.status, 'Message:', errorMsg);
                                try { toast.showToast('❌ ' + errorMsg, 'error'); } catch(e){}
                              } finally {
                                btn.currentTarget.disabled = false;
                              }
                            }}>Salvar Alterações</button>
                          </div>
                        </div>
                      </div>
                    )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empréstimo feature removed */}

            {/* 3. Notificações e Insights (Item animado e Ícone com pulso) */}
            

          </div>
      </motion.main>
    </div>
  );
}