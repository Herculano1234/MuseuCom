import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useToast } from '../components/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Server, Zap, ChevronLeft, Download, FileText, Calendar, Box, ShieldCheck } from 'lucide-react';

interface MaterialFull {
  id: number;
  nome: string;
  numero_serie?: string | null;
  modelo?: string | null;
  fabricante?: string | null;
  data_fabrico?: string | null;
  infor_ad?: string | null;
  perfil_fabricante?: string | null;
  foto?: string | null;
  pdf?: string | null;
  created_at?: string | null;
}

export default function ViewMaterial() {
  const { numero_serie } = useParams<{ numero_serie: string }>();
  const [loading, setLoading] = useState(true);
  const [material, setMaterial] = useState<MaterialFull | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (!numero_serie) return;
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const resp = await api.get(`/materiais/serie/${encodeURIComponent(String(numero_serie))}`);
        if (mounted) setMaterial(resp.data || null);
      } catch (err: any) {
        const message = err?.response?.data?.error || err?.message || 'Erro ao carregar material';
        setError(message);
        try { toast.showToast(message, 'error'); } catch (e) { }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [numero_serie, toast]);

  // Componente de Skeleton melhorado para Mobile
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-lg space-y-4">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
        </div>
      </div>
    </div>
  );

  if (error || !material) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl text-center">
        <div className="bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Box className="text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2 dark:text-white">{error ? 'Erro' : 'Não encontrado'}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error || `Nenhum material com a série ${numero_serie}`}</p>
        <Link to="/" className="flex items-center justify-center gap-2 text-sky-600 font-medium hover:text-sky-700">
          <ChevronLeft size={20} /> Voltar ao Início
        </Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-x-hidden relative">
      
      {/* Background Dinâmico - Mantido sutil para não distrair no mobile */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div animate={{ y: [0, -20, 0], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-10 left-[5%]"><Cpu className="w-12 h-12 text-sky-500" /></motion.div>
        <motion.div animate={{ y: [0, 20, 0], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-20 right-[10%]"><Server className="w-16 h-16 text-emerald-500" /></motion.div>
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.15, 0.05] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><Zap className="w-64 h-64 text-yellow-500" /></motion.div>
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Botão Voltar Mobile-Friendly */}
        <Link to="/materiais/todos" className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-sky-600 transition-colors">
          <ChevronLeft size={18} /> Voltar para a lista
        </Link>

        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            {material.nome}
          </h1>
          <div className="flex flex-wrap gap-2">
            <Badge icon={<ShieldCheck size={14} />} label={`Série: ${material.numero_serie || 'N/A'}`} color="blue" />
            <Badge icon={<Box size={14} />} label={material.modelo || 'Modelo padrão'} color="gray" />
            <Badge icon={<Calendar size={14} />} label={material.created_at ? new Date(material.created_at).toLocaleDateString() : 'Sem data'} color="green" />
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Coluna Imagem (Esquerda) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5"
          >
            <div className="sticky top-8">
              <div className="aspect-square bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl shadow-sky-500/10 border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden p-6 group">
                {material.foto ? (
                  <motion.img 
                    whileHover={{ scale: 1.05 }}
                    src={material.foto} 
                    alt={material.nome} 
                    className="w-full h-full object-contain transition-transform duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <Box size={48} strokeWidth={1} />
                    <span className="text-sm font-medium">Imagem indisponível</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Coluna Informações (Direita) */}
          <div className="lg:col-span-7 space-y-6">
            
            <CardSection title="Descrição do Equipamento" delay={0.1}>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {material.infor_ad || "Nenhuma descrição adicional informada para este item."}
              </p>
            </CardSection>

            <CardSection title="Sobre o Fabricante" delay={0.2}>
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-sky-100 dark:bg-sky-900/30 p-2 rounded-lg text-sky-600 dark:text-sky-400">
                  <Server size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-200">{material.fabricante || "Fabricante Desconhecido"}</h4>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
                    {material.perfil_fabricante || "Detalhes do fabricante não disponíveis."}
                  </p>
                </div>
              </div>
            </CardSection>

            {/* Seção PDF - CTA (Call to Action) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-sky-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-sky-600/20"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">Documentação Técnica</h3>
                    <p className="text-sky-100 text-sm">Acesse o PDF completo do produto</p>
                  </div>
                </div>
                
                {material.pdf ? (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <a 
                      href={material.pdf} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1 sm:flex-none text-center bg-white text-sky-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-sky-50 transition-colors shadow-lg"
                    >
                      Visualizar
                    </a>
                    <a 
                      href={material.pdf} 
                      download
                      className="bg-sky-500/30 hover:bg-sky-500/50 p-3 rounded-xl transition-colors"
                    >
                      <Download size={20} />
                    </a>
                  </div>
                ) : (
                  <span className="text-sky-200 text-sm font-medium">PDF indisponível</span>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sub-componentes para limpeza de código
function Badge({ icon, label, color }: { icon: React.ReactNode, label: string, color: 'blue' | 'gray' | 'green' }) {
  const styles = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-semibold border border-transparent hover:border-current transition-all ${styles[color]}`}>
      {icon}
      {label}
    </span>
  );
}

function CardSection({ title, children, delay }: { title: string, children: React.ReactNode, delay: number }) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-100 dark:border-gray-700 rounded-3xl p-6 md:p-8 shadow-sm"
    >
      <h3 className="text-xs uppercase tracking-widest font-black text-sky-600 dark:text-sky-400 mb-4">{title}</h3>
      {children}
    </motion.section>
  );
}