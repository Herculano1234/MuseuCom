import React, { useEffect, useState } from 'react';
import api from '../api';

interface User {
  id: number;
  nome: string;
  email: string;
  telefone?: string | null;
  created_at?: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/usuarios');
        if (!mounted) return;
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        console.error('Erro ao listar usuários', err);
        setError(err?.response?.data?.error || err?.message || 'Erro ao carregar usuários');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Usuários</h1>
        {loading ? (
          <div className="text-gray-600">Carregando usuários...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : users.length === 0 ? (
          <div className="text-gray-600">Nenhum usuário encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-2">Nome</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Contacto</th>
                  <th className="px-4 py-2">Criado em</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">{u.nome}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.telefone || '—'}</td>
                    <td className="px-4 py-3">{u.created_at ? new Date(u.created_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
