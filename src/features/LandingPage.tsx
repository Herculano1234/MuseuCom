import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { motion, AnimatePresence } from "framer-motion";

// --- DADOS ORIGINAIS PRESERVADOS ---
const carouselImages = [
  "https://angolafieldgroup.com/wp-content/uploads/2008/04/maria-pia-hospital1.jpg?w=768",
  "https://www.makaangola.org/wp-content/uploads/2021/08/hospital-geral-luanda-860x280.jpg",
  "https://rna.ao/rna.ao/wp-content/uploads/2022/03/5839350E-A2A6-4BB9-B001-0E1AB7331FC5.jpeg"
];

const servicesData = [
  { icon: "fas fa-users", title: "Visitas Guiadas", desc: "Experiência acompanhada por especialistas que explicam a história das comunicações." },
  { icon: "fas fa-landmark", title: "Exposições", desc: "Mostrando desde equipamentos clássicos até tecnologias modernas, permanentes e temporárias." },
  { icon: "fas fa-graduation-cap", title: "Atividades Educativas", desc: "Oficinas, palestras e programas escolares para inspirar novas gerações." },
  { icon: "fas fa-book-open", title: "Pesquisa e Documentação", desc: "Apoio a estudantes e investigadores interessados em telecomunicações e história." },
  { icon: "fas fa-calendar-alt", title: "Eventos Culturais", desc: "Espaço para conferências, lançamentos de livros e encontros temáticos." },
];

