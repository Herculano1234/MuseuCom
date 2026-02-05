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
  code_id?: string | null;
  nome_material: string;
  nome_tipo?: string | null; // joined from tipos_materiais.nome_tipo
  id_tipo_material?: number | null;
  descricao?: string | null;
  foto?: string | null;
  created_at?: string | null;
}

// NOVO TIPO: Adicionado para acomodar os dados do visitante e a seleção
interface VisitanteFormFields {
  id_beneficiario?: number | null; // Usado para controlar a seleção no dropdown (ID do usuário ou -1 para visitante)
  id_usuario?: number | null; // ID real do usuário (será null se for visitante)
  data_inicio?: string;
  data_final?: string | null;

  // Campos do VISITANTE (existirão se id_beneficiario for -1)
  nome_visitante?: string | null;
  genero_visitante?: 'Masculino' | 'Feminino' | string | null;
  numero_processo_visitante?: string | null;
  telefone_visitante?: string | null;
  email_visitante?: string | null;
  morada_visitante?: string | null;
  curso_visitante?: string | null;
  turma_visitante?: string | null;
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
          code_id: r.code_id || null,
          nome_material: r.nome_material || r.nome || '—',
          nome_tipo: r.nome_tipo || null,
          id_tipo_material: r.id_tipo_material ?? null,
          descricao: r.descricao ?? null,
          foto: r.foto || r.foto || null,
          created_at: r.created_at || null,
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

  // Load usuarios once for emprestimo modal
  const [usuariosList, setUsuariosList] = useState<Array<any>>([]);
  const [empModalOpen, setEmpModalOpen] = useState(false);
  // ESTADO ATUALIZADO para usar o novo tipo VisitanteFormFields
  const [empForm, setEmpForm] = useState<VisitanteFormFields | null>(null);
  
  // NOVO ESTADO: Termo de busca para a lista de beneficiários
  const [beneficiarioSearchTerm, setBeneficiarioSearchTerm] = useState('');

  useEffect(() => {
    async function loadUsuarios() {
      try {
        const res = await api.get('/usuarios');
        if (Array.isArray(res.data)) setUsuariosList(res.data);
      } catch (err) {
        console.warn('Não foi possível carregar usuários para empréstimo', err);
      }
    }
    loadUsuarios();
  }, []);
  
  // NOVA LÓGICA: Lista de Estagiários filtrada
    const filteredUsuariosList = useMemo(() => {
      if (!beneficiarioSearchTerm) {
        return usuariosList;
      }
      const lowerSearch = beneficiarioSearchTerm.toLowerCase();
      // Filtra por nome ou nome_completo
      return usuariosList.filter((u: any) =>
        (u.nome || u.nome_completo || `#${u.id}`).toLowerCase().includes(lowerSearch)
      );
    }, [usuariosList, beneficiarioSearchTerm]);


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

  const availableTypes = useMemo(() => Array.from(new Set(materiais.map(m => m.nome_tipo).filter(Boolean))), [materiais]);

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
            onClick={() => navigate('/cadastro-material')}
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
                  "Tipo",
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Tipo</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Código</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Criado em</th>
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
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              {m.nome_tipo ?? '—'}
                            </span>
                          </td>
                          
