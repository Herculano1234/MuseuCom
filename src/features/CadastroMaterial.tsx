import React, { useState, useEffect } from "react";
import api from "../api"; 
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Ícone Landmark em SVG (Base64) - Estilo Museu Real
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
    perfil_fabricante: "", // Novo campo
    informacoes_adicionais: "", // Novo campo
    imagem: null as File | null // Campo para upload
  });

  // URL dinâmica para o QR Code
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
    
    // Como temos imagem, o ideal é usar FormData para enviar ao backend
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    try {
      await api.post("/materiais", data);
      setStatus({ type: 'success', msg: "Artefacto catalogado com sucesso!" });
    } catch (err) {
      setStatus({ type: 'error', msg: "Erro ao salvar. Verifique os dados." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-6">
      {/* Gradiente do QR Code */}
      <svg style={{ height: 0, width: 0, position: 'absolute' }}>
        <defs>
          <linearGradient id="qr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
        </defs>
      </svg>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LADO ESQUERDO: QR CODE E PREVIEW DA FOTO */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full inline-block mb-8">Etiqueta de Património</span>

            <div className="p-4 bg-white rounded-3xl shadow-inner border border-slate-50 mb-6 inline-block">
              <QRCodeSVG value={qrUrl} size={220} level="H" fgColor="url(#qr-gradient)" imageSettings={{ src: LANDMARK_SVG, height: 50, width: 50, excavate: true }} />
            </div>

            <h3 className="text-xl font-black text-slate-800 uppercase truncate">{formData.nome || "Novo Material"}</h3>
            <p className="text-indigo-600 font-mono text-xs font-bold mt-1">SN: {formData.numero_serie || "--- --- ---"}</p>
          </div>

          {/* Preview da Imagem do Artefacto */}
          <div className="bg-white p-4 rounded-[2rem] shadow-xl border border-slate-100">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-3 text-center">Foto do Artefacto</p>
            <div className="aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center">
              {previewImg ? (
                <img src={previewImg} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <i className="fas fa-camera text-4xl text-slate-200"></i>
              )}
            </div>
          </div>
        </motion.div>

        {/* LADO DIREITO: FORMULÁRIO COMPLETO */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-8 bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="mb-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><i className="fas fa-archive"></i></div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 leading-tight">Catalogação Avançada</h2>
              <p className="text-slate-400 font-medium">Preencha os detalhes técnicos para o acervo.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Upload da Imagem</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer" />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Nome</label>
              <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: Central Telefónica" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600 transition-all text-sm" required />
            </div>

            <div className="space-y-1"><label className="text-[10px] uppercase font-black text-slate-400 ml-1">Modelo</label><input name="modelo" value={formData.modelo} onChange={handleChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm" required /></div>
            
            <div className="space-y-1"><label className="text-[10px] uppercase font-black text-slate-400 ml-1">Fabricante</label><input name="fabricante" value={formData.fabricante} onChange={handleChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm" required /></div>

            <div className="space-y-1"><label className="text-[10px] uppercase font-black text-slate-400 ml-1">Ano de Fabrico</label><input name="ano_fabrico" type="number" value={formData.ano_fabrico} onChange={handleChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm" required /></div>

            <div className="space-y-1"><label className="text-[10px] uppercase font-black text-slate-400 ml-1">Nº de Série</label><input name="numero_serie" value={formData.numero_serie} onChange={handleChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-mono" required /></div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Perfil do Fabricante (História/Contexto)</label>
              <textarea name="perfil_fabricante" value={formData.perfil_fabricante} onChange={handleChange} placeholder="Ex: Empresa alemã fundada em..." rows={2} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600 transition-all text-sm resize-none" />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Informações Adicionais</label>
              <textarea name="informacoes_adicionais" value={formData.informacoes_adicionais} onChange={handleChange} placeholder="Notas sobre restauro, curiosidades..." rows={3} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-600 transition-all text-sm resize-none" />
            </div>

            <button type="submit" disabled={loading} className="md:col-span-2 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl transition-all flex items-center justify-center gap-3">
              {loading ? <i className="fas fa-sync fa-spin"></i> : <i className="fas fa-check-double"></i>}
              {loading ? "Gravando..." : "Submeter ao Acervo"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}