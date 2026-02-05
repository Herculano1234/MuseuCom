import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-xl text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-300">Página não encontrada ou rota inválida.</p>
        <div className="flex justify-center gap-3">
          <Link to="/" className="px-4 py-2 bg-sky-600 text-white rounded">Ir para Início</Link>
          <Link to="/login" className="px-4 py-2 bg-gray-200 text-gray-800 rounded">Ir para Login</Link>
        </div>
      </div>
    </div>
  );
}
