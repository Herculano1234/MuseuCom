import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import api from '../../api';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00c49f', '#0088fe', '#a34de6'];

export default function Estatistica() {
  const [materialsByMonth, setMaterialsByMonth] = useState<any[]>([]);
  const [materialsByFab, setMaterialsByFab] = useState<any[]>([]);
  const [loansByMonth, setLoansByMonth] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const resp = await api.get('/stats');
        if (!mounted) return;
        const data = resp.data || {};
        // Normalize months (ensure chronological order)
        const mbm = Array.isArray(data.materials_by_month) ? data.materials_by_month.slice().reverse() : [];
        setMaterialsByMonth(mbm.map((r:any) => ({ month: r.month, count: Number(r.cnt || r.count || 0) })));
        const mbf = Array.isArray(data.materials_by_fabricante) ? data.materials_by_fabricante : [];
        setMaterialsByFab(mbf.map((r:any) => ({ name: r.fabricante || r.name || '—', value: Number(r.cnt || r.count || 0) })));
        const lbm = Array.isArray(data.loans_by_month) ? data.loans_by_month.slice().reverse() : [];
        setLoansByMonth(lbm.map((r:any) => ({ month: r.month, count: Number(r.cnt || r.count || 0) })));
      } catch (err:any) {
        setError(err?.response?.data?.error || err?.message || 'Erro ao carregar estatísticas');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Estatísticas</h1>
        {error && <div className="mb-4 text-red-600">{error}</div>}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold mb-2">Materiais Criados (últimos meses)</h2>
            {loading ? (
              <div className="h-56 flex items-center justify-center text-gray-400">Carregando...</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={materialsByMonth} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold mb-2">Materiais por Fabricante</h2>
            {loading ? (
              <div className="h-56 flex items-center justify-center text-gray-400">Carregando...</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={materialsByFab} dataKey="value" nameKey="name" outerRadius={90} fill="#8884d8" label>
                    {materialsByFab.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
          <h2 className="text-lg font-semibold mb-2">Empréstimos (últimos meses)</h2>
          {loading ? (
            <div className="h-40 flex items-center justify-center text-gray-400">Carregando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={loansByMonth} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </main>
    </div>
  );
}
