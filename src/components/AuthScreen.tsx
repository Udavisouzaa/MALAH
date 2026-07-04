import { useState, FormEvent } from 'react';
import { Mail, User, Phone, ArrowLeft, Loader2, Sparkles, Shield, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { db, isSupabaseConfigured } from '../db';

interface AuthScreenProps {
  initialRole: 'remetente' | 'viajante';
  onBack: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthScreen({ initialRole, onBack, onSuccess }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');
  const [role, setRole] = useState<'remetente' | 'viajante'>(initialRole);
  
  // Form states
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const supabaseActive = isSupabaseConfigured();

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!email) {
      setErrorMsg('Por favor, informe seu e-mail.');
      setLoading(false);
      return;
    }

    if (activeTab === 'register') {
      if (!name) {
        setErrorMsg('Por favor, informe seu nome completo.');
        setLoading(false);
        return;
      }
      if (!whatsapp) {
        setErrorMsg('Por favor, informe seu WhatsApp para matches.');
        setLoading(false);
        return;
      }
    }

    try {
      if (activeTab === 'register') {
        const profile = await db.registerUser(email, name, whatsapp, role);
        onSuccess(profile);
      } else {
        const profile = await db.loginUser(email);
        onSuccess(profile);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-screen" className="min-h-screen bg-bg-darker text-gray-100 font-sans flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      
      {/* Decorative background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-purple/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-neon/20 blur-[150px] pointer-events-none" />

      {/* Back button */}
      <button
        id="auth-back-btn"
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Database Integration Banner */}
      <div className="mb-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.02] border border-white/5 text-xs text-gray-400">
        <Database className={`w-3.5 h-3.5 ${supabaseActive ? 'text-green-400' : 'text-amber-400'}`} />
        <span>
          Banco de Dados:{' '}
          <strong>{supabaseActive ? 'Supabase Conectado' : 'Simulação Local Ativa'}</strong>
        </span>
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl glow-btn font-display font-black text-xl text-white mb-2 shadow-lg">
            M
          </div>
          <h2 className="font-display text-2xl font-black text-white tracking-tight">
            Seja bem-vindo à MALAH
          </h2>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            Conectando voos e entregas urgentes de forma inteligente e direta.
          </p>
        </div>

        {/* Auth Box Panel */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border-brand-purple/20 shadow-2xl space-y-6 relative">
          
          {/* Navigation tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-black/45 rounded-xl border border-white/5">
            <button
              id="tab-register-btn"
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
              }}
              className={`py-2.5 text-center text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-brand-purple/35 text-white shadow-inner'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Criar Conta
            </button>
            <button
              id="tab-login-btn"
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
              className={`py-2.5 text-center text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-brand-purple/35 text-white shadow-inner'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Entrar
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4 text-left">
            
            {/* Register specific fields */}
            {activeTab === 'register' && (
              <>
                {/* Full name */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-name" className="text-xs font-semibold text-gray-400 block">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      id="reg-name"
                      type="text"
                      placeholder="Ex: Lucas de Souza"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                    />
                  </div>
                </div>

                {/* Whatsapp */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-whatsapp" className="text-xs font-semibold text-gray-400 block">
                    WhatsApp (com DDD)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      id="reg-whatsapp"
                      type="tel"
                      placeholder="Ex: 11999999999"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 block leading-tight">
                    Seu número será compartilhado apenas quando houver match de entrega para iniciar o chat.
                  </span>
                </div>

                {/* Profile Choice */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-gray-400 block">
                    Seu Perfil Principal
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      id="role-remetente-btn"
                      type="button"
                      onClick={() => setRole('remetente')}
                      className={`py-3 px-4 rounded-xl border text-xs font-semibold transition-all ${
                        role === 'remetente'
                          ? 'border-brand-purple bg-brand-purple/20 text-white'
                          : 'border-white/5 bg-white/[0.02] text-gray-400 hover:bg-white/[0.04]'
                      }`}
                    >
                      Remetente (Quero Enviar)
                    </button>
                    <button
                      id="role-viajante-btn"
                      type="button"
                      onClick={() => setRole('viajante')}
                      className={`py-3 px-4 rounded-xl border text-xs font-semibold transition-all ${
                        role === 'viajante'
                          ? 'border-brand-purple bg-brand-purple/20 text-white'
                          : 'border-white/5 bg-white/[0.02] text-gray-400 hover:bg-white/[0.04]'
                      }`}
                    >
                      Viajante (Quero Levar)
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Email Address (Common) */}
            <div className="space-y-1.5">
              <label htmlFor="auth-email" className="text-xs font-semibold text-gray-400 block">
                E-mail
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="auth-email"
                  type="email"
                  placeholder="Ex: lucas@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                  required
                />
              </div>
            </div>

            {/* Error Message banner */}
            {errorMsg && (
              <div id="auth-error" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 leading-relaxed font-medium">
                {errorMsg}
              </div>
            )}

            {/* Action button */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl text-sm font-bold text-white glow-btn flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processando...
                </>
              ) : activeTab === 'register' ? (
                'Completar Cadastro'
              ) : (
                'Entrar no Painel'
              )}
            </button>

          </form>

          {/* Verification Disclaimer */}
          <div className="text-center pt-3 border-t border-white/5">
            <span className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3 text-brand-glow" /> 100% de conexões criptografadas e seguras
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
