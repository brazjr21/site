import React, { useState, useEffect, useMemo } from 'react';

// ── Configuração ──────────────────────────────────────────────────────────────
const config = {
  checkout: "https://pay.cakto.com.br/5b2bivi_760937",
};

// ── Ícones SVG ─────────────────────────────────────────────────────────────────
const Icons = {
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#3D1D13]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Bunny: () => (
    <svg viewBox="0 0 24 24" className="w-12 h-12 absolute -top-8 left-1/2 -translate-x-1/2 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 16C7 16 5 12 5 8C5 4 7 2 9 2C11 2 12 4 12 6C12 4 13 2 15 2C17 2 19 4 19 8C19 12 17 16 17 16" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 16C7 16 5 12 5 8C5 4 7 2 9 2C11 2 12 4 12 6C12 4 13 2 15 2C17 2 19 4 19 8C19 12 17 16 17 16" fill="#FFD1DC" />
      <path d="M7 16C7 16 5 12 5 8C5 4 7 2 9 2C11 2 12 4 12 6C12 4 13 2 15 2C17 2 19 4 19 8C19 12 17 16 17 16" stroke="#3D1D13" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="19" r="4" fill="white" stroke="#3D1D13" strokeWidth="1.5" />
      <circle cx="10.5" cy="18.5" r="0.5" fill="#3D1D13" />
      <circle cx="13.5" cy="18.5" r="0.5" fill="#3D1D13" />
      <path d="M11 20H13" stroke="#3D1D13" strokeLinecap="round" />
      <path d="M8 19H6M16 19H18" stroke="#3D1D13" strokeLinecap="round" />
    </svg>
  ),
  ChevronDown: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Gift: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#3D1D13]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Shield: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-[#3D1D13]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-7.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  WhatsApp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.483 8.413-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.308 1.654zm6.236-3.364l.339.202c1.57.935 3.375 1.427 5.226 1.428 5.623 0 10.203-4.579 10.206-10.202.001-2.724-1.061-5.285-2.993-7.217-1.932-1.931-4.493-2.99-7.214-2.991-5.622 0-10.202 4.58-10.205 10.204-.001 1.884.512 3.72 1.482 5.32l.221.365-1.011 3.693 3.754-.984zm11.034-7.493c-.304-.153-1.8-.886-2.077-.988-.278-.101-.48-.153-.68.153-.2.305-.777.988-.952 1.191-.176.203-.351.228-.655.076-.304-.151-1.283-.473-2.445-1.508-.904-.806-1.513-1.802-1.69-2.107-.176-.305-.019-.47.133-.621.137-.136.304-.354.456-.531.151-.177.202-.304.304-.506.101-.203.05-.38-.025-.532-.076-.152-.68-1.639-.933-2.246-.246-.595-.497-.514-.68-.523-.176-.009-.379-.011-.582-.011-.202 0-.531.076-.81.38-.278.304-1.062 1.039-1.062 2.532s1.087 2.94 1.239 3.142c.153.202 2.14 3.267 5.182 4.582.723.313 1.288.5 1.728.641.726.231 1.387.198 1.909.12.581-.088 1.8-.736 2.053-1.445.253-.708.253-1.316.177-1.445-.077-.127-.278-.203-.582-.355z" />
    </svg>
  ),
  Chart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
};

// ── Botão CTA ─────────────────────────────────────────────────────────────────
function CTAButton({ children, sticky = false }) {
  const base =
    "bg-[#FFC107] text-white font-black uppercase tracking-wider py-4 px-8 rounded-full shadow-[0_4px_0_#d69e00] hover:shadow-[0_2px_0_#d69e00] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-150 text-center block w-full border-2 border-[#3D1D13]";
  const wrapper = sticky
    ? "fixed bottom-6 left-6 right-6 z-50 animate-bounce max-w-[480px] mx-auto"
    : "relative overflow-hidden";
  return (
    <a href={config.checkout} className={`${base} ${wrapper}`} target="_blank" rel="noopener noreferrer">
      <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-md">
        {children}
        <Icons.Check />
      </span>
    </a>
  );
}

