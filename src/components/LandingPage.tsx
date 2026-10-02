import { ArrowRight, Compass, Package, Plane, Shield } from 'lucide-react';

interface LandingPageProps {
  onStart?: (role: 'remetente' | 'viajante') => void;
}

const malotexRepo = 'https://github.com/Udavisouzaa/flydrop';
const malahRepo = 'https://github.com/Udavisouzaa/MALAH';

export default function LandingPage(_props: LandingPageProps) {
  return (
    <div id="landing-page" className="min-h-screen bg-bg-darker text-gray-100 font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-purple/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[35%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-neon/10 blur-[150px] pointer-events-none" />

      <header className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 relative z-10">
        <a href="#inicio" className="flex items-center gap-3" aria-label="MALAH, voltar ao início">
          <span className="w-10 h-10 rounded-xl glow-btn flex items-center justify-center font-display font-extrabold text-white text-lg">M</span>
          <span className="font-display font-black text-2xl tracking-wider text-white">MALAH</span>
          <span className="hidden sm:inline text-xs text-gray-400 border border-white/10 rounded-full px-3 py-1">Arquivo de projeto</span>
        </a>
        <nav aria-label="Navegação principal" className="flex items-center gap-4 sm:gap-6 text-sm">
          <a href="#historia" className="text-gray-300 hover:text-white">História</a>
          <a href="#questoes" className="text-gray-300 hover:text-white">O que faltava validar</a>
          <a href={malotexRepo} className="px-4 py-2 rounded-lg glow-btn font-semibold text-white">Ver Malotex</a>
        </nav>
      </header>

      <main id="inicio" className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 lg:pt-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel text-xs text-brand-glow border border-brand-purple/25">
              <Compass className="w-4 h-4" /> Protótipo histórico · etapa inicial do Malotex
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              Da MALAH ao <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-glow to-brand-cyan">Malotex.</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl leading-relaxed font-light">
              A MALAH foi uma primeira exploração da ideia de conectar pessoas que precisam enviar itens a viajantes com trajetos compatíveis. Esta página conta a evolução do projeto. Não há cadastro, reservas ou serviço de envio em operação aqui.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#historia" className="px-7 py-4 rounded-xl glow-btn font-display font-bold text-white inline-flex items-center justify-center gap-3">
                Conhecer a trajetória <ArrowRight className="w-5 h-5" />
              </a>
              <a href={malotexRepo} className="px-7 py-4 rounded-xl glass-panel glass-panel-hover font-display font-bold text-gray-200 inline-flex items-center justify-center gap-3">
                Ver o projeto atual <Plane className="w-5 h-5 text-brand-cyan" />
              </a>
            </div>
          </div>

          <aside className="lg:col-span-5 glass-panel rounded-3xl p-7 sm:p-9 border border-brand-purple/20 shadow-2xl" aria-label="Evolução dos nomes">
            <div className="text-xs uppercase tracking-widest text-brand-glow mb-3">Um projeto, várias etapas</div>
            <h2 className="font-display text-2xl font-bold text-white mb-7">Como a ideia evoluiu</h2>
            <ol className="space-y-5">
              <li className="flex gap-4"><span className="text-brand-glow font-black">01</span><div><strong className="text-white">MALAH</strong><p className="text-gray-400 text-sm">Exploração inicial e landing page.</p></div></li>
              <li className="flex gap-4"><span className="text-brand-glow font-black">02</span><div><strong className="text-white">FlyDrop e LevAí</strong><p className="text-gray-400 text-sm">Nomes usados durante o desenvolvimento. O repositório técnico ainda se chama flydrop.</p></div></li>
              <li className="flex gap-4"><span className="text-brand-cyan font-black">03</span><div><strong className="text-white">Malotex</strong><p className="text-gray-400 text-sm">Nome definitivo do projeto e versão mais recente.</p></div></li>
            </ol>
          </aside>
        </section>

        <section id="historia" className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
          <div className="max-w-2xl mb-12">
            <div className="text-xs uppercase tracking-widest text-brand-glow mb-3">Estudo de caso</div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white mb-4">O que a MALAH explorou</h2>
            <p className="text-gray-400 leading-relaxed">Este repositório registra uma etapa de descoberta e prototipagem, sem métricas de uso ou resultados comerciais comprovados.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="glass-panel rounded-2xl p-7 border border-white/5 space-y-4">
              <Package className="w-7 h-7 text-brand-glow" />
              <h3 className="font-display text-xl font-bold text-white">Problema explorado</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Como aproximar uma necessidade de envio de uma viagem com trajeto compatível?</p>
            </article>
            <article className="glass-panel rounded-2xl p-7 border border-white/5 space-y-4">
              <Compass className="w-7 h-7 text-brand-cyan" />
              <h3 className="font-display text-xl font-bold text-white">O que foi prototipado</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Uma landing page, telas de cadastro e um simulador conceitual. Esses fluxos permanecem no histórico do código, sem cadastro público nesta página.</p>
            </article>
            <article className="glass-panel rounded-2xl p-7 border border-white/5 space-y-4">
              <Plane className="w-7 h-7 text-brand-glow" />
              <h3 className="font-display text-xl font-bold text-white">Evolução</h3>
              <p className="text-gray-400 text-sm leading-relaxed">A ideia continuou em outras versões e recebeu o nome definitivo de Malotex. O repositório atual documenta esse trabalho.</p>
            </article>
          </div>
        </section>

        <section id="questoes" className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
          <div className="max-w-2xl mb-12">
            <div className="text-xs uppercase tracking-widest text-brand-cyan mb-3">Próximas perguntas</div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white mb-4">O que precisava ser validado</h2>
            <p className="text-gray-400 leading-relaxed">Uma interface bonita não comprova que a operação funciona. Estas são perguntas que o conceito ainda precisaria responder.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="glass-panel rounded-2xl p-7 border border-white/5 space-y-4">
              <Compass className="w-7 h-7 text-brand-cyan" />
              <h3 className="font-display text-lg font-bold text-white">Demanda</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Há pessoas suficientes com trajetos e necessidades de envio compatíveis?</p>
            </article>
            <article className="glass-panel rounded-2xl p-7 border border-white/5 space-y-4">
              <Shield className="w-7 h-7 text-brand-glow" />
              <h3 className="font-display text-lg font-bold text-white">Confiança</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Como verificar identidade, bilhetes e itens permitidos antes de aproximar as partes?</p>
            </article>
            <article className="glass-panel rounded-2xl p-7 border border-white/5 space-y-4">
              <Package className="w-7 h-7 text-brand-cyan" />
              <h3 className="font-display text-lg font-bold text-white">Operação</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Como lidar com atrasos, suporte, pagamentos, disputas e reembolsos?</p>
            </article>
          </div>
          <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 glass-panel rounded-2xl p-7 border border-brand-purple/20">
            <p className="text-gray-300">Quer acompanhar a versão mais recente desta ideia?</p>
            <a href={malotexRepo} className="px-6 py-3 rounded-xl glow-btn font-semibold text-white inline-flex items-center gap-2">Conhecer Malotex <ArrowRight className="w-4 h-4" /></a>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 max-w-7xl mx-auto px-6 py-9 text-sm text-gray-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <span>MALAH — etapa histórica do projeto Malotex. Nenhum serviço é oferecido nesta página.</span>
        <div className="flex gap-5">
          <a href={malahRepo} className="hover:text-gray-200">Código da MALAH</a>
          <a href={malotexRepo} className="hover:text-gray-200">Projeto atual</a>
        </div>
      </footer>
    </div>
  );
}