const artifactsData = [
  { id: 1, name: "Telefone de Disco", category: "telefones", desc: "Baquelite, Anos 70. Usado em residências.", inv: "INV-001", img: "https://images.unsplash.com/photo-1520962922320-2038eebab146?auto=format&fit=crop&q=80&w=400" },
  { id: 2, name: "Rádio Valvulado", category: "radios", desc: "Madeira, Anos 50. Recepção AM/SW.", inv: "INV-004", img: "https://images.unsplash.com/photo-1524312788339-e4a69f68cb67?auto=format&fit=crop&q=80&w=400" },
  { id: 3, name: "Telégrafo Morse", category: "telegrafia", desc: "Metal/Madeira, Séc. XIX. Transmissão de dados.", inv: "INV-012", img: "https://images.unsplash.com/photo-1542385352-7e9b4661073e?auto=format&fit=crop&q=80&w=400" },
  { id: 4, name: "Telex T100", category: "telegrafia", desc: "Eletromecânico. Envio de mensagens escritas.", inv: "INV-020", img: "https://images.unsplash.com/photo-1563205764-64b598b0f772?auto=format&fit=crop&q=80&w=400" },
  { id: 5, name: "Celular 'Tijolão'", category: "equipamentos digitais", desc: "Plástico, Anos 90. Primeira geração móvel.", inv: "INV-033", img: "https://images.unsplash.com/photo-1576662712683-176317bbb69c?auto=format&fit=crop&q=80&w=400" },
  { id: 6, name: "Lista Telefônica 1980", category: "documentos", desc: "Papel. Registo de assinantes de Luanda.", inv: "INV-045", img: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=400" },
];

const categories = ["todos", "telefones", "radios", "telegrafia", "documentos", "equipamentos digitais"];

export default function LandingPage() {
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("todos");
  const carouselInterval = useRef<number | null>(null);

  useEffect(() => {
    carouselInterval.current = window.setInterval(() => {
      setCarouselIdx((idx) => (idx + 1) % carouselImages.length);
    }, 6000);
    return () => { if (carouselInterval.current) window.clearInterval(carouselInterval.current); };
  }, []);

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 80, behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  const filteredArtifacts = activeCategory === "todos" 
    ? artifactsData 
    : artifactsData.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-indigo-100 overflow-x-hidden">
      
      {/* NAVBAR */}
      <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-2xl font-black text-indigo-700 cursor-pointer" 
            onClick={() => handleScrollTo('inicio')}
          >
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-landmark"></i>
            </div>
            <span>MuseuCom</span>
          </motion.div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 items-center">
            {["Início", "Serviços", "Artefactos", "Contato"].map((item, idx) => (
              <motion.button 
                key={item} 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleScrollTo(item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))} 
                className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-widest"
              >
                {item}
              </motion.button>
            ))}
            <div className="h-5 w-px bg-slate-200 mx-2"></div>
            <Link to="/login" className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-bold text-sm shadow-md hover:bg-indigo-700 transition-all">
              Área Restrita
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-2xl text-slate-800 p-2" onClick={() => setMobileMenuOpen(true)}>
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-lg md:hidden flex flex-col items-center justify-center"
          >
            <button className="absolute top-6 right-6 text-3xl text-white" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
            <nav className="flex flex-col gap-8 text-center">
              {["Início", "Serviços", "Artefactos", "Contato"].map((item) => (
                <button 
                  key={item} 
                  onClick={() => handleScrollTo(item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))} 
                  className="text-2xl font-black text-white hover:text-indigo-400 transition-colors"
                >
                  {item}
                </button>
              ))}
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="mt-4 px-10 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg">
                Área Restrita
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section id="inicio" className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            className="flex-1 space-y-6" 
            initial={{ opacity: 0, x: -50 }} 
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold uppercase tracking-wider">
              Bem-vindo ao MuseuCom
            </span>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-tight">
              Conectando Passado, <span className="text-indigo-600">Presente</span> e Futuro.
            </h1>
            <p className="text-xl text-slate-600 border-l-4 border-indigo-500 pl-4 italic leading-relaxed">
              "O Museu das Comunicações de Angola é um espaço que preserva a memória e inspira novas gerações."
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button onClick={() => handleScrollTo('contato')} className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                Visite-nos
              </button>
              <button onClick={() => handleScrollTo('artefactos')} className="px-8 py-4 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:border-indigo-600 transition-all">
                Ver Artefactos
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-slate-50 relative group"
          >
            <img src={carouselImages[carouselIdx]} className="w-full h-[500px] object-cover transition-all duration-1000 group-hover:scale-105" alt="Exposição" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-black text-slate-900 mb-4"
          >
            Nossos Serviços
          </motion.h2>
          <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full"></div>
        </div>
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {servicesData.map((service, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group"
            >
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <i className={service.icon}></i>
              </div>
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-slate-500 leading-relaxed">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ACERVO DIGITAL */}
      <section id="artefactos" className="py-24 bg-white">
        <div className="container mx-auto px-6 mb-12 flex flex-col items-center">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl font-black text-slate-900 mb-8"
          >
            Acervo Digital
          </motion.h2>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all capitalize ${activeCategory === cat ? "bg-indigo-600 text-white shadow-lg" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredArtifacts.map((item) => (
              <motion.div 
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 transition-all hover:-translate-y-2"
              >
                <div className="h-56 overflow-hidden">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{item.name}</h3>
                    <span className="text-xs font-bold px-2 py-1 bg-white rounded border border-slate-200">{item.inv}</span>
                  </div>
                  <p className="text-slate-500 text-sm mb-4 leading-relaxed">{item.desc}</p>
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-xs uppercase font-black text-indigo-600 tracking-tighter">{item.category}</span>
                    <i className="fas fa-qrcode text-slate-300"></i>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-8"
          >
            <h2 className="text-4xl font-black">Entre em Contato</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <i className="fas fa-map-marker-alt text-indigo-400 text-2xl mt-1"></i>
                <div>
                  <h4 className="font-bold text-lg">Localização</h4>
                  <p className="text-slate-400">Angola, Luanda, Rangel, Bairro CTT.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <i className="fas fa-clock text-indigo-400 text-2xl mt-1"></i>
                <div>
                  <h4 className="font-bold text-lg">Horário</h4>
                  <p className="text-slate-400">Segunda a Sábado: 9h – 17h</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex-1 bg-white p-8 md:p-12 rounded-[2.5rem] text-slate-900 shadow-2xl"
          >
            <h3 className="text-2xl font-bold mb-6">Mensagem Direta</h3>
            <form className="space-y-4">
              <input type="text" placeholder="Nome Completo" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all" />
              <input type="email" placeholder="E-mail" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all" />
              <textarea placeholder="Sua dúvida ou sugestão..." rows={4} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all resize-none"></textarea>
              <button className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 shadow-xl transition-all">
                Enviar Mensagem
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-500 py-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 text-white text-xl font-black">
          <i className="fas fa-landmark text-indigo-500"></i> MuseuCom
        </div>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Museu das Comunicações de Angola.
        </p>
      </footer>

    </div>
  );
}