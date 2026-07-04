import { useState, useEffect, FormEvent } from 'react';
import { 
  Plane, Package, User, LogOut, Plus, Calendar, ArrowRight, RefreshCw, 
  MessageSquare, Trash2, ShieldCheck, MapPin, Tag, Clock, CheckCircle2,
  List, HelpCircle, AlertTriangle, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, UserProfile, Shipment, Trip } from '../db';
import { BRAZILIAN_AIRPORTS } from '../airports';

interface DashboardScreenProps {
  user: UserProfile;
  onLogout: () => void;
}

export default function DashboardScreen({ user, onLogout }: DashboardScreenProps) {
  // Navigation states
  const [activeTab, setActiveTab] = useState<'my_records' | 'matches'>('my_records');
  const [activeRole, setActiveRole] = useState<'remetente' | 'viajante'>(user.role);
  
  // Data states
  const [myShipments, setMyShipments] = useState<Shipment[]>([]);
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [allMatches, setAllMatches] = useState<any[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form: New Shipment (Remetente)
  const [shipmentItemType, setShipmentItemType] = useState<'Documentos' | 'Chaves' | 'Presentes' | 'Outros'>('Documentos');
  const [shipmentCustomItem, setShipmentCustomItem] = useState('');
  const [shipmentOrigin, setShipmentOrigin] = useState('');
  const [shipmentDestination, setShipmentDestination] = useState('');
  const [shipmentUrgency, setShipmentUrgency] = useState<'comum' | 'urgente'>('urgente');

  // Form: New Trip (Viajante)
  const [tripDate, setTripDate] = useState('');
  const [tripOrigin, setTripOrigin] = useState('');
  const [tripDestination, setTripDestination] = useState('');
  const [tripAirline, setTripAirline] = useState('LATAM');

  // Loading indicator for matches query
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Load User Data
  const loadData = async () => {
    setRefreshing(true);
    try {
      if (activeRole === 'remetente') {
        const data = await db.getShipments(user.id);
        setMyShipments(data);
      } else {
        const data = await db.getTrips(user.id);
        setMyTrips(data);
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Toggle user profile role
  const handleToggleRole = async () => {
    const nextRole = activeRole === 'remetente' ? 'viajante' : 'remetente';
    setRefreshing(true);
    try {
      const updatedUser = await db.updateUserRole(user.id, nextRole);
      setActiveRole(updatedUser.role);
    } catch (err) {
      console.error('Erro ao atualizar papel do usuário:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Run whenever activeRole or user changes
  useEffect(() => {
    loadData();
  }, [activeRole, user.id]);

  // Load matches
  const loadMatches = async () => {
    setLoadingMatches(true);
    try {
      if (activeRole === 'remetente') {
        // Shippers look for matches on each of their shipments
        const matchesPromises = myShipments.map(async (ship) => {
          const matchedTrips = await db.getMatches('remetente', ship.origin, ship.destination);
          return {
            shipment: ship,
            results: matchedTrips
          };
        });
        const resolved = await Promise.all(matchesPromises);
        setAllMatches(resolved);
      } else {
        // Travelers look for matches on each of their trips
        const matchesPromises = myTrips.map(async (trip) => {
          const matchedShipments = await db.getMatches('viajante', trip.origin, trip.destination);
          return {
            trip: trip,
            results: matchedShipments
          };
        });
        const resolved = await Promise.all(matchesPromises);
        setAllMatches(resolved);
      }
    } catch (err) {
      console.error('Erro ao carregar matches:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'matches') {
      loadMatches();
    }
  }, [activeTab, myShipments, myTrips, activeRole]);

  // Submitting forms
  const handleCreateRecord = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeRole === 'remetente') {
        if (!shipmentOrigin || !shipmentDestination) {
          alert('Por favor, informe Origem e Destino.');
          setLoading(false);
          return;
        }
        if (shipmentOrigin === shipmentDestination) {
          alert('A origem e o destino devem ser diferentes.');
          setLoading(false);
          return;
        }

        // Price simulation logic
        const pricing = {
          Documentos: { comum: 80, urgente: 150 },
          Chaves: { comum: 70, urgente: 130 },
          Presentes: { comum: 120, urgente: 220 },
          Outros: { comum: 150, urgente: 280 }
        };
        const calculatedPrice = pricing[shipmentItemType][shipmentUrgency];

        await db.createShipment({
          user_id: user.id,
          user_name: user.name,
          user_whatsapp: user.whatsapp,
          item_type: shipmentItemType,
          item_description: shipmentItemType === 'Outros' ? shipmentCustomItem : undefined,
          origin: shipmentOrigin,
          destination: shipmentDestination,
          urgency: shipmentUrgency,
          price: calculatedPrice
        });

        // Reset
        setShipmentCustomItem('');
        setIsModalOpen(false);
        loadData();
      } else {
        // Trip form validation
        if (!tripOrigin || !tripDestination || !tripDate) {
          alert('Por favor, preencha todos os campos do voo.');
          setLoading(false);
          return;
        }
        if (tripOrigin === tripDestination) {
          alert('A origem e o destino do voo devem ser diferentes.');
          setLoading(false);
          return;
        }

        await db.createTrip({
          user_id: user.id,
          user_name: user.name,
          user_whatsapp: user.whatsapp,
          flight_date: tripDate,
          origin: tripOrigin,
          destination: tripDestination,
          airline: tripAirline
        });

        setIsModalOpen(false);
        loadData();
      }
    } catch (err) {
      console.error('Erro ao salvar registro:', err);
      alert('Erro ao salvar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Deseja realmente remover este registro?')) return;
    try {
      if (activeRole === 'remetente') {
        await db.deleteShipment(id);
        setMyShipments(prev => prev.filter(s => s.id !== id));
      } else {
        await db.deleteTrip(id);
        setMyTrips(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // WhatsApp redirection API link builder
  const handleContactMatch = (matchedUser: any, myItem: any) => {
    const phone = matchedUser.user_whatsapp || matchedUser.whatsapp;
    if (!phone) {
      alert('Número do WhatsApp indisponível para este contato.');
      return;
    }

    let customText = '';
    if (activeRole === 'remetente') {
      // MyItem is shipment, matchedUser is traveler
      customText = `Olá ${matchedUser.user_name || 'viajante'}! Vi na plataforma MALAH que você tem um voo agendado de ${myItem.origin} para ${myItem.destination} em ${matchedUser.flight_date}. Eu preciso enviar um item (${myItem.item_type === 'Outros' ? myItem.item_description : myItem.item_type}) de urgência ${myItem.urgency}. Você tem interesse em realizar este transporte?`;
    } else {
      // MyItem is trip, matchedUser is shipment
      customText = `Olá ${matchedUser.user_name || 'remetente'}! Vi na plataforma MALAH que você precisa enviar um item (${matchedUser.item_type === 'Outros' ? matchedUser.item_description : matchedUser.item_type}) de ${matchedUser.origin} para ${matchedUser.destination} com urgência ${matchedUser.urgency}. Eu tenho um voo agendado para este mesmo trajeto na data de ${myItem.flight_date} e posso levá-lo. Podemos combinar os detalhes?`;
    }

    const encodedText = encodeURIComponent(customText);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
    
    // Open in a new window/tab safely inside iframe constraints
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div id="dashboard-layout" className="min-h-screen bg-bg-darker text-gray-100 font-sans flex flex-col md:flex-row relative">
      
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-purple/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-brand-neon/10 blur-[130px] pointer-events-none" />

      {/* ----------------- SIDEBAR DESKTOP ----------------- */}
      <aside className="hidden md:flex w-64 flex-col bg-black/40 border-r border-white/5 p-6 space-y-8 relative z-20">
        
        {/* Brand logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl glow-btn flex items-center justify-center font-display font-black text-white text-base">
            M
          </div>
          <span className="font-display font-black text-xl tracking-wider text-white">
            MALAH
          </span>
        </div>

        {/* User Card */}
        <div className="glass-panel p-4 rounded-2xl border-brand-purple/10 flex flex-col space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-glow font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left overflow-hidden">
              <div className="font-semibold text-sm text-white truncate">{user.name}</div>
              <div className="text-[10px] text-gray-400 truncate">{user.email}</div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex flex-col space-y-1">
            <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider text-left">
              Modo Atual
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                activeRole === 'remetente' ? 'bg-brand-purple/20 text-brand-glow' : 'bg-brand-cyan/20 text-brand-cyan'
              }`}>
                {activeRole === 'remetente' ? '✈️ Remetente' : '🎒 Viajante'}
              </span>
              <button
                id="toggle-role-btn-desktop"
                onClick={handleToggleRole}
                title="Mudar papel"
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Sidebar List */}
        <nav className="flex-1 space-y-2 text-left">
          <button
            id="nav-my-records-btn-desktop"
            onClick={() => setActiveTab('my_records')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'my_records'
                ? 'bg-brand-purple/20 text-white border-l-4 border-brand-purple'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Meus Registros</span>
          </button>

          <button
            id="nav-matches-btn-desktop"
            onClick={() => setActiveTab('matches')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'matches'
                ? 'bg-brand-purple/20 text-white border-l-4 border-brand-purple'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Conexões / Matches</span>
            {/* Matches badge simple count indicator */}
            <span className="ml-auto w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
          </button>
        </nav>

        {/* Footer actions */}
        <div className="pt-4 border-t border-white/5 text-left">
          <button
            id="logout-btn-desktop"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </aside>

      {/* ----------------- MOBILE HEADER ----------------- */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-black/50 border-b border-white/5 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg glow-btn flex items-center justify-center font-display font-black text-white text-xs">
            M
          </div>
          <span className="font-display font-black text-md tracking-wider text-white">
            MALAH
          </span>
        </div>

        {/* Quick actions & Profile */}
        <div className="flex items-center gap-3">
          <button
            id="toggle-role-btn-mobile-header"
            onClick={handleToggleRole}
            className={`text-xs font-bold px-2 py-1 rounded-lg border ${
              activeRole === 'remetente' ? 'border-brand-purple/30 bg-brand-purple/10 text-brand-glow' : 'border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan'
            }`}
          >
            {activeRole === 'remetente' ? 'Remetente' : 'Viajante'} ⇄
          </button>
          <button
            id="logout-btn-mobile-header"
            onClick={onLogout}
            className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-red-400"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ----------------- CORE VIEW CONTENT ----------------- */}
      <main className="flex-1 p-4 md:p-8 space-y-6 pb-24 md:pb-8 relative z-10 overflow-x-hidden">
        
        {/* Welcome Banner */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-left">
            <h1 className="font-display text-2xl md:text-3xl font-black text-white tracking-tight">
              Olá, {user.name.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-400 text-xs md:text-sm">
              {activeRole === 'remetente' 
                ? 'Cadastre encomendas urgentes para que viajantes as levem em voos nacionais.'
                : 'Cadastre suas próximas viagens aéreas para receber propostas de transporte de encomendas.'
              }
            </p>
          </div>

          <div className="flex gap-2">
            <button
              id="refresh-btn"
              onClick={activeTab === 'matches' ? loadMatches : loadData}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-xs font-semibold hover:bg-white/[0.05] flex items-center gap-1.5 transition-all text-gray-300 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Sincronizar
            </button>

            <button
              id="new-record-btn"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white glow-btn flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {activeRole === 'remetente' ? 'Novo Envio' : 'Novo Voo'}
            </button>
          </div>
        </section>

        {/* Interactive Stats Dashboard Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl border-white/5 text-left">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Seu Papel</span>
            <span className="text-sm font-black text-white mt-1 block">
              {activeRole === 'remetente' ? 'Remetente' : 'Viajante'}
            </span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border-white/5 text-left">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">
              {activeRole === 'remetente' ? 'Envios Ativos' : 'Voos Cadastrados'}
            </span>
            <span className="text-sm font-black text-brand-glow mt-1 block">
              {activeRole === 'remetente' ? myShipments.length : myTrips.length}
            </span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border-white/5 text-left">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Comissão Base</span>
            <span className="text-sm font-black text-brand-cyan mt-1 block">70% Líquido</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border-white/5 text-left">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Canal de Contato</span>
            <span className="text-xs font-black text-green-400 mt-1 block flex items-center gap-1">
              WhatsApp Link ✅
            </span>
          </div>
        </section>

        {/* ----------------- RENDERING: TAB MY RECORDS ----------------- */}
        {activeTab === 'my_records' && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-lg font-bold text-white">
                {activeRole === 'remetente' ? 'Minhas Encomendas' : 'Minhas Viagens de Voo'}
              </h2>
            </div>

            {/* If Remetente List */}
            {activeRole === 'remetente' && (
              <>
                {myShipments.length === 0 ? (
                  <div className="glass-panel rounded-3xl p-12 text-center border-dashed border-brand-purple/20 max-w-lg mx-auto space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 flex items-center justify-center text-brand-glow mx-auto">
                      <Package className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-white font-bold text-md">Nenhuma encomenda cadastrada</h4>
                      <p className="text-gray-400 text-xs font-light max-w-xs mx-auto">
                        Clique no botão "Novo Envio" acima para simular e registrar sua encomenda urgente para encontrar viajantes!
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Desktop table layout */}
                    <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/5 bg-black/10">
                      <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-white/[0.02] text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-white/5">
                          <tr>
                            <th className="px-6 py-4">Item</th>
                            <th className="px-6 py-4">De ➔ Para</th>
                            <th className="px-6 py-4">Urgência</th>
                            <th className="px-6 py-4">Custo</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {myShipments.map((ship) => (
                            <tr key={ship.id} className="hover:bg-white/[0.01]">
                              <td className="px-6 py-4">
                                <div className="font-bold text-white text-sm">{ship.item_type}</div>
                                {ship.item_description && (
                                  <div className="text-xs text-gray-500 italic mt-0.5">{ship.item_description}</div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5 font-medium">
                                  <span>{ship.origin}</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-brand-glow" />
                                  <span>{ship.destination}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                  ship.urgency === 'urgente' 
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/15' 
                                    : 'bg-gray-500/10 text-gray-400 border border-white/5'
                                }`}>
                                  {ship.urgency === 'urgente' ? '🔥 Urgente' : '⏳ Comum'}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-mono font-bold text-white">R$ {ship.price}</td>
                              <td className="px-6 py-4">
                                <span className="flex items-center gap-1 text-xs text-amber-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                  {ship.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  id={`delete-shipment-desktop-${ship.id}`}
                                  onClick={() => handleDeleteRecord(ship.id)}
                                  className="p-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/15 text-red-400 hover:text-red-300 transition-colors inline-flex"
                                  title="Remover"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile responsive cards layout */}
                    <div className="md:hidden space-y-3">
                      {myShipments.map((ship) => (
                        <div key={ship.id} className="glass-panel p-4 rounded-2xl border-white/5 space-y-4 text-left">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-xs text-gray-500 font-mono">ID: {ship.id.substring(5, 9).toUpperCase()}</div>
                              <h4 className="font-bold text-white text-md mt-0.5">{ship.item_type}</h4>
                              {ship.item_description && (
                                <p className="text-xs text-gray-400 italic mt-0.5">{ship.item_description}</p>
                              )}
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              ship.urgency === 'urgente' ? 'bg-red-500/10 text-red-400 border border-red-500/15' : 'bg-gray-500/10 text-gray-400 border border-white/5'
                            }`}>
                              {ship.urgency === 'urgente' ? '🔥 Urgente' : '⏳ Comum'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs border-y border-white/5 py-3">
                            <div>
                              <span className="text-gray-500 block uppercase text-[9px] font-semibold">De</span>
                              <span className="text-white font-semibold">{ship.origin}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block uppercase text-[9px] font-semibold">Para</span>
                              <span className="text-white font-semibold">{ship.destination}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-1">
                            <div>
                              <span className="text-xs text-gray-500 block">Custo</span>
                              <span className="font-mono font-bold text-white text-md">R$ {ship.price}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                {ship.status}
                              </span>
                              <button
                                id={`delete-shipment-mobile-${ship.id}`}
                                onClick={() => handleDeleteRecord(ship.id)}
                                className="p-2 rounded-xl bg-red-500/5 text-red-400"
                                title="Remover"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* If Viajante List */}
            {activeRole === 'viajante' && (
              <>
                {myTrips.length === 0 ? (
                  <div className="glass-panel rounded-3xl p-12 text-center border-dashed border-brand-purple/20 max-w-lg mx-auto space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan mx-auto">
                      <Plane className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-white font-bold text-md">Nenhuma viagem de voo cadastrada</h4>
                      <p className="text-gray-400 text-xs font-light max-w-xs mx-auto">
                        Clique no botão "Novo Voo" acima para cadastrar seu bilhete aéreo e começar a receber matches de encomendas!
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Desktop table layout */}
                    <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/5 bg-black/10">
                      <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-white/[0.02] text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-white/5">
                          <tr>
                            <th className="px-6 py-4">Data do Voo</th>
                            <th className="px-6 py-4">Rota de Voos (De ➔ Para)</th>
                            <th className="px-6 py-4">Companhia Aérea</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {myTrips.map((trip) => (
                            <tr key={trip.id} className="hover:bg-white/[0.01]">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2 font-mono text-white font-bold text-sm">
                                  <Calendar className="w-4 h-4 text-brand-cyan" />
                                  <span>{trip.flight_date}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5 font-medium">
                                  <span>{trip.origin}</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-brand-cyan" />
                                  <span>{trip.destination}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="bg-white/[0.04] text-xs font-semibold px-2.5 py-1 rounded-lg border border-white/5 text-gray-300">
                                  {trip.airline}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="flex items-center gap-1.5 text-xs text-green-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                                  {trip.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  id={`delete-trip-desktop-${trip.id}`}
                                  onClick={() => handleDeleteRecord(trip.id)}
                                  className="p-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/15 text-red-400 hover:text-red-300 transition-colors inline-flex"
                                  title="Remover"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile responsive cards layout */}
                    <div className="md:hidden space-y-3">
                      {myTrips.map((trip) => (
                        <div key={trip.id} className="glass-panel p-4 rounded-2xl border-white/5 space-y-4 text-left">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-brand-cyan" />
                              <span className="font-mono text-white font-bold text-sm">{trip.flight_date}</span>
                            </div>
                            <span className="bg-white/5 text-gray-400 text-[10px] font-semibold px-2 py-0.5 rounded border border-white/5">
                              {trip.airline}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs border-y border-white/5 py-3">
                            <div>
                              <span className="text-gray-500 block uppercase text-[9px] font-semibold">De</span>
                              <span className="text-white font-semibold">{trip.origin}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block uppercase text-[9px] font-semibold">Para</span>
                              <span className="text-white font-semibold">{trip.destination}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-1">
                            <span className="flex items-center gap-1.5 text-xs text-green-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                              {trip.status}
                            </span>
                            <button
                              id={`delete-trip-mobile-${trip.id}`}
                              onClick={() => handleDeleteRecord(trip.id)}
                              className="p-2 rounded-xl bg-red-500/5 text-red-400"
                              title="Remover"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </section>
        )}

        {/* ----------------- RENDERING: TAB MATCHES ----------------- */}
        {activeTab === 'matches' && (
          <section className="space-y-4 text-left">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-display text-lg font-bold text-white">Conexões Inteligentes / Matches</h2>
                <p className="text-xs text-gray-500">
                  {activeRole === 'remetente'
                    ? 'Buscando viajantes cadastrados para as mesmas rotas de suas encomendas.'
                    : 'Buscando encomendas pendentes correspondentes ao seu trajeto aéreo.'
                  }
                </p>
              </div>
            </div>

            {loadingMatches ? (
              <div className="glass-panel p-12 rounded-3xl text-center flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-brand-cyan animate-spin" />
                <span className="text-sm text-gray-400 font-medium">Buscando conexões automáticas na base de dados...</span>
              </div>
            ) : allMatches.length === 0 ? (
              <div className="glass-panel rounded-3xl p-12 text-center border-dashed border-brand-purple/20 max-w-lg mx-auto space-y-4">
                <HelpCircle className="w-12 h-12 text-gray-500 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-white font-bold text-md">Nenhuma correspondência</h4>
                  <p className="text-gray-400 text-xs font-light">
                    Você precisa primeiro cadastrar registros ativos (encomendas ou viagens) no painel para que possamos cruzar as rotas aéreas automáticas!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {allMatches.map((matchItem, index) => {
                  const subject = activeRole === 'remetente' ? matchItem.shipment : matchItem.trip;
                  const results = matchItem.results || [];

                  return (
                    <div key={index} className="space-y-3">
                      
                      {/* Subtitle Header showing original reference item */}
                      <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-xs text-gray-400">
                        {activeRole === 'remetente' ? (
                          <>
                            <Package className="w-3.5 h-3.5 text-brand-glow" />
                            <span>
                              Matches para encomenda de <strong>{subject.item_type}</strong> (De: {subject.origin} Para: {subject.destination})
                            </span>
                          </>
                        ) : (
                          <>
                            <Plane className="w-3.5 h-3.5 text-brand-cyan" />
                            <span>
                              Matches para seu voo dia <strong>{subject.flight_date}</strong> (De: {subject.origin} Para: {subject.destination})
                            </span>
                          </>
                        )}
                      </div>

                      {/* Discovered results */}
                      {results.length === 0 ? (
                        <div className="p-4 rounded-2xl bg-white/[0.01] border border-dashed border-white/5 text-center text-xs text-gray-500 italic">
                          Nenhum viajante ou remetente correspondente para esta rota até o momento.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {results.map((res: any) => (
                            <div 
                              key={res.id} 
                              className="glass-panel p-5 rounded-2xl border-brand-purple/10 flex flex-col justify-between space-y-4 relative overflow-hidden"
                            >
                              {/* Highlight glow accent */}
                              <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-cyan" />
                              
                              <div className="text-left space-y-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-brand-cyan/10 flex items-center justify-center font-bold text-xs text-brand-cyan">
                                      {res.user_name ? res.user_name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-sm text-white">{res.user_name || 'Usuário Verificado'}</h5>
                                      <span className="text-[10px] text-gray-400 font-mono">ID: {res.id.substring(5, 9).toUpperCase()}</span>
                                    </div>
                                  </div>

                                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    ✓ Verificado
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-3">
                                  {activeRole === 'remetente' ? (
                                    <>
                                      <div>
                                        <span className="text-gray-500 block uppercase text-[9px] font-semibold">Data do Voo</span>
                                        <span className="text-white font-semibold flex items-center gap-1 mt-0.5">
                                          <Calendar className="w-3.5 h-3.5 text-brand-cyan" /> {res.flight_date}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500 block uppercase text-[9px] font-semibold">Cia Aérea</span>
                                        <span className="text-white font-semibold block mt-0.5">{res.airline}</span>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div>
                                        <span className="text-gray-500 block uppercase text-[9px] font-semibold">Item Encomenda</span>
                                        <span className="text-white font-semibold block mt-0.5">
                                          {res.item_type}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500 block uppercase text-[9px] font-semibold">Ganhos</span>
                                        <span className="text-brand-cyan font-bold block mt-0.5">
                                          R$ {Math.round(res.price * 0.7)}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                <span className="text-[10px] text-gray-500">Comunicação via WhatsApp</span>
                                <button
                                  id={`contact-match-btn-${res.id}`}
                                  onClick={() => handleContactMatch(res, subject)}
                                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  Iniciar Chat
                                </button>
                              </div>

                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

      </main>

      {/* ----------------- MOBILE BOTTOM NAV ----------------- */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 border-t border-white/10 py-2 px-6 flex justify-around items-center z-30 backdrop-blur-lg">
        <button
          id="nav-my-records-btn-mobile"
          onClick={() => setActiveTab('my_records')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${
            activeTab === 'my_records' ? 'text-brand-glow bg-white/5' : 'text-gray-500'
          }`}
        >
          <List className="w-5 h-5" />
          <span className="text-[10px] font-bold">Meus Registros</span>
        </button>

        <button
          id="nav-new-record-btn-mobile"
          onClick={() => setIsModalOpen(true)}
          className="w-12 h-12 rounded-full glow-btn text-white flex items-center justify-center shadow-lg transform -translate-y-4 border-4 border-bg-darker"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          id="nav-matches-btn-mobile"
          onClick={() => setActiveTab('matches')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${
            activeTab === 'matches' ? 'text-brand-cyan bg-white/5' : 'text-gray-500'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-brand-cyan animate-ping" />
          </div>
          <span className="text-[10px] font-bold">Matches</span>
        </button>
      </footer>

      {/* ----------------- NEW RECORD MODAL ----------------- */}
      <AnimatePresence>
        {isModalOpen && (
          <div id="new-record-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Modal Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Body Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 relative border-brand-purple/20 shadow-2xl overflow-y-auto max-h-[90vh] z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  {activeRole === 'remetente' ? (
                    <>
                      <Package className="w-5 h-5 text-brand-glow" /> Cadastrar Nova Encomenda
                    </>
                  ) : (
                    <>
                      <Plane className="w-5 h-5 text-brand-cyan" /> Cadastrar Novo Voo
                    </>
                  )}
                </h3>
                <button
                  id="close-modal-btn"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Dynamic form based on role */}
              <form onSubmit={handleCreateRecord} className="space-y-4 text-left">
                
                {/* REMETENTE FORM FIELDS */}
                {activeRole === 'remetente' ? (
                  <>
                    <div className="space-y-1.5">
                      <label htmlFor="shipment-item-type" className="text-xs font-semibold text-gray-400 block">
                        Categoria do Item
                      </label>
                      <select
                        id="shipment-item-type"
                        value={shipmentItemType}
                        onChange={(e) => setShipmentItemType(e.target.value as any)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-purple"
                      >
                        <option value="Documentos">Documentos</option>
                        <option value="Chaves">Chaves</option>
                        <option value="Presentes">Presentes</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>

                    {shipmentItemType === 'Outros' && (
                      <div className="space-y-1.5">
                        <label htmlFor="shipment-custom-item" className="text-xs font-semibold text-gray-400 block">
                          Especifique o item
                        </label>
                        <input
                          id="shipment-custom-item"
                          type="text"
                          placeholder="Ex: Óculos de Grau, Carregador de Notebook..."
                          value={shipmentCustomItem}
                          onChange={(e) => setShipmentCustomItem(e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-purple"
                          required
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="shipment-origin" className="text-xs font-semibold text-gray-400 block">
                          Origem
                        </label>
                        <select
                          id="shipment-origin"
                          value={shipmentOrigin}
                          onChange={(e) => setShipmentOrigin(e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-purple"
                          required
                        >
                          <option value="">Selecione...</option>
                          {BRAZILIAN_AIRPORTS.map((air) => (
                            <option key={`orig-${air.code}`} value={air.name}>
                              {air.city} ({air.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="shipment-destination" className="text-xs font-semibold text-gray-400 block">
                          Destino
                        </label>
                        <select
                          id="shipment-destination"
                          value={shipmentDestination}
                          onChange={(e) => setShipmentDestination(e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-purple"
                          required
                        >
                          <option value="">Selecione...</option>
                          {BRAZILIAN_AIRPORTS.map((air) => (
                            <option key={`dest-${air.code}`} value={air.name}>
                              {air.city} ({air.code})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400 block">
                        Urgência do Envio
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          id="urgency-comum-btn"
                          type="button"
                          onClick={() => setShipmentUrgency('comum')}
                          className={`py-3 px-4 rounded-xl border text-xs font-semibold text-center transition-all ${
                            shipmentUrgency === 'comum'
                              ? 'border-brand-purple bg-brand-purple/20 text-white'
                              : 'border-white/5 bg-white/[0.02] text-gray-400'
                          }`}
                        >
                          ⏳ Comum (Até 3 dias)
                        </button>
                        <button
                          id="urgency-urgente-btn"
                          type="button"
                          onClick={() => setShipmentUrgency('urgente')}
                          className={`py-3 px-4 rounded-xl border text-xs font-semibold text-center transition-all ${
                            shipmentUrgency === 'urgente'
                              ? 'border-brand-purple bg-brand-purple/20 text-white shadow'
                              : 'border-white/5 bg-white/[0.02] text-gray-400'
                          }`}
                        >
                          🔥 Urgente (Mesmo Dia)
                        </button>
                      </div>
                    </div>

                    {/* Pre-pricing preview inside modal */}
                    <div className="p-4 rounded-xl bg-brand-neon/15 border border-brand-purple/10 text-center">
                      <span className="text-xs text-gray-400 block">Valor da Simulação Estimada</span>
                      <span className="font-display text-xl font-bold text-white mt-1 block">
                        R${' '}
                        {
                          {
                            Documentos: { comum: 80, urgente: 150 },
                            Chaves: { comum: 70, urgente: 130 },
                            Presentes: { comum: 120, urgente: 220 },
                            Outros: { comum: 150, urgente: 280 }
                          }[shipmentItemType][shipmentUrgency]
                        }
                      </span>
                    </div>
                  </>
                ) : (
                  
                  /* VIAJANTE FORM FIELDS */
                  <>
                    <div className="space-y-1.5">
                      <label htmlFor="trip-date" className="text-xs font-semibold text-gray-400 block">
                        Data do Voo
                      </label>
                      <input
                        id="trip-date"
                        type="date"
                        value={tripDate}
                        onChange={(e) => setTripDate(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-purple"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="trip-origin" className="text-xs font-semibold text-gray-400 block">
                          Aeroporto de Origem
                        </label>
                        <select
                          id="trip-origin"
                          value={tripOrigin}
                          onChange={(e) => setTripOrigin(e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-purple"
                          required
                        >
                          <option value="">Selecione...</option>
                          {BRAZILIAN_AIRPORTS.map((air) => (
                            <option key={`trip-orig-${air.code}`} value={air.name}>
                              {air.city} ({air.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="trip-destination" className="text-xs font-semibold text-gray-400 block">
                          Aeroporto de Destino
                        </label>
                        <select
                          id="trip-destination"
                          value={tripDestination}
                          onChange={(e) => setTripDestination(e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-purple"
                          required
                        >
                          <option value="">Selecione...</option>
                          {BRAZILIAN_AIRPORTS.map((air) => (
                            <option key={`trip-dest-${air.code}`} value={air.name}>
                              {air.city} ({air.code})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="trip-airline" className="text-xs font-semibold text-gray-400 block">
                        Companhia Aérea
                      </label>
                      <select
                        id="trip-airline"
                        value={tripAirline}
                        onChange={(e) => setTripAirline(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-purple"
                      >
                        <option value="LATAM">LATAM Airlines</option>
                        <option value="GOL">GOL Linhas Aéreas</option>
                        <option value="Azul">Azul Linhas Aéreas</option>
                        <option value="Passaredo">VoePass</option>
                        <option value="Outra">Outra</option>
                      </select>
                    </div>

                    <div className="p-4 rounded-xl bg-brand-cyan/15 border border-brand-cyan/10 text-left text-xs text-gray-300 space-y-1">
                      <span className="font-bold text-white block">Regra de Segurança:</span>
                      Ao cadastrar seu voo, você concorda que todas as encomendas transportadas passarão por verificação visual de conteúdo antes do embarque.
                    </div>
                  </>
                )}

                <button
                  id="submit-record-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full py-4.5 rounded-xl font-display font-bold text-white glow-btn text-center text-sm cursor-pointer"
                >
                  {loading ? 'Cadastrando...' : 'Confirmar Registro'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
