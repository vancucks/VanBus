import { create } from 'zustand';

import { hasSupabaseConfig, supabase } from '../services/supabase';
import { Bus, BusRow } from '../types/bus';

export const FAVORITES_LIMIT = 20;

type FavoriteRow = {
  id: string;
  user_id: string;
  bus_id: string;
  created_at: string;
};

export type BusFavorite = {
  id: string;
  userId: string;
  busId: string;
  createdAt: string;
  bus?: Bus;
};

type FavoriteResult = {
  ok: boolean;
  message?: string;
};

type FavoriteState = {
  favorites: BusFavorite[];
  isLoading: boolean;
  error: string;
  loadFavorites: (userId: string) => Promise<void>;
  favoriteBus: (busId: string) => Promise<FavoriteResult>;
  unfavoriteBus: (busId: string) => Promise<FavoriteResult>;
  isFavorite: (busId: string) => boolean;
  getUserFavorites: (userId: string) => Promise<BusFavorite[]>;
};

const mapBus = (row: BusRow): Bus => ({
  id: row.id,
  busNumber: row.bus_number,
  lineNumber: row.line_number,
  status: row.status,
  userId: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapFavorite = (row: FavoriteRow, buses: Bus[] = []): BusFavorite => ({
  id: row.id,
  userId: row.user_id,
  busId: row.bus_id,
  createdAt: row.created_at,
  bus: buses.find((bus) => bus.id === row.bus_id),
});

const fetchFavoriteBuses = async (rows: FavoriteRow[]) => {
  const busIds = Array.from(new Set(rows.map((row) => row.bus_id)));

  if (busIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('buses')
    .select('id,bus_number,line_number,status,created_by,created_at,updated_at')
    .in('id', busIds);

  if (error) {
    throw error;
  }

  return ((data ?? []) as BusRow[]).map(mapBus);
};

const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user.id;
};

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],
  isLoading: false,
  error: '',
  loadFavorites: async (userId) => {
    if (!hasSupabaseConfig) {
      set({ error: 'Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.' });
      return;
    }

    set({ isLoading: true, error: '' });

    const { data, error } = await supabase
      .from('bus_favorites')
      .select('id,user_id,bus_id,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      set({ isLoading: false, error: error.message });
      return;
    }

    const rows = (data ?? []) as FavoriteRow[];
    const buses = await fetchFavoriteBuses(rows);
    set({ favorites: rows.map((row) => mapFavorite(row, buses)), isLoading: false, error: '' });
  },
  favoriteBus: async (busId) => {
    if (!hasSupabaseConfig) {
      return { ok: false, message: 'Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.' };
    }

    const userId = await getCurrentUserId();

    if (!userId) {
      return { ok: false, message: 'Entre na conta para favoritar onibus.' };
    }

    if (get().isFavorite(busId)) {
      return { ok: true };
    }

    const { count, error: countError } = await supabase
      .from('bus_favorites')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      return { ok: false, message: countError.message };
    }

    if ((count ?? 0) >= FAVORITES_LIMIT) {
      return { ok: false, message: 'Você atingiu o limite de 20 ônibus favoritos.' };
    }

    const { data, error } = await supabase
      .from('bus_favorites')
      .insert({ user_id: userId, bus_id: busId })
      .select('id,user_id,bus_id,created_at')
      .single();

    if (error || !data) {
      return { ok: false, message: error?.message ?? 'Nao foi possivel favoritar este onibus.' };
    }

    const rows = [data as FavoriteRow];
    const buses = await fetchFavoriteBuses(rows);
    const favorite = mapFavorite(rows[0], buses);
    set((state) => ({ favorites: [favorite, ...state.favorites], error: '' }));
    return { ok: true };
  },
  unfavoriteBus: async (busId) => {
    if (!hasSupabaseConfig) {
      return { ok: false, message: 'Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.' };
    }

    const userId = await getCurrentUserId();

    if (!userId) {
      return { ok: false, message: 'Entre na conta para remover favoritos.' };
    }

    const { error } = await supabase.from('bus_favorites').delete().eq('user_id', userId).eq('bus_id', busId);

    if (error) {
      return { ok: false, message: error.message };
    }

    set((state) => ({ favorites: state.favorites.filter((favorite) => favorite.busId !== busId), error: '' }));
    return { ok: true };
  },
  isFavorite: (busId) => get().favorites.some((favorite) => favorite.busId === busId),
  getUserFavorites: async (userId) => {
    if (!hasSupabaseConfig) {
      set({ error: 'Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.' });
      return [];
    }

    const { data, error } = await supabase
      .from('bus_favorites')
      .select('id,user_id,bus_id,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      set({ error: error.message });
      return [];
    }

    const rows = (data ?? []) as FavoriteRow[];
    const buses = await fetchFavoriteBuses(rows);
    return rows.map((row) => mapFavorite(row, buses));
  },
}));