                          {/* Coluna 3: Código (visible on sm+) */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center hidden sm:table-cell">
                            <div className="text-gray-700 dark:text-gray-300">{m.code_id ?? m.id}</div>
                          </td>
                          
                          {/* Coluna 4: Criado em */}
                          <td className="px-6 py-4 whitespace-nowrap text-center hidden sm:table-cell">
                            <div className="text-gray-700 dark:text-gray-300 text-sm">{m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}</div>
                          </td>
                          
                          {/* Coluna 5: Ações */}
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="flex justify-center space-x-2">
                              <motion.button title="Ver Detalhes" className="p-2 text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 transition" whileHover={{ scale: 1.15 }} onClick={(ev)=>{ ev.stopPropagation(); setSelectedMaterial(m); setIsEditing(false); setFormState(null); }}><Eye className="w-5 h-5" /></motion.button>
                              
                              {/* ATUALIZAÇÃO: Inicialização do empForm */}
                              <motion.button title="Registrar Empréstimo" className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition" whileHover={{ scale: 1.15 }} onClick={(ev)=>{ 
                                ev.stopPropagation(); 
                                setSelectedMaterial(m); 
                                setEmpModalOpen(true); 
                                const now = new Date(); 
                                const defaultStart = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`; 
                                const defaultEnd = toLocalDateTimeInput(new Date(now.getTime()+60*60*1000)); 
                                
                                // Inicializa com id_beneficiario (para a seleção) e id_usuario
                                const initialUsuarioId = usuariosList?.[0]?.id ?? null;
                                setEmpForm({ 
                                  id_beneficiario: initialUsuarioId, 
                                  id_usuario: initialUsuarioId,
                                  data_inicio: defaultStart, 
                                  data_final: defaultEnd 
                                }); 
                                // Limpa o termo de busca do beneficiário
                                setBeneficiarioSearchTerm('');
                              }}>
                                <Send className="w-5 h-5" />
                              </motion.button>
                              
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
                        <p className="text-sm text-gray-700 dark:text-gray-300">{selectedMaterial.descricao || '—'}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-sm text-gray-500">Código</div>
                          <div className="text-sm text-gray-900">{selectedMaterial.code_id ?? selectedMaterial.id}</div>
                          <div className="text-sm text-gray-500">Tipo</div>
                          <div className="text-sm text-gray-900">{selectedMaterial.nome_tipo ?? '—'}</div>
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
                            <label className="text-sm text-gray-500">Código (code_id)</label>
                            <input className="w-full p-2 mt-1 rounded border" value={formState?.code_id ?? (selectedMaterial.code_id ?? '')} onChange={(e)=> setFormState(s => ({ ...(s||{}), code_id: e.target.value }))} />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Tipo (não editável)</label>
                            <input className="w-full p-2 mt-1 rounded border bg-gray-50 dark:bg-gray-700" disabled value={selectedMaterial.nome_tipo ?? (String(selectedMaterial.id_tipo_material) || '')} />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm text-gray-500">Descrição</label>
                          <textarea className="w-full p-2 mt-1 rounded border" rows={4} value={formState?.descricao ?? (selectedMaterial.descricao ?? '')} onChange={(e)=> setFormState(s => ({ ...(s||{}), descricao: e.target.value }))} />
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

                        <div className="flex justify-end space-x-2">
                          <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => { setIsEditing(false); setFormState(null); }}>Cancelar</button>
                          <button className="px-4 py-2 bg-sky-600 text-white rounded" onClick={async ()=>{
                            if (!formState) return;
                            try {
                              const payload:any = {};
                              if (formState.nome_material !== undefined) payload.nome_material = formState.nome_material;
                              if (formState.code_id !== undefined) payload.code_id = formState.code_id;
                              // id_tipo_material is intentionally not editable from this modal
                              if (formState.descricao !== undefined) payload.descricao = formState.descricao;
                              if (formState.foto !== undefined) payload.foto = formState.foto;
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

            {/* Modal de Registrar Empréstimo (COM BUSCA E SCROLL - REAPLICADO) */}
            <AnimatePresence>
              {empModalOpen && selectedMaterial && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="absolute inset-0 bg-black/50" onClick={() => { setEmpModalOpen(false); setEmpForm(null); }} />
                  <motion.div
                    // MUDANÇA ESSENCIAL PARA SCROLL: Adiciona flex-col e max-h-[90vh] para limitar a altura do modal à tela
                    className="relative bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 z-10 shadow-2xl flex flex-col max-h-[90vh]" 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                  >
                    {/* Cabeçalho Fixo */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Registrar Empréstimo</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Material: <span className="font-medium">{selectedMaterial.nome_material}</span>
                    </div>

                    {/* Corpo do Formulário Scrollável */}
                    {/* MUDANÇA ESSENCIAL PARA SCROLL: Adiciona overflow-y-auto e flex-grow para permitir scroll no conteúdo */}
                    <div className="space-y-4 overflow-y-auto flex-grow pr-2 -mr-2"> 
                      {/* Campo de Seleção de Estagiário/Visitante COM BUSCA */}
                      <div>
                        <label className="text-sm text-gray-500">Beneficiário</label>
                        {/* Input de Busca para o beneficiário */}
                        <div className="relative mb-2">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Buscar usuário por nome..."
                            value={beneficiarioSearchTerm}
                            onChange={(e) => setBeneficiarioSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                          />
                        </div>

                        {/* Select principal */}
                        <select
                          className="w-full p-2 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          value={empForm?.id_beneficiario ?? ''} // Usamos id_beneficiario para ser genérico
                          onChange={(e) => {
                            const value = e.target.value;
                            const isVisitante = value === '-1';
                            
                            setEmpForm(s => ({ 
                              ...(s || {}), 
                              id_beneficiario: value ? Number(value) : null,
                              id_usuario: isVisitante ? null : (value ? Number(value) : null),
                              // Reinicia os campos de visitante se mudar de 'Visitante' para 'Estagiário'
                              ...(!isVisitante ? { 
                                nome_visitante: null, 
                                genero_visitante: null, 
                                telefone_visitante: null, 
                                email_visitante: null, 
                                morada_visitante: null, 
                                curso_visitante: null, 
                                turma_visitante: null, 
                                numero_processo_visitante: null 
                              } : {})
                            }));
                          }}
                        >
                          <option value="">Selecione um beneficiário...</option>
                          {/* Usa a lista filtrada */}
                          {filteredUsuariosList.map((u: any) => (
                            <option key={u.id} value={u.id}>
                              {u.nome || u.nome_completo || `#${u.id}`}
                            </option>
                          ))}
                          {/* Opção para Visitante (usamos valor -1 para indicar visitante) */}
                          <option value="-1">
                            **Visitante**
                          </option>
                        </select>
                      </div>

                      {/* Campos Adicionais para Visitante (LAYOUT MELHORADO) */}
                      {(empForm?.id_beneficiario === -1) && (
                        // NOVO ESTILO E LAYOUT DE GRID
                        <div className="space-y-4 p-4 border border-blue-400 border-dashed bg-blue-50 dark:bg-gray-700/50 rounded-lg">
                          <h4 className="text-md font-bold text-blue-600 dark:text-blue-300">Detalhes do Visitante (Obrigatório *)</h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              
                              {/* Nome */}
                              <div>
                                  <label className="text-sm text-gray-500">Nome <span className="text-red-500">*</span></label>
                                  <input type="text" className="w-full p-2 mt-1 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                      value={empForm?.nome_visitante ?? ''}
                                      onChange={(e) => setEmpForm(s => ({ ...(s || {}), nome_visitante: e.target.value }))}
                                  />
                              </div>

                              {/* Gênero */}
                              <div>
                                  <label className="text-sm text-gray-500">Gênero <span className="text-red-500">*</span></label>
                                  <select className="w-full p-2 mt-1 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                      value={empForm?.genero_visitante ?? ''}
                                      onChange={(e) => setEmpForm(s => ({ ...(s || {}), genero_visitante: e.target.value }))}
                                  >
                                      <option value="">Selecione</option>
                                      <option value="Masculino">Masculino</option>
                                      <option value="Feminino">Feminino</option>
                                  </select>
                              </div>

                              {/* Telefone */}
                              <div>
                                  <label className="text-sm text-gray-500">Telefone</label>
                                  <input type="tel" className="w-full p-2 mt-1 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                      value={empForm?.telefone_visitante ?? ''}
                                      onChange={(e) => setEmpForm(s => ({ ...(s || {}), telefone_visitante: e.target.value }))}
                                  />
                              </div>
                              
                              {/* Email */}
                              <div>
                                  <label className="text-sm text-gray-500">Email</label>
                                  <input type="email" className="w-full p-2 mt-1 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                      value={empForm?.email_visitante ?? ''}
                                      onChange={(e) => setEmpForm(s => ({ ...(s || {}), email_visitante: e.target.value }))}
                                  />
                              </div>

                              {/* Curso */}
                              <div>
                                  <label className="text-sm text-gray-500">Curso</label>
                                  <input type="text" className="w-full p-2 mt-1 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                      value={empForm?.curso_visitante ?? ''}
                                      onChange={(e) => setEmpForm(s => ({ ...(s || {}), curso_visitante: e.target.value }))}
                                  />
                              </div>

                              {/* Turma */}
                              <div>
                                  <label className="text-sm text-gray-500">Turma</label>
                                  <input type="text" className="w-full p-2 mt-1 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                      value={empForm?.turma_visitante ?? ''}
                                      onChange={(e) => setEmpForm(s => ({ ...(s || {}), turma_visitante: e.target.value }))}
                                  />
                              </div>

                              {/* Processo (Ocupa a linha toda em telas pequenas, mas só metade em telas maiores) */}
                              <div className="sm:col-span-2">
                                  <label className="text-sm text-gray-500">Número de Processo (Opcional)</label>
                                  <input type="text" className="w-full p-2 mt-1 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                      value={empForm?.numero_processo_visitante ?? ''}
                                      onChange={(e) => setEmpForm(s => ({ ...(s || {}), numero_processo_visitante: e.target.value }))}
                                  />
                              </div>
                          </div>

                          {/* Morada (Campo Longo - Ocupa a linha toda) */}
                          <div>
                              <label className="text-sm text-gray-500">Morada</label>
                              <textarea className="w-full p-2 mt-1 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  value={empForm?.morada_visitante ?? ''}
                                  rows={2}
                                  onChange={(e) => setEmpForm(s => ({ ...(s || {}), morada_visitante: e.target.value }))}
                              />
                          </div>
                        </div>
                      )}

                      {/* Campos de Data (Visíveis para Usuário e Visitante) */}
                      <div>
                        <label className="text-sm text-gray-500">Data Início</label>
                        <input type="date" className="w-full p-2 mt-1 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={empForm?.data_inicio ?? ''} onChange={(e)=> setEmpForm(s => ({ ...(s||{}), data_inicio: e.target.value }))} />
                      </div>

                      <div>
                        <label className="text-sm text-gray-500">Data de Entrega (com horário)</label>
                        <input type="datetime-local" className="w-full p-2 mt-1 rounded border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={empForm?.data_final ?? ''} onChange={(e)=> setEmpForm(s => ({ ...(s||{}), data_final: e.target.value }))} />
                      </div>
                    </div>
                    
                    {/* Rodapé Fixo com Botões */}
                    <div className="flex justify-end space-x-2 pt-4 border-t dark:border-gray-700 mt-4">
                        <button className="px-4 py-2 bg-gray-200 rounded text-gray-800 dark:bg-gray-700 dark:text-white" onClick={() => { setEmpModalOpen(false); setEmpForm(null); }}>Cancelar</button>
                        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={async ()=>{
                            const isVisitante = empForm?.id_beneficiario === -1;
                            
                            // Validação para Usuário
                            if (!isVisitante && (!empForm?.id_beneficiario || empForm?.id_beneficiario <= 0)) { 
                              try { toast.showToast('Selecione um usuário ou visitante antes de continuar', 'info'); } catch(e){}; return; 
                            }
                            
                            // Validação mínima para Visitante
                            if (isVisitante && (!empForm?.nome_visitante || !empForm?.genero_visitante)) {
                                 try { toast.showToast('Preencha o Nome e Gênero do Visitante', 'info'); } catch(e){}; return;
                            }

                            try {
                              const payload:any = {
                                id_material: selectedMaterial.id,
                                
                                data_inicio: formatDateOnly(empForm.data_inicio) ?? formatDateOnly(new Date().toISOString()),
                                data_final: formatDateOnly(empForm.data_final) ?? null,
                                
                                // Determina o payload com base na seleção
                                ...(isVisitante ? {
                                  id_usuario: null, // Assegura que id_usuario é nulo ou ausente
                                    // Campos de visitante a serem enviados para a API (o backend precisa lidar com eles)
                                    nome_visitante: empForm.nome_visitante,
                                    genero_visitante: empForm.genero_visitante,
                                    numero_processo_visitante: empForm.numero_processo_visitante,
                                    telefone_visitante: empForm.telefone_visitante,
                                    email_visitante: empForm.email_visitante,
                                    morada_visitante: empForm.morada_visitante,
                                    curso_visitante: empForm.curso_visitante,
                                    turma_visitante: empForm.turma_visitante,
                                } : {
                                  id_usuario: empForm.id_beneficiario, // Se não for -1, é o ID do usuário
                                }),
                              };
                              
                              await api.post('/emprestimos', payload);
                              try { toast.showToast('Empréstimo registrado com sucesso', 'success'); } catch(e){}
                              setEmpModalOpen(false);
                              setEmpForm(null);
                              await reloadMateriais();
                            } catch (err:any) {
                              console.error('Erro ao registrar empréstimo', err);
                              try { toast.showToast('Erro ao registrar empréstimo: ' + (err?.response?.data?.error || err?.message || ''), 'error'); } catch(e){}
                            }
                        }}>Registrar</button>
                      </div>
                    
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3. Notificações e Insights (Item animado e Ícone com pulso) */}
            <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border-l-4 border-red-500"
                variants={itemVariants}
                whileHover={{ x: 5 }} // Deslize sutil para a direita no hover
            >
              <div className="flex items-center space-x-3">
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }} // Animação de pulso
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="flex-shrink-0"
                >
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                </motion.div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Atenção: Alertas de Materiais</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside mt-1">
                    <li>O **Multímetro Fluke** (QR002) está **emprestado** e com prazo vencido.</li>
                    <li>Apenas 2 unidades disponíveis do **Osciloscópio Digital** (Baixa Disponibilidade).</li>
                    <li>A **Bancada de Testes** (QR003) está em **Manutenção** e precisa de acompanhamento.</li>
                  </ul>
                </div>
              </div>
            </motion.div>

          </div>
      </motion.main>
    </div>
  );
}