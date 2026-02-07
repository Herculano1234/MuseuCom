import React from 'react';

export default function Estatistica() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Estatísticas</h1>
        <p className="text-gray-600 dark:text-gray-300">Página de estatísticas do painel. Aqui serão adicionados gráficos e relatórios detalhados.</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold">Visitas</h2>
            <div className="h-40 flex items-center justify-center text-gray-400">Gráfico placeholder</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold">Materiais</h2>
            <div className="h-40 flex items-center justify-center text-gray-400">Gráfico placeholder</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold">Empréstimos</h2>
            <div className="h-40 flex items-center justify-center text-gray-400">Gráfico placeholder</div>
          </div>
        </div>
      </main>
    </div>
  );
}
