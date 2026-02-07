import { useEffect, useState, useCallback } from 'react';
import api from '../api';

interface Professor {
  id: number;
  nome_completo: string;
  foto?: string | null;
}

export default function useProfessor() {
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Buscar o usuário autenticado diretamente via /me
      const res = await api.get('/me');
      const row = res.data;
      if (row && row.id) {
        setProfessor({
          id: Number(row.id),
          nome_completo: row.nome || row.nome_completo || 'Usuário',
          foto: (row as any).foto || null,
        });
      } else {
        setProfessor(null);
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { professor, loading, error, reload: load } as const;
}
