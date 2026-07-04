import { createClient } from '@supabase/supabase-js';

// Define structures
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  whatsapp: string;
  role: 'remetente' | 'viajante';
}

export interface Shipment {
  id: string;
  user_id: string;
  user_name?: string;
  user_whatsapp?: string;
  item_type: 'Documentos' | 'Chaves' | 'Presentes' | 'Outros';
  item_description?: string;
  origin: string;
  destination: string;
  urgency: 'comum' | 'urgente';
  price: number;
  status: 'Pendente' | 'Em Trânsito' | 'Entregue';
  created_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  user_name?: string;
  user_whatsapp?: string;
  flight_date: string;
  origin: string;
  destination: string;
  airline: string;
  status: 'Agendado' | 'Concluído';
  created_at: string;
}

// Read keys from environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize client if credentials exist
export const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Is using real Supabase?
export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};

// --- LOCAL STORAGE SIMULATION DATABASE ---
const STORAGE_PREFIX = 'malah_';

const getLocalData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(STORAGE_PREFIX + key);
  if (!data) return defaultValue;
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
      return defaultValue;
    }
    return parsed;
  } catch (e) {
    return defaultValue;
  }
};

const setLocalData = <T>(key: string, value: T): void => {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
};

// Seed default data if local database is empty
const seedLocalData = () => {
  const users = getLocalData<UserProfile[]>('users', []);
  if (users.length === 0) {
    const defaultUsers: UserProfile[] = [
      { id: 'usr-1', email: 'lucas@gmail.com', name: 'Lucas Silva', whatsapp: '5511999999999', role: 'viajante' },
      { id: 'usr-2', email: 'maria@gmail.com', name: 'Maria Santos', whatsapp: '5521988888888', role: 'remetente' },
      { id: 'usr-3', email: 'bruno@malah.com', name: 'Bruno Oliveira', whatsapp: '5511977777777', role: 'viajante' }
    ];
    setLocalData('users', defaultUsers);

    const defaultTrips: Trip[] = [
      {
        id: 'trip-1',
        user_id: 'usr-1',
        user_name: 'Lucas Silva',
        user_whatsapp: '5511999999999',
        flight_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
        origin: 'São Paulo (GRU)',
        destination: 'Rio de Janeiro (GIG)',
        airline: 'LATAM',
        status: 'Agendado',
        created_at: new Date().toISOString()
      },
      {
        id: 'trip-2',
        user_id: 'usr-3',
        user_name: 'Bruno Oliveira',
        user_whatsapp: '5511977777777',
        flight_date: new Date(Date.now() + 172800000).toISOString().split('T')[0], // 2 days from now
        origin: 'Belo Horizonte (CNF)',
        destination: 'Brasília (BSB)',
        airline: 'Azul',
        status: 'Agendado',
        created_at: new Date().toISOString()
      }
    ];
    setLocalData('trips', defaultTrips);

    const defaultShipments: Shipment[] = [
      {
        id: 'ship-1',
        user_id: 'usr-2',
        user_name: 'Maria Santos',
        user_whatsapp: '5521988888888',
        item_type: 'Documentos',
        item_description: 'Contrato Assinado de Compra',
        origin: 'Rio de Janeiro (GIG)',
        destination: 'São Paulo (GRU)',
        urgency: 'urgente',
        price: 180,
        status: 'Pendente',
        created_at: new Date().toISOString()
      }
    ];
    setLocalData('shipments', defaultShipments);
  }
};

// Auto-seed
seedLocalData();

// Current User State Management (Local helper since Supabase handles its own auth)
export const getActiveUserSession = (): UserProfile | null => {
  return getLocalData<UserProfile | null>('session_user', null);
};

export const setActiveUserSession = (user: UserProfile | null): void => {
  setLocalData('session_user', user);
};

// --- DATABASE OPERATIONS (UNIFIED CONTROLLER) ---

export const db = {
  // 1. AUTHENTICATION / USER PROFILE
  async registerUser(email: string, name: string, whatsapp: string, role: 'remetente' | 'viajante'): Promise<UserProfile> {
    const cleanedWhatsapp = whatsapp.replace(/\D/g, ''); // keep only numbers
    
    if (supabase) {
      try {
        // Sign up user via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: 'malah-temp-password-1234', // Since it's an MVP, we can bypass complex password setups
          options: {
            data: { name, whatsapp: cleanedWhatsapp, role }
          }
        });

        if (authError) throw authError;

        const userId = authData.user?.id || 'sup-' + Math.random().toString(36).substr(2, 9);
        const profile: UserProfile = {
          id: userId,
          email,
          name,
          whatsapp: cleanedWhatsapp,
          role
        };

        // Insert into custom profiles table
        const { error: dbError } = await supabase
          .from('profiles')
          .upsert({ id: userId, email, name, whatsapp: cleanedWhatsapp, role });

        if (dbError) {
          console.warn("Could not insert profile into Supabase profiles table, fallback active:", dbError);
        }

        return profile;
      } catch (err) {
        console.error('Supabase registration error, falling back to local database:', err);
      }
    }

    // Local Storage fallback
    const users = getLocalData<UserProfile[]>('users', []);
    
    // Check if user already exists
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return existing;
    }

    const newUser: UserProfile = {
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      name,
      whatsapp: cleanedWhatsapp,
      role
    };

    users.push(newUser);
    setLocalData('users', users);
    return newUser;
  },

  async loginUser(email: string): Promise<UserProfile> {
    if (supabase) {
      try {
        // Query profile from profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email.toLowerCase())
          .single();

        if (!error && data) {
          return {
            id: data.id,
            email: data.email,
            name: data.name,
            whatsapp: data.whatsapp,
            role: data.role
          };
        }
      } catch (err) {
        console.error('Supabase login error, falling back to local database:', err);
      }
    }

    // Local Storage fallback
    const users = getLocalData<UserProfile[]>('users', []);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Usuário não encontrado. Cadastre-se primeiro!');
    }
    return user;
  },

  async updateUserRole(userId: string, newRole: 'remetente' | 'viajante'): Promise<UserProfile> {
    // Sync local session user
    const currentSession = getActiveUserSession();
    if (currentSession && currentSession.id === userId) {
      currentSession.role = newRole;
      setActiveUserSession(currentSession);
    }

    if (supabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', userId);
        if (!error) {
          const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
          if (data) return data;
        }
      } catch (err) {
        console.error('Supabase role update error:', err);
      }
    }

    // Local Storage fallback
    const users = getLocalData<UserProfile[]>('users', []);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].role = newRole;
      setLocalData('users', users);
      return users[userIndex];
    }
    throw new Error('Usuário não encontrado.');
  },

  // 2. SHIPMENTS (ENCOMENDAS)
  async getShipments(userId?: string): Promise<Shipment[]> {
    if (supabase) {
      try {
        let query = supabase.from('shipments').select('*').order('created_at', { ascending: false });
        if (userId) {
          query = query.eq('user_id', userId);
        }
        const { data, error } = await query;
        if (!error && data) return data as Shipment[];
      } catch (err) {
        console.error('Supabase getShipments error, falling back to local storage:', err);
      }
    }

    // Local Storage fallback
    const shipments = getLocalData<Shipment[]>('shipments', []);
    if (userId) {
      return shipments.filter(s => s.user_id === userId);
    }
    return shipments;
  },

  async createShipment(shipment: Omit<Shipment, 'id' | 'created_at' | 'status'>): Promise<Shipment> {
    const newShipment: Shipment = {
      ...shipment,
      id: 'ship-' + Math.random().toString(36).substr(2, 9),
      status: 'Pendente',
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('shipments')
          .insert([newShipment])
          .select()
          .single();
        if (!error && data) return data as Shipment;
      } catch (err) {
        console.error('Supabase createShipment error, falling back to local storage:', err);
      }
    }

    // Local Storage fallback
    const shipments = getLocalData<Shipment[]>('shipments', []);
    shipments.unshift(newShipment);
    setLocalData('shipments', shipments);
    return newShipment;
  },

  async deleteShipment(id: string): Promise<void> {
    if (supabase) {
      try {
        const { error } = await supabase.from('shipments').delete().eq('id', id);
        if (!error) return;
      } catch (err) {
        console.error('Supabase deleteShipment error:', err);
      }
    }

    const shipments = getLocalData<Shipment[]>('shipments', []);
    const updated = shipments.filter(s => s.id !== id);
    setLocalData('shipments', updated);
  },

  // 3. TRIPS / FLIGHTS (VOOS / VIAGENS)
  async getTrips(userId?: string): Promise<Trip[]> {
    if (supabase) {
      try {
        let query = supabase.from('trips').select('*').order('flight_date', { ascending: true });
        if (userId) {
          query = query.eq('user_id', userId);
        }
        const { data, error } = await query;
        if (!error && data) return data as Trip[];
      } catch (err) {
        console.error('Supabase getTrips error, falling back to local storage:', err);
      }
    }

    // Local Storage fallback
    const trips = getLocalData<Trip[]>('trips', []);
    if (userId) {
      return trips.filter(t => t.user_id === userId);
    }
    return trips;
  },

  async createTrip(trip: Omit<Trip, 'id' | 'created_at' | 'status'>): Promise<Trip> {
    const newTrip: Trip = {
      ...trip,
      id: 'trip-' + Math.random().toString(36).substr(2, 9),
      status: 'Agendado',
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('trips')
          .insert([newTrip])
          .select()
          .single();
        if (!error && data) return data as Trip;
      } catch (err) {
        console.error('Supabase createTrip error, falling back to local storage:', err);
      }
    }

    // Local Storage fallback
    const trips = getLocalData<Trip[]>('trips', []);
    trips.unshift(newTrip);
    setLocalData('trips', trips);
    return newTrip;
  },

  async deleteTrip(id: string): Promise<void> {
    if (supabase) {
      try {
        const { error } = await supabase.from('trips').delete().eq('id', id);
        if (!error) return;
      } catch (err) {
        console.error('Supabase deleteTrip error:', err);
      }
    }

    const trips = getLocalData<Trip[]>('trips', []);
    const updated = trips.filter(t => t.id !== id);
    setLocalData('trips', updated);
  },

  // 4. MATCHES LOGIC
  // Se eu sou remetente e procuro viajantes, busca por voos com a mesma Origem e Destino.
  // Se eu sou viajante e procuro encomendas, busca por encomendas com a mesma Origem e Destino.
  async getMatches(userRole: 'remetente' | 'viajante', origin: string, destination: string): Promise<any[]> {
    const cleanStr = (s: string) => s.toLowerCase().replace(/\s*\([^)]*\)/g, '').trim(); // Remove brackets like "(GRU)"
    const origClean = cleanStr(origin);
    const destClean = cleanStr(destination);

    if (userRole === 'remetente') {
      // Shippers look for Trips (Travelers)
      const allTrips = await this.getTrips();
      return allTrips.filter(t => {
        const oMatch = cleanStr(t.origin).includes(origClean) || origClean.includes(cleanStr(t.origin));
        const dMatch = cleanStr(t.destination).includes(destClean) || destClean.includes(cleanStr(t.destination));
        return oMatch && dMatch;
      });
    } else {
      // Travelers look for Shipments (Shippers)
      const allShipments = await this.getShipments();
      return allShipments.filter(s => {
        const oMatch = cleanStr(s.origin).includes(origClean) || origClean.includes(cleanStr(s.origin));
        const dMatch = cleanStr(s.destination).includes(destClean) || destClean.includes(cleanStr(s.destination));
        return oMatch && dMatch && s.status === 'Pendente';
      });
    }
  }
};
