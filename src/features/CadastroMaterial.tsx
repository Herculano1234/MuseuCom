import React, { useState, useEffect } from "react";
import api from "../api"; 
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Ícone Landmark em SVG (Base64)
const LANDMARK_SVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjMWUxYjRiIiBkPSJNMTYwIDI1NnYxOTJoMzJWMjU2aC0zMnptMTI4IDB2MTkyaDMyVjI1NmgtMzJ6bS02NCAwdjE5MmgzMlYyNTZoLTMyem0yMjQgMTkyVjI1NmgtMzJ2MTkyaDMyek00OCAyNTZ2MTkyaDMyVjI1Nkg0OHpNMjU2IDBMMCAxMjh2NjRoNTEydi02NEwyNTYgMHpNNTEyIDQ0OEgwVjUxMmg1MTJ2LTY0eiIvPjwvc3ZnPg==";

export default function CadastroMaterial() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    modelo: "",
    fabricante: "",
    ano_fabrico: "",
    numero_serie: "",
    perfil_fabricante: "",
    informacoes_adicionais: "",
    imagem: null as File | null
  });

  const qrUrl = `https://api.museucom.ao/materiais/${formData.numero_serie || 'pendente'}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, imagem: file });
      setPreviewImg(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    try {
      await api.post("/materiais", data);
      setStatus({ type: 'success', msg: "Artefacto catalogado com sucesso!" });
    } catch (err) {
      setStatus({ type: 'error', msg: "Erro ao salvar material." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-4 md:py-10 px-4 sm:px-6 lg:px-8">
      <svg style={{ height: 0, width: 0, position: 'absolute' }}>
        <defs>
          <linearGradient id="qr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
        </defs>
      </svg>

      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 shrink-0">
            <i className="fas fa-landmark text-2xl"></i>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Gestão de Acervo</h1>
            <p className="text-slate-500 font-medium text-sm md:text-base">Catalogação técnica e geração de ID digital</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* COLUNA DE PREVIEW (QR E IMAGEM) - Ordem 1 em mobile, fixa em desktop */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="lg:col-span-4 space-y-6 order-2 lg:order-1"
          >
            {/* Card QR Code */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-slate-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-6 inline-block">Etiqueta Inteligente</span>
              
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 inline-block mb-4 max-w-full overflow-hidden">
                <QRCodeSVG 
                  value={qrUrl} 
                  size={180} 
                  style={{ width: '100%', height: 'auto', maxWidth: '220px' }}
                  level="H" 
                  fgColor="url(#qr-gradient)" 
                  imageSettings={{ src: LANDMARK_SVG, height: 40, width: 40, excavate: true }} 
                />
              </div>

              <div className="mt-2">
                <h3 className="text-lg font-black text-slate-800 uppercase line-clamp-1">{formData.nome || "Nome do Material"}</h3>
                <p className="text-indigo-600 font-mono text-xs font-bold truncate">SN: {formData.numero_serie || "---"}</p>
              </div>
            </div>

            {/* Card Preview Imagem */}
            <div className="bg-white p-5 rounded-[2rem] shadow-xl border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase text-slate-400">Visualização</span>
                <i className="fas fa-camera text-slate-300"></i>
              </div>
              <div className="aspect-video lg:aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative">
                {previewImg ? (
                  <img src={previewImg} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <p className="text-xs font-bold text-slate-300">Nenhuma foto selecionada</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* COLUNA DO FORMULÁRIO - Ordem 2 em mobile */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="lg:col-span-8 order-1 lg:order-2"
          >
            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                
                {/* Upload Section */}
                <div className="sm:col-span-2 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <label className="text-[10px] uppercase font-black text-indigo-600 block mb-2">Imagem do Artefacto</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer" />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Nome</label>
                  <input name="nome" value={formData.nome} onChange={handleChange} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-600 outline-none text-sm transition-all" required />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Modelo</label>
                  <input name="modelo" value={formData.modelo} onChange={handleChange} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" required />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Fabricante</label>
                  <input name="fabricante" value={formData.fabricante} onChange={handleChange} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" required />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Ano de Fabrico</label>
                  <input name="ano_fabrico" type="number" value={formData.ano_fabrico} onChange={handleChange} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" required />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Nº de Série</label>
                  <input name="numero_serie" value={formData.numero_serie} onChange={handleChange} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-100" required />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Perfil do Fabricante</label>
                  <textarea name="perfil_fabricante" value={formData.perfil_fabricante} onChange={handleChange} rows={2} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm resize-none" />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Informações Adicionais</label>
                  <textarea name="informacoes_adicionais" value={formData.informacoes_adicionais} onChange={handleChange} rows={3} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm resize-none" />
                </div>

                <div className="sm:col-span-2 pt-4">
                  <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-3 text-sm md:text-base">
                    {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-check-circle"></i>}
                    {loading ? "Gravando..." : "Submeter ao Acervo"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}