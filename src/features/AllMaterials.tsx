import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { Link } from 'react-router-dom';

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

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const resp = await api.get('/materiais');
        if (!mounted) return;
        if (Array.isArray(resp.data)) {
          const normalized = resp.data.map((r:any) => ({
            id: r.id,
            nome: r.nome || r.nome_material || '—',
            numero_serie: r.numero_serie ?? null,
            modelo: r.modelo ?? null,
            fabricante: r.fabricante ?? null,
            foto: r.foto ?? null,
          }));
          setMateriais(normalized);
        } else {
          setMateriais([]);
        }
      } catch (err:any) {
        console.error('Erro ao carregar materiais', err);
        setError(err?.response?.data?.error || err?.message || 'Erro ao carregar materiais');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">Carregando materiais...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-lg font-bold">Erro</h2>
        <p className="text-sm text-gray-600">{error}</p>
        <Link to="/" className="text-sky-600 underline">Voltar</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Todos os Materiais</h1>
          <Link to="/" className="text-sky-600">Voltar</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {materiais.map(m => (
            <motion.div key={m.id} whileHover={{ scale: 1.02 }} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-lg">
              <div className="h-40 bg-gray-100 dark:bg-gray-700 rounded mb-3 flex items-center justify-center overflow-hidden">
                {m.foto ? <img src={m.foto} alt={m.nome} className="w-full h-full object-contain" /> : <div className="text-gray-400">Sem imagem</div>}
              </div>
              <h3 className="font-semibold">{m.nome}</h3>
              <div className="text-sm text-gray-500 mt-1">Série: {m.numero_serie ?? '—'}</div>
              <div className="text-sm text-gray-500">Modelo: {m.modelo ?? '—'}</div>
              <div className="mt-3 flex justify-between items-center">
                <Link to={`/ver/${encodeURIComponent(m.numero_serie ?? String(m.id))}`} className="text-sky-600 hover:underline">Ver</Link>
                <span className="text-xs text-gray-400">{m.fabricante ?? ''}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
