import { useState } from 'react';
import { ArrowRight, Flame, Shield, TrendingUp, Compass, Clock, Package, Plane, Gift, Key, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onStart: (role: 'remetente' | 'viajante') => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  // Simulator states
  const [itemType, setItemType] = useState<'Documentos' | 'Chaves' | 'Presentes' | 'Outros'>('Documentos');
  const [urgency, setUrgency] = useState<'comum' | 'urgente'>('urgente');

  // Pricing Logic
  const priceMatrix = {
    Documentos: { comum: 80, urgente: 150 },
    Chaves: { comum: 70, urgente: 130 },
    Presentes: { comum: 120, urgente: 220 },
    Outros: { comum: 150, urgente: 280 }
  };

  const totalCost = priceMatrix[itemType][urgency];
  const travelerEarnings = Math.round(totalCost * 0.7); // 70% commission

  const itemIcons = {
    Documentos: <FileText className="w-5 h-5 text-brand-glow" />,
    Chaves: <Key className="w-5 h-5 text-brand-glow" />,
    Presentes: <Gift className="w-5 h-5 text-brand-glow" />,
    Outros: <Package className="w-5 h-5 text-brand-glow" />
  };

  return (
    <div id="landing-page" className="min-h-screen bg-bg-darker text-gray-100 font-sans relative overflow-hidden pb-16">
      
      {/* Decorative Blur Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-purple/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-neon/15 blur-[150px] pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] rounded-full bg-brand-cyan/5 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header id="header" className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl glow-btn flex items-center justify-center font-display font-extrabold text-white tracking-widest text-lg shadow-lg">
            M
          </div>
          <span className="font-display font-black text-2xl tracking-wider text-white bg-clip-text">
            MALAH
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            id="nav-login-btn"
            onClick={() => onStart('remetente')} 
            className="px-5 py-2 rounded-lg text-sm font-medium hover:text-brand-glow transition-colors text-gray-400"
          >
            Entrar no protótipo
          </button>
          <button 
            id="nav-register-btn"
            onClick={() => onStart('remetente')} 
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white glow-btn flex items-center gap-1"
          >
            Explorar <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main id="hero" className="max-w-7xl mx-auto px-6 pt-12 md:pt-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left: Value Proposition */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel text-xs text-brand-glow border-brand-purple/25 shadow-inner"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Protótipo histórico da ideia que evoluiu para Malotex</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-white"
          >
            Uma ideia para envios com <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-glow to-brand-cyan glow-text">viajantes.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-lg max-w-xl leading-relaxed font-light"
          >
            A MALAH explorou a conexão entre pessoas que precisam enviar itens e viajantes com espaço na bagagem. Esta página é um protótipo histórico, sem serviço de envio em operação.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 pt-2"
          >
            <button
              id="hero-send-btn"
              onClick={() => onStart('remetente')}
              className="px-8 py-4 rounded-xl font-display font-bold text-white glow-btn flex items-center justify-center gap-3 group text-base"
            >
              Explorar fluxo de envio
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            
            <button
              id="hero-travel-btn"
              onClick={() => onStart('viajante')}
              className="px-8 py-4 rounded-xl font-display font-bold text-gray-300 hover:text-white glass-panel glass-panel-hover flex items-center justify-center gap-3 text-base"
            >
              Explorar fluxo de viajante
              <Plane className="w-5 h-5 text-brand-cyan" />
            </button>
          </motion.div>

          {/* Social Proof Stats */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5"
          >
            <div>
              <div className="font-display text-2xl lg:text-3xl font-black text-brand-glow">MALAH</div>
              <div className="text-xs text-gray-400 font-medium">Etapa inicial</div>
            </div>
            <div>
              <div className="font-display text-2xl lg:text-3xl font-black text-brand-cyan">Malotex</div>
              <div className="text-xs text-gray-400 font-medium">Nome atual</div>
            </div>
            <div>
              <div className="font-display text-2xl lg:text-3xl font-black text-white">Protótipo</div>
              <div className="text-xs text-gray-400 font-medium">Sem operação</div>
            </div>
          </motion.div>
        </div>

        {/* Right: Simulator Widget */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-5"
        >
          <div className="glass-panel rounded-3xl p-6 sm:p-8 relative border-brand-purple/20 shadow-2xl">
            {/* Absolute indicator */}
            <div className="absolute top-4 right-4 text-xs font-mono text-gray-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Simulação ilustrativa
            </div>

            <h3 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-glow" />
              Exemplo conceitual de valores
            </h3>
            <p className="text-xs text-gray-400 mb-6">Valores fictícios para ilustrar a interface. Não são preços, prazos, comissões ou ganhos oferecidos.</p>

            {/* Step 1: Item Category */}
            <div className="space-y-3 mb-6">
              <label className="text-xs font-semibold tracking-wider uppercase text-gray-400 block text-left">
                1. O que você deseja enviar?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['Documentos', 'Chaves', 'Presentes', 'Outros'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setItemType(type)}
                    className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-sm font-medium transition-all text-left ${
                      itemType === type
                        ? 'border-brand-purple bg-brand-purple/15 text-white shadow-[0_0_15px_rgba(157,78,221,0.15)]'
                        : 'border-white/5 bg-white/[0.02] text-gray-400 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    {itemIcons[type]}
                    <span>{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Urgency */}
            <div className="space-y-3 mb-8">
              <label className="text-xs font-semibold tracking-wider uppercase text-gray-400 block text-left">
                2. Qual a urgência do envio?
              </label>
              <div className="grid grid-cols-2 gap-3">
                
                <button
                  onClick={() => setUrgency('comum')}
                  className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                    urgency === 'comum'
                      ? 'border-brand-purple bg-brand-purple/15 text-white shadow-[0_0_15px_rgba(157,78,221,0.15)]'
                      : 'border-white/5 bg-white/[0.02] text-gray-400 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <span className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Comum
                  </span>
                  <span className="text-[11px] text-gray-400 mt-1">Prazo não definido</span>
                </button>

                <button
                  onClick={() => setUrgency('urgente')}
                  className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                    urgency === 'urgente'
                      ? 'border-brand-purple bg-brand-purple/15 text-white shadow-[0_0_15px_rgba(157,78,221,0.15)]'
                      : 'border-white/5 bg-white/[0.02] text-gray-400 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <span className="text-xs font-semibold text-brand-glow flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-400" /> Urgente
                  </span>
                  <span className="text-[11px] text-gray-400 mt-1">Prazo não definido</span>
                </button>

              </div>
            </div>

            {/* Pricing Results */}
            <div className="bg-brand-neon/20 border border-brand-purple/10 rounded-2xl p-5 mb-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-sm text-gray-300">Valor hipotético do envio</span>
                <span className="font-display text-2xl font-black text-white glow-text">
                  R$ {totalCost}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-brand-cyan font-semibold block">Parcela hipotética do viajante</span>
                  <span className="text-[10px] text-gray-400">70% usados apenas nesta simulação</span>
                </div>
                <span className="font-display text-2xl font-black text-brand-cyan">
                  R$ {travelerEarnings}
                </span>
              </div>
            </div>

            <button
              id="simulator-action-btn"
              onClick={() => onStart('remetente')}
              className="w-full py-4 rounded-xl font-display font-bold text-white glow-btn text-center text-sm"
            >
              Explorar fluxo do protótipo
            </button>
          </div>
        </motion.div>
      </main>

      {/* Trust & Features Bento Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 pt-24">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <h2 className="font-display text-3xl font-black tracking-tight text-white">
            O que a ideia pretendia resolver?
          </h2>
          <p className="text-gray-400 text-sm">
            As funcionalidades abaixo eram hipóteses de produto. Sua disponibilidade e eficácia não foram comprovadas neste protótipo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-2xl p-6 text-left border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-glow">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-display text-lg font-bold text-white">Identidade e bilhetes</h4>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              Hipótese de validar a identidade dos viajantes e os bilhetes. Este protótipo não comprova uma verificação ativa.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 text-left border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-brand-cyan/20 flex items-center justify-center text-brand-cyan">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="font-display text-lg font-bold text-white">Acompanhamento da viagem</h4>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              Ideia de acompanhar as etapas da viagem e da entrega. Este protótipo não oferece rastreamento em tempo real.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 text-left border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="font-display text-lg font-bold text-white">Pagamentos e repasses</h4>
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              O fluxo de pagamento e repasse era uma hipótese. Custódia, segurança e liberação de valores não foram validadas neste protótipo.
            </p>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="max-w-7xl mx-auto px-6 mt-24 pt-8 border-t border-white/5 text-center text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>MALAH — protótipo histórico, etapa anterior do Malotex.</div>
        <div className="flex gap-6">
          <a href="https://github.com/Udavisouzaa/flydrop" className="hover:text-gray-300">Conheça o projeto atual: Malotex</a>
        </div>
      </footer>

    </div>
  );
}