// ── FAQ Item ──────────────────────────────────────────────────────────────────
function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border-2 border-[#3D1D13]/10 rounded-2xl mb-3 overflow-hidden transition-all duration-300 shadow-sm">
      <button onClick={() => setOpen(!open)} className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-[#3D1D13] hover:bg-[#F0F9FF] transition-colors">
        <span className="text-sm md:text-base pr-4">{question}</span>
        <div className={`transform transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
          <Icons.ChevronDown className="text-[#29B6F6]" />
        </div>
      </button>
      <div className={`px-6 text-[#3D1D13]/80 text-sm leading-relaxed font-medium transition-all duration-300 ease-in-out bg-[#F8FAFC] overflow-hidden ${open ? "max-h-[800px] py-4 opacity-100" : "max-h-0 py-0 opacity-0"}`}>
        {answer}
      </div>
    </div>
  );
}

// ── App Principal ─────────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => {
    if (!window.fbq) {
      (function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
        t = b.createElement(e); t.async = true; t.src = v;
        s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", "1439282554496020");
      window.fbq("track", "PageView");
    }
  }, []);

  const roadmap = useMemo(() => [
    { day: "Dia 1", title: "Domine a Base", desc: "Temperagem e cascas perfeitas sem complicação." },
    { day: "Dia 3", title: "Crie o Desejo", desc: "Recheios gourmet e fotos que vendem sozinhas." },
    { day: "Dia 5", title: "Aqueça o WhatsApp", desc: "Aplique os scripts e comece a pré-venda." },
    { day: "Dia 7", title: "Primeiro Mil", desc: "Fechamento de pedidos e meta de R$1.000 batida." },
  ], []);

  const testimonials = useMemo(() => [
    { name: "Mariana", city: "Campinas, SP", text: "Eu achava que só ovo vendia na Páscoa. Fiz 40 fatias pra testar e acabou no mesmo dia. No segundo dia já fiz 80. Nunca tive giro assim.", result: "120 fatias em 2 dias" },
    { name: "Larissa", city: "Recife, PE", text: "Eu tinha medo de sobrar produto. Comecei com lote pequeno de fatias e vendi tudo só com status. Em 5 dias fiz mais do que tinha feito o ano passado inteiro com ovo.", result: "R$ 1.340 em 5 dias" },
    { name: "Camila", city: "Londrina, PR", text: "Todo mundo aqui vende ovo tradicional. Fui na fatia gourmet e virei 'a menina das sobremesas'. Acabou virando renda fixa.", result: "60 a 90 fatias por semana" },
    { name: "Patrícia", city: "Osasco, SP", text: "Comecei com menos de R$200. Fiz produção pequena, vendi tudo e reinvesti. Não precisei gastar uma fortuna com forma de ovo.", result: "Recuperou investimento no 1º dia" },
    { name: "Bruna", city: "Goiânia, GO", text: "Eu sempre achava que precisava investir alto pra vender na Páscoa. Com as fatias, comecei simples e fui escalando. Muito mais seguro.", result: "R$ 980 na primeira semana" },
    { name: "Renata", city: "Salvador, BA", text: "Eu jurava que estava saturado. Mas aqui só tinha gente vendendo ovo grande. As fatias viraram opção pra quem não queria gastar muito.", result: "75 unidades vendidas em 3 dias" },
    { name: "Juliana", city: "Belo Horizonte, MG", text: "Meu medo era competir com confeitaria grande. Mas fatia é venda por impulso. Não tem comparação.", result: "Combo de 6 fatias virou campeão" },
  ], []);

  const roadmapEmojis = ["🐰", "🥚", "🐰", "🚀"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Montserrat:wght@400;500;700;900&family=Playfair+Display:ital,wght@0,400;1,400&display=swap');

        body {
          font-family: 'Montserrat', sans-serif;
          background-color: #29B6F6;
          color: #3D1D13;
          -webkit-tap-highlight-color: transparent;
          overflow-x: hidden;
        }
        h1, h2, h3, h4, .font-display {
          font-family: 'Fredoka One', cursive;
          letter-spacing: 0.02em;
        }
        .script-text {
          font-family: 'Playfair Display', serif;
          font-style: italic;
        }
        .easter-blue-pattern {
          background-color: #29B6F6;
          background-image: radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                            radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px);
          background-position: 0 0, 12px 12px;
          background-size: 24px 24px;
        }
        .paper-card {
          background-color: white;
          border-radius: 20px;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
          position: relative;
          transform: rotate(0deg);
          border: 2px solid white;
        }
        .paper-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border-radius: 20px;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.02);
          pointer-events: none;
        }
        .yellow-strip {
          background: #FFC107;
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 12px;
          z-index: 50;
          box-shadow: 2px 0 5px rgba(0,0,0,0.1);
        }
        .fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .wiggle {
          animation: wiggle 3s ease-in-out infinite;
          transform-origin: bottom center;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50%       { transform: rotate(3deg); }
        }
        @keyframes wave-text {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25%       { transform: translateY(-5px) rotate(-2deg); }
          75%       { transform: translateY(2px) rotate(2deg); }
        }
        .animate-char {
          display: inline-block;
          animation: wave-text 2s infinite ease-in-out;
          transform-origin: bottom center;
        }
      `}</style>

      <div className="max-w-[480px] mx-auto bg-[#29B6F6] min-h-screen relative shadow-2xl overflow-x-hidden easter-blue-pattern border-r-8 border-[#25aae6]">
        <div className="yellow-strip h-full fixed max-w-[480px]" />

        {/* ── Hero ── */}
        <section className="px-8 pt-12 pb-12 relative z-10 pl-10">
          <div className="paper-card p-8 text-center mb-8 shadow-[0_15px_30px_rgba(61,29,19,0.2)]">
            <div className="wiggle absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 z-20">
              <Icons.Bunny />
            </div>

            <div className="inline-block px-3 py-1 bg-[#FFC107] text-[#3D1D13] font-bold text-[10px] rounded-full uppercase tracking-widest mb-6 mt-4">
              Método <span className="font-black">Fatia: lucro com baixo custo</span>
            </div>

            <h1 className="text-[#3D1D13] font-black text-2xl leading-tight mb-6">
              Guia prático para <br />
              conquistar seus primeiros <br />
              <span className="relative inline-block my-3">
                <span className="absolute inset-0 bg-[#FFC107] rounded-full transform scale-110 opacity-40" />
                <span className="relative font-display text-6xl text-[#29B6F6] drop-shadow-[2px_2px_0_#3D1D13] stroke-chocolate flex justify-center gap-1">
                  {"R$ 1.000".split("").map((ch, i) => (
                    <span key={i} className="animate-char" style={{ animationDelay: `${i * 0.1}s` }}>
                      {ch === " " ? "\u00A0" : ch}
                    </span>
                  ))}
                </span>
              </span>
              <br />
              <span className="text-2xl mt-2 block text-[#3D1D13]">vendendo ovos de Páscoa</span>
              <span className="text-sm font-bold uppercase tracking-widest text-[#3D1D13]/60 mt-2 block">mesmo começando do zero.</span>
            </h1>

            {/* Preço */}
            <div className="bg-[#F0F9FF] rounded-2xl p-4 border-2 border-[#29B6F6]/20 mb-10">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="text-[#3D1D13]/50 text-[10px] font-bold uppercase line-through decoration-red-400 decoration-2">De R$ 99,90</p>
                  <div className="flex items-baseline gap-1 justify-center">
                    <span className="text-sm font-bold text-[#3D1D13]">R$</span>
                    <span className="text-4xl font-black text-[#29B6F6]">12,90</span>
                  </div>
                </div>
              </div>
            </div>

            {/* O que você recebe */}
            <div className="relative mb-8">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#29B6F6] text-white text-[10px] font-black uppercase px-4 py-1 rounded-full tracking-widest whitespace-nowrap z-20 shadow-sm">
                Você recebe agora:
              </div>
              <div className="bg-[#F0F9FF] rounded-[2rem] p-5 border-2 border-[#29B6F6]/20 relative overflow-hidden pt-8">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#FFC107]/10 rounded-bl-full -mr-4 -mt-4" />
                <div className="space-y-3 mt-2">
                  {[
                    { icon: "📘", color: "bg-[#D1F2EB]", text: "Manual das Fatias de Páscoa (produção + conservação + montagem)" },
                    { icon: "📊", color: "bg-[#FCF3CF]", text: "Planilha de Precificação por fatia (margem + embalagem + taxa)" },
                    { icon: "💬", color: "bg-[#D6EAF8]", text: "Scripts de WhatsApp pra fechar encomenda e pronta-entrega" },
                    { icon: "📸", color: "bg-[#F5EEF8]", text: "Guia de Foto e Cardápio (3 modelos prontos pra copiar)" },
                    { icon: "✅", color: "bg-[#E8F8F5]", text: "Checklist de produção (pra não virar caos na cozinha)" },
                  ].map((item, i) => (
                    <div key={i} className="bg-white p-3 rounded-xl shadow-sm border border-[#29B6F6]/10 flex items-center gap-3">
                      <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center text-xl shrink-0 border border-white shadow-sm`}>
                        {item.icon}
                      </div>
                      <p className="text-[13px] font-bold text-[#3D1D13] leading-tight text-left">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <CTAButton>Quero Começar</CTAButton>
          </div>
        </section>

        {/* ── A Matemática ── */}
        <section className="px-6 py-8 pl-10 relative z-10">
          <div className="bg-white rounded-[2rem] p-6 shadow-xl border-b-8 border-[#3D1D13]/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFC107]/20 rounded-bl-[4rem] -mr-4 -mt-4" />
            <div className="text-center mb-8 relative z-10">
              <h2 className="text-2xl text-[#3D1D13] font-display leading-tight">
                Como chegar aos <span className="text-[#29B6F6]">R$ 1.000</span> na prática
              </h2>
              <div className="w-16 h-1.5 bg-[#FFC107] mx-auto rounded-full mt-3" />
            </div>

            <div className="bg-[#F0F9FF] rounded-2xl p-6 mb-8 border-2 border-[#29B6F6]/20 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#29B6F6] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest">
                A Matemática
              </div>
              <div className="space-y-4">
                {[
                  { label: "Lucro por fatia", value: "R$ 8,00" },
                  { label: "Meta diária", value: "15 fatias" },
                  { label: "Período", value: "14 dias" },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-end border-b border-[#29B6F6]/10 pb-2">
                    <span className="text-sm font-medium text-[#3D1D13]/70">{row.label}</span>
                    <span className="font-bold text-[#3D1D13]">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <p className="text-[#3D1D13]/60 text-xs font-bold uppercase mb-1">Resultado:</p>
                <div className="bg-white rounded-xl p-3 shadow-sm border border-[#29B6F6]/20">
                  <p className="font-display text-xl text-[#3D1D13]">
                    210 fatias = <span className="text-[#FFC107] drop-shadow-sm">R$ 4.200</span>
                  </p>
                  <p className="text-[10px] font-bold text-[#3D1D13]/50 mt-1 uppercase tracking-wider">Faturamento Total</p>
                </div>
                <div className="mt-3 inline-block bg-[#3D1D13] text-white px-4 py-1 rounded-lg mb-3">
                  <p className="font-bold text-sm">~ R$ 1.680 de Lucro Líquido</p>
                </div>
                <p className="text-[10px] text-[#3D1D13]/60 font-medium leading-tight max-w-[260px] mx-auto">
                  Exemplo didático. O resultado depende do seu preço, margem e execução. Aqui você aprende a fazer a conta e aplicar.
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="font-bold text-[#3D1D13] text-center text-sm mb-4">O que você vai dominar:</h3>
              {[
                "Calculadora automática de precificação para nunca ter prejuízo.",
                "Estratégia de Pré-venda: Receba o sinal antes de gastar com material.",
                "Scripts de Venda validados para fechar pedidos no WhatsApp.",
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="mt-1"><Icons.Check /></div>
                  <p className="text-sm font-medium text-[#3D1D13]/80 leading-snug">{item}</p>
                </div>
              ))}
            </div>

            <div className="text-center p-4 bg-[#FFC107]/10 rounded-2xl border border-[#FFC107]/20">
              <p className="font-display text-[#3D1D13] text-lg leading-tight">
                "Não é sobre sorte.<br />É sobre estratégia."
              </p>
            </div>
          </div>
        </section>

        {/* ── Suporte ── */}
        <section className="px-6 py-8 pl-10">
          <div className="bg-white rounded-[2rem] p-6 shadow-xl border-b-8 border-[#3D1D13]/10">
            <div className="text-center mb-8">
              <h2 className="text-2xl text-[#3D1D13]">Você não está sozinha!</h2>
              <div className="w-16 h-1.5 bg-[#FFC107] mx-auto rounded-full mt-2" />
            </div>
            <div className="space-y-4">
              {[
                { bg: "bg-[#D1F2EB]", color: "text-[#29B6F6]", icon: <Icons.WhatsApp />, title: "Suporte no Zap", desc: "Dúvidas? Nossa equipe te ajuda em cada passo." },
                { bg: "bg-[#FCF3CF]", color: "text-[#F1C40F]", icon: <Icons.Chart />, title: "Planilha de Custos", desc: "Precifique corretamente para lucrar de verdade." },
                { bg: "bg-[#FADBD8]", color: "text-[#E74C3C]", icon: <Icons.Users />, title: "Treinamento Vendas", desc: "Scripts prontos para vender muito." },
              ].map((item, i) => (
                <div key={i} className="bg-[#F8FAFC] p-4 rounded-2xl border-2 border-dashed border-[#29B6F6]/30 flex gap-4 items-center">
                  <div className={`w-12 h-12 ${item.bg} rounded-full flex items-center justify-center ${item.color} shrink-0 border-2 border-white shadow-sm`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3D1D13] text-sm">{item.title}</h3>
                    <p className="text-[11px] text-[#3D1D13]/70 font-medium leading-tight">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Jornada do Lucro ── */}
        <section className="px-6 py-10 pl-10">
          <div className="text-center mb-10 text-white">
            <span className="font-bold text-[10px] uppercase tracking-[0.3em] opacity-80">A Estratégia</span>
            <h2 className="text-3xl mt-1 drop-shadow-md">Jornada do Lucro</h2>
          </div>
          <div className="relative">
            <div className="absolute left-[19px] top-4 bottom-4 w-1 border-l-4 border-dashed border-white/40" />
            <div className="space-y-6 relative">
              {roadmap.map((step, i) => (
                <div key={i} className="flex gap-4 items-center relative group">
                  <div className="w-10 h-10 rounded-full bg-[#FFC107] text-[#3D1D13] flex items-center justify-center font-black text-sm z-10 border-4 border-[#29B6F6] shadow-md shrink-0 group-hover:scale-110 transition-transform">
                    {roadmapEmojis[i]}
                  </div>
                  <div className="flex-1 bg-white p-4 rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,0.1)] group-hover:translate-x-1 transition-transform border border-white">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-[#3D1D13] text-sm">{step.title}</h4>
                      <span className="text-[9px] font-black bg-[#29B6F6] text-white px-1.5 py-0.5 rounded">{step.day}</span>
                    </div>
                    <p className="text-[11px] text-[#3D1D13]/70 font-medium leading-snug">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bônus Secreto ── */}
        <section className="px-6 py-8 pl-10">
          <div className="bg-[#3D1D13] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl transform rotate-1 border-4 border-white">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FFC107] rounded-full opacity-20" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg mb-4 text-[#3D1D13]">
                <Icons.Gift />
              </div>
              <h3 className="text-2xl font-black leading-none mb-2">Bônus Secreto</h3>
              <p className="text-white/80 text-sm font-medium mb-6 leading-relaxed">
                Script de "Cópia e Cola" para transformar curiosos em clientes no WhatsApp.
              </p>
              <div className="bg-[#FFC107] text-[#3D1D13] px-6 py-2 rounded-full font-black text-xs uppercase shadow-lg transform hover:scale-105 transition-transform cursor-default">
                Liberado Gratuitamente
              </div>
            </div>
          </div>
        </section>

        {/* ── Depoimentos ── */}
        <section className="py-12 pl-4">
          <div className="px-6 pl-10 mb-6">
            <h2 className="text-2xl text-white drop-shadow-md">Elas Começaram Assim</h2>
            <p className="text-white/80 text-sm font-medium">Resultados reais de alunas como você:</p>
          </div>
          <div className="flex overflow-x-auto gap-4 px-6 pl-10 no-scrollbar pb-8 snap-x snap-mandatory">
            {testimonials.map((t, i) => (
              <div key={i} className="flex-none w-[280px] snap-center">
                <div className="relative bg-white p-6 rounded-[2rem] shadow-lg flex flex-col h-full border border-[#3D1D13]/5 transform hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#FFC107]/20 flex items-center justify-center text-xl shadow-inner">
                      👩🏻‍🍳
                    </div>
                    <div>
                      <p className="font-bold text-[#3D1D13] leading-none text-sm">{t.name}</p>
                      <p className="text-[10px] text-[#3D1D13]/60 font-medium">{t.city}</p>
                    </div>
                  </div>
                  <div className="relative mb-6 flex-grow">
                    <span className="absolute -top-2 -left-1 text-4xl text-[#FFC107] opacity-40 font-serif leading-none">"</span>
                    <p className="text-[#3D1D13]/80 text-xs font-medium leading-relaxed italic relative z-10 pl-2">{t.text}</p>
                  </div>
                  <div className="mt-auto bg-[#F0F9FF] border border-[#29B6F6]/20 p-3 rounded-xl text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#29B6F6]" />
                    <p className="text-[9px] font-black text-[#29B6F6] uppercase tracking-wide mb-1">Resultado Real</p>
                    <p className="font-bold text-[#3D1D13] text-xs">{t.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Garantia ── */}
        <section className="px-6 py-8 pl-10">
          <div className="bg-[#F0F9FF] rounded-[2rem] p-8 shadow-xl border-4 border-white text-center flex flex-col items-center relative overflow-hidden">
            <Icons.Shield />
            <h2 className="text-xl font-bold text-[#3D1D13] mt-4 mb-2">Garantia Blindada</h2>
            <p className="text-[#3D1D13]/70 leading-relaxed font-medium text-sm mb-6">
              Você tem 7 dias para testar. Se decidir que não é para você, devolvemos 100% do seu dinheiro. Simples assim.
            </p>
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="w-full h-full bg-[#FFC107]" />
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="px-6 py-12 pl-10 bg-white rounded-t-[3rem] mt-8 shadow-[0_-10px_20px_rgba(0,0,0,0.1)] relative">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-20 h-8 bg-white rounded-t-full" />
          <div className="text-center mb-8">
            <h2 className="text-2xl text-[#3D1D13]">Dúvidas?</h2>
          </div>
          <div className="space-y-2">
            <FAQItem
              question="Mas já tem muita gente vendendo na Páscoa… não tá saturado?"
              answer={
                <div className="space-y-3">
                  <p>Tá "cheio" de gente vendendo o mesmo: ovo genérico, mesma foto, mesmo preço, mesma conversa no WhatsApp. Saturação não mata mercado. <strong>Mata preguiçoso.</strong></p>
                  <div>
                    <p className="mb-1">Fatias entram como vantagem porque:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>custam menos pra produzir,</li>
                      <li>vendem por impulso (pronta-entrega),</li>
                      <li>giram o dia inteiro,</li>
                      <li>e você consegue criar combo e aumentar ticket sem depender de "encomenda grande".</li>
                    </ul>
                  </div>
                  <p>Você não precisa dominar a cidade inteira. Precisa dominar um microterritório: trabalho, igreja, academia, salão, escola, condomínio.</p>
                </div>
              }
            />
            <FAQItem
              question="Ovo em fatia é moda mesmo? As pessoas compram?"
              answer={
                <div className="space-y-3">
                  <p><strong>Sim</strong> — porque é a solução perfeita pro brasileiro: quer comer Páscoa sem pagar uma fortuna.</p>
                  <p>A fatia é o "ovo gourmet" acessível: mesma sensação, mais prática, e dá pra comprar "só pra provar".</p>
                  <p>E tem outro detalhe: fatia é produto de giro, não de aposta. Você faz hoje, vende hoje.</p>
                </div>
              }
            />
            <FAQItem
              question="Mas não vai desvalorizar? Ovo é mais 'chique'…"
              answer={
                <div className="space-y-3">
                  <p>Quem desvaloriza é quem vende barato e sem apresentação.</p>
                  <p>Fatia bem montada + embalagem certa + foto certa vira <strong>gourmet</strong>, ponto.</p>
                  <p>E o chique de verdade é o que dá lucro com consistência, não o que dá trabalho e sobra recheio na geladeira.</p>
                </div>
              }
            />
          </div>
        </section>

        {/* ── CTA Final ── */}
        <section className="px-6 py-16 pl-10 text-center bg-white pb-32">
          <h2 className="text-3xl text-[#3D1D13] mb-8 leading-tight">
            Sua Páscoa Lucrativa <br />
            <span className="text-[#29B6F6]">começa aqui.</span>
          </h2>
          <div className="mb-10 relative inline-block">
            <div className="relative inline-flex flex-col bg-[#FFC107] px-8 py-6 rounded-[2rem] shadow-[4px_4px_0px_#3D1D13] border-2 border-[#3D1D13]">
              <p className="text-[#3D1D13] text-[10px] font-black uppercase tracking-[0.2em] mb-1">Valor Único</p>
              <div className="text-5xl font-black text-[#3D1D13] tracking-tighter">R$ 12,90</div>
            </div>
          </div>
          <div className="max-w-[300px] mx-auto">
            <CTAButton>Garantir Minha Vaga</CTAButton>
          </div>
          <div className="mt-8 flex justify-center gap-2 opacity-60">
            <Icons.Lock />
            <span className="text-xs font-bold text-[#3D1D13]">Compra Segura</span>
          </div>
        </section>
      </div>
    </>
  );
}
