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
      const res = await api.get('/materiais');
      if (Array.isArray(res.data)) {
        const normalized = res.data.map((r:any) => ({
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

  useEffect(() => { reloadMateriais(); }, []);

  // (Empréstimo/beneficiário removido) – lista de usuários não mais carregada aqui


  // Lógica de Filtragem e Busca (sem alteração)
  const filteredMateriais = useMemo(() => {
    return materiais.filter(material => {
      const matchesSearch = (material.nome_material || '').toLowerCase().includes(searchTerm.toLowerCase()) || (material.descricao || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'Todos' || (material.nome_tipo || '—') === filterType;
      return matchesSearch && matchesType;
    });
  }, [materiais, searchTerm, filterType]);

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
                  placeholder="Buscar por nome ou descrição..."
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Lista de Materiais ({filteredMateriais.length})</h2>
              
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
                  Nenhum material encontrado com os filtros aplicados.
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
                          onClick={() => { setSelectedMaterial(m); setIsEditing(false); setFormState(null); }}
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
                              <motion.button title="Ver Detalhes" className="p-2 text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 transition" whileHover={{ scale: 1.15 }} onClick={(ev)=>{ ev.stopPropagation(); setSelectedMaterial(m); setIsEditing(false); setFormState(null); }}><Eye className="w-5 h-5" /></motion.button>
                              
                              {/* ATUALIZAÇÃO: Inicialização do empForm */}
                              {/* Empréstimo removed per request */}
                              
                              <motion.button title="Editar Informações" className="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition" whileHover={{ scale: 1.15 }} onClick={(ev)=>{ ev.stopPropagation(); setSelectedMaterial(m); setIsEditing(true); setFormState({ ...m }); }}><Edit className="w-5 h-5" /></motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </motion.tbody>
                </table>
              )}
            </motion.div>

            {/* Modal de Detalhes / Edição de Material */}
            <AnimatePresence>
              {selectedMaterial && (
                <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="absolute inset-0 bg-black/50" onClick={() => { setSelectedMaterial(null); setFormState(null); setIsEditing(false); }} />
                              <motion.div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full p-6 z-10 shadow-2xl" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start space-x-4">
                        {selectedMaterial.foto ? (
                          <img src={selectedMaterial.foto} alt={selectedMaterial.nome_material} className="w-20 h-20 rounded-md object-cover bg-gray-100 dark:bg-gray-700" />
                        ) : (
                          <div className="w-20 h-20 rounded-md flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-blue-600"><Package className="w-8 h-8" /></div>
                        )}
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedMaterial.nome_material}</h2>
                          <div className="text-sm text-gray-500 dark:text-gray-400">ID: {selectedMaterial.id} • Tipo: {selectedMaterial.nome_tipo ?? '—'}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 text-sm bg-gray-200 rounded" onClick={() => { setIsEditing(s => !s); setFormState(s => s ? { ...s } : null); }}>{isEditing ? 'Visualizar' : 'Editar'}</button>
                        <button className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded" onClick={() => { setSelectedMaterial(null); setFormState(null); setIsEditing(false); }}>Fechar</button>
                      </div>
                    </div>

                    {/* Conteúdo / Form */}
                    {!isEditing ? (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedMaterial.infor_ad || selectedMaterial.descricao || '—'}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-sm text-gray-500">Número de Série</div>
                          <div className="text-sm text-gray-900">{selectedMaterial.numero_serie ?? '—'}</div>
                          <div className="text-sm text-gray-500">Modelo</div>
                          <div className="text-sm text-gray-900">{selectedMaterial.modelo ?? '—'}</div>
                          <div className="text-sm text-gray-500">Fabricante</div>
                          <div className="text-sm text-gray-900">{selectedMaterial.fabricante ?? '—'}</div>
                          <div className="text-sm text-gray-500">Data Fabrico</div>
                          <div className="text-sm text-gray-900">{selectedMaterial.data_fabrico ? new Date(selectedMaterial.data_fabrico).toLocaleDateString() : '—'}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
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

                        <div className="flex justify-end space-x-2">
                          <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => { setIsEditing(false); setFormState(null); }}>Cancelar</button>
                          <button className="px-4 py-2 bg-sky-600 text-white rounded" onClick={async ()=>{
                            if (!formState) return;
                            try {
                              const payload:any = {};
                              if (formState.nome_material !== undefined) payload.nome = formState.nome_material;
                              if (formState.numero_serie !== undefined) payload.numero_serie = formState.numero_serie;
                              if (formState.modelo !== undefined) payload.modelo = formState.modelo;
                              if (formState.fabricante !== undefined) payload.fabricante = formState.fabricante;
                              if (formState.data_fabrico !== undefined) payload.data_fabrico = formState.data_fabrico;
                              if (formState.infor_ad !== undefined) payload.infor_ad = formState.infor_ad;
                              if (formState.perfil_fabricante !== undefined) payload.perfil_fabricante = formState.perfil_fabricante;
                              if (formState.foto !== undefined) payload.foto = formState.foto;
                              if (formState.pdf !== undefined) payload.pdf = formState.pdf;
                              await api.put(`/materiais/${encodeURIComponent(selectedMaterial.id)}`, payload);
                              // Atualiza localmente
                              await reloadMateriais();
                              setSelectedMaterial(null);
                              setFormState(null);
                              setIsEditing(false);
                            } catch (err:any) {
                              console.error('Erro ao salvar material', err);
                              try { toast.showToast('Erro ao salvar material: ' + (err?.response?.data?.error || err?.message || ''), 'error'); } catch(e){}
                            }
                          }}>Salvar</button>
                        </div>
                      </div>
                    )}
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