import { create } from 'zustand';

import { hasSupabaseConfig, supabase } from '../services/supabase';
import { Bus, BusRow, BusStatus } from '../types/bus';

type BusFilter = {
  status?: BusStatus | 'TODOS';
  lineNumber?: string;
  busNumber?: string;
};

type ProfileRow = {
  id: string;
  name: string;
  email: string;
};

type BusState = {
  buses: Bus[];
  isLoading: boolean;
  error: string;
  fetchBuses: (filter?: BusFilter) => Promise<void>;
  addBus: (data: { busNumber: string; lineNumber: string; status: BusStatus; userId: string }) => Promise<Bus | null>;
  updateBus: (busId: string, data: { lineNumber: string; status: BusStatus }) => Promise<void>;
  deleteBus: (busId: string, currentUserId: string) => Promise<boolean>;
  getRecentBuses: () => Bus[];
  getLatestBuses: () => Bus[];
  getBusesByUser: (userId: string) => Bus[];
  getUserBuses: (userId: string) => Bus[];
  filterBuses: (filter: BusFilter) => Bus[];
};

const byUpdatedAt = (a: Bus, b: Bus) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
const byCreatedAt = (a: Bus, b: Bus) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

const mapBus = (row: BusRow, profiles: ProfileRow[] = []): Bus => {
  const creator = profiles.find((profile) => profile.id === row.created_by);

  return {
    id: row.id,
    busNumber: row.bus_number,
    lineNumber: row.line_number,
    status: row.status,
    userId: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    creatorName: creator?.name,
    creatorEmail: creator?.email,
  };
};

const fetchProfilesForBuses = async (rows: BusRow[]) => {
  const ids = Array.from(new Set(rows.map((row) => row.created_by).filter(Boolean)));

  if (ids.length === 0) {
    return [];
  }

  const { data } = await supabase.from('profiles').select('id,name,email').in('id', ids);
  return (data ?? []) as ProfileRow[];
};

export const useBusStore = create<BusState>((set, get) => ({
  buses: [],
  isLoading: false,
  error: '',
  fetchBuses: async (filter = {}) => {
    if (!hasSupabaseConfig) {
      set({ error: 'Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.' });
      return;
    }

    set({ isLoading: true, error: '' });

    let query = supabase.from('buses').select('id,bus_number,line_number,status,created_by,created_at,updated_at').order('updated_at', {
      ascending: false,
    });

    if (filter.status && filter.status !== 'TODOS') {
      query = query.eq('status', filter.status);
    }

    if (filter.lineNumber?.trim()) {
      query = query.ilike('line_number', `%${filter.lineNumber.trim()}%`);
    }

    if (filter.busNumber?.trim()) {
      query = query.ilike('bus_number', `%${filter.busNumber.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      set({ isLoading: false, error: error.message });
      return;
    }

    const rows = (data ?? []) as BusRow[];
    const profiles = await fetchProfilesForBuses(rows);

    set({ buses: rows.map((row) => mapBus(row, profiles)), isLoading: false, error: '' });
  },
  addBus: async ({ busNumber, lineNumber, status, userId }) => {
    const { data, error } = await supabase
      .from('buses')
      .insert({
        bus_number: busNumber.trim(),
        line_number: lineNumber.trim(),
        status,
        created_by: userId,
      })
      .select('id,bus_number,line_number,status,created_by,created_at,updated_at')
      .single();

    if (error || !data) {
      set({ error: error?.message ?? 'Nao foi possivel cadastrar o onibus.' });
      return null;
    }

    const rows = [data as BusRow];
    const profiles = await fetchProfilesForBuses(rows);
    const bus = mapBus(rows[0], profiles);
    set((state) => ({ buses: [bus, ...state.buses].sort(byUpdatedAt), error: '' }));
    return bus;
  },
  updateBus: async (busId, data) => {
    const { data: updated, error } = await supabase
      .from('buses')
      .update({
        line_number: data.lineNumber.trim(),
        status: data.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', busId)
      .select('id,bus_number,line_number,status,created_by,created_at,updated_at')
      .single();

    if (error || !updated) {
      set({ error: error?.message ?? 'Nao foi possivel atualizar o onibus.' });
      return;
    }

    const rows = [updated as BusRow];
    const profiles = await fetchProfilesForBuses(rows);
    const bus = mapBus(rows[0], profiles);

    set((state) => ({
      buses: state.buses.map((item) => (item.id === busId ? bus : item)).sort(byUpdatedAt),
      error: '',
    }));
  },
  deleteBus: async (busId, currentUserId) => {
    const bus = get().buses.find((item) => item.id === busId);

    if (!bus || bus.userId !== currentUserId) {
      return false;
    }

    const { error } = await supabase.from('buses').delete().eq('id', busId).eq('created_by', currentUserId);

    if (error) {
      set({ error: error.message });
      return false;
    }

    set((state) => ({ buses: state.buses.filter((item) => item.id !== busId), error: '' }));
    return true;
  },
  getRecentBuses: () => [...get().buses].sort(byUpdatedAt),
  getLatestBuses: () => get().getRecentBuses(),
  getBusesByUser: (userId) => get().buses.filter((bus) => bus.userId === userId).sort(byCreatedAt),
  getUserBuses: (userId) => get().getBusesByUser(userId),
  filterBuses: ({ status = 'TODOS', lineNumber = '', busNumber = '' }) =>
    get()
      .buses.filter((bus) => {
        const matchesStatus = status === 'TODOS' || bus.status === status;
        const matchesLine = bus.lineNumber.includes(lineNumber.trim());
        const matchesBus = bus.busNumber.includes(busNumber.trim());

        return matchesStatus && matchesLine && matchesBus;
      })
      .sort(byCreatedAt),
}));
