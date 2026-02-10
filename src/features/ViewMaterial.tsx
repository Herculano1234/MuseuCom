import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useToast } from '../components/ToastContext';
import { motion } from 'framer-motion';
import { Cpu, Server, Zap } from 'lucide-react';

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
        // Usar endpoint direto por número de série
        const resp = await api.get(`/materiais/serie/${encodeURIComponent(numero_serie)}`);
        if (mounted) setMaterial(resp.data || null);
      } catch (err:any) {
        console.error('Erro ao carregar material por numero_serie', err);
        const message = err?.response?.data?.error || err?.message || 'Erro ao carregar material';
        setError(message);
        try { toast.showToast(message, 'error'); } catch(e){}
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [numero_serie]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-pulse w-full max-w-4xl p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded col-span-1" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded col-span-2" />
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
        <h2 className="text-xl font-bold mb-2">Erro</h2>
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <Link to="/" className="text-sky-600 underline">Voltar à página inicial</Link>
      </div>
    </div>
  );

  if (!material) return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
        <h2 className="text-xl font-bold mb-2">Material não encontrado</h2>
        <p className="text-sm text-gray-600 mb-4">Nenhum material cadastrado com o número de série {numero_serie}</p>
        <Link to="/" className="text-sky-600 underline">Voltar à página inicial</Link>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="min-h-screen p-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* ícones flutuantes decorativos */}
      <motion.div aria-hidden className="absolute top-12 left-6 opacity-30" animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 6 }}>
        <Cpu className="w-10 h-10 text-sky-400" />
      </motion.div>
      <motion.div aria-hidden className="absolute top-28 right-6 opacity-25" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 5 }}>
        <Server className="w-12 h-12 text-green-400" />
      </motion.div>
      <motion.div aria-hidden className="absolute bottom-28 left-20 opacity-20" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 7 }}>
        <Zap className="w-8 h-8 text-yellow-400" />
      </motion.div>

      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">{material.nome}</h1>
            <div className="mt-3 flex flex-wrap gap-3 items-center">
              <span className="text-xs bg-blue-50 text-blue-800 px-3 py-1 rounded-full">Série: <span className="font-medium">{material.numero_serie ?? '—'}</span></span>
              <span className="text-xs bg-gray-50 text-gray-800 px-3 py-1 rounded-full">Modelo: <span className="font-medium">{material.modelo ?? '—'}</span></span>
              <span className="text-xs bg-green-50 text-green-800 px-3 py-1 rounded-full">Fabricante: <span className="font-medium">{material.fabricante ?? '—'}</span></span>
            </div>
          </div>
          <div className="text-sm text-gray-500">Cadastrado em: {material.created_at ? new Date(material.created_at).toLocaleDateString() : '—'}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <motion.div whileHover={{ scale: 1.02 }} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-center h-64">
              {material.foto ? (
                <img src={material.foto} alt={`Foto do ${material.nome}`} className="w-full h-full object-contain rounded" />
              ) : (
                <div className="text-gray-400">Sem imagem</div>
              )}
            </motion.div>

            <div className="mt-4">
              <Link to="/materiais/todos" className="inline-block bg-sky-600 text-white px-4 py-2 rounded-lg shadow hover:bg-sky-700">Ver todos os materiais</Link>
            </div>
          </div>

          <div className="col-span-2 space-y-4">
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Descrição</h3>
              <p className="mt-3 text-base text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{material.infor_ad ?? '—'}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.05 }} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Perfil do Fabricante</h3>
              <p className="mt-3 text-base text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{material.perfil_fabricante ?? '—'}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.08 }} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Ficha (PDF)</h3>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {material.pdf ? (
                    <a className="text-sky-600 hover:underline" href={material.pdf} target="_blank" rel="noreferrer">Abrir/Visualizar Ficha PDF</a>
                  ) : (
                    <span className="text-gray-400">Sem ficha disponível</span>
                  )}
                </div>
              </div>
              <div>
                {material.pdf && (
                  <a href={material.pdf} download className="inline-block bg-sky-600 text-white px-3 py-2 rounded">Download</a>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
