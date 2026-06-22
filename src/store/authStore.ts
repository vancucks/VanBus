import { create } from 'zustand';

import { hasSupabaseConfig, supabase } from '../services/supabase';
import { AppTheme, User } from '../types/user';

type AuthResult = {
  ok: boolean;
  message?: string;
};

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

type AuthState = {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  initializeAuth: () => Promise<void>;
  loadProfiles: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthResult>;
  registerUser: (name: string, email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  updateProfile: (data: { name: string; email: string; password?: string; theme?: AppTheme }) => Promise<AuthResult>;
  logout: () => Promise<void>;
};

const mapProfile = (profile: ProfileRow, theme: AppTheme = 'dark'): User => ({
  id: profile.id,
  name: profile.name,
  email: profile.email,
  theme,
  createdAt: profile.created_at,
});

const missingConfigMessage = 'Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.';

const getProfile = async (userId: string, fallbackEmail = '') => {
  const { data, error } = await supabase.from('profiles').select('id,name,email,created_at').eq('id', userId).maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      id: userId,
      name: fallbackEmail.split('@')[0] || 'Usuario',
      email: fallbackEmail,
      theme: 'dark' as AppTheme,
      createdAt: new Date().toISOString(),
    };
  }

  return mapProfile(data as ProfileRow);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  users: [],
  isLoading: true,
  initializeAuth: async () => {
    if (!hasSupabaseConfig) {
      set({ currentUser: null, isLoading: false });
      return;
    }

    const { data } = await supabase.auth.getSession();
    const sessionUser = data.session?.user;

    if (!sessionUser) {
      set({ currentUser: null, isLoading: false });
      return;
    }

    const profile = await getProfile(sessionUser.id, sessionUser.email ?? '');
    set({ currentUser: profile, isLoading: false });
    await get().loadProfiles();
  },
  loadProfiles: async () => {
    if (!hasSupabaseConfig) {
      return;
    }

    const { data, error } = await supabase.from('profiles').select('id,name,email,created_at').order('created_at', { ascending: false });

    if (error) {
      return;
    }

    set({ users: (data ?? []).map((profile) => mapProfile(profile as ProfileRow)) });
  },
  login: async (email, password) => {
    if (!hasSupabaseConfig) {
      return { ok: false, message: missingConfigMessage };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data.user) {
      return { ok: false, message: error?.message ?? 'E-mail ou senha invalidos.' };
    }

    const profile = await getProfile(data.user.id, data.user.email ?? email);
    set({ currentUser: profile });
    await get().loadProfiles();
    return { ok: true };
  },
  registerUser: async (name, email, password) => {
    if (!hasSupabaseConfig) {
      return { ok: false, message: missingConfigMessage };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { name: name.trim() },
      },
    });

    if (error || !data.user) {
      return { ok: false, message: error?.message ?? 'Nao foi possivel cadastrar.' };
    }

    const profileRow = {
      id: data.user.id,
      name: name.trim(),
      email: normalizedEmail,
    };

    const { error: profileError } = await supabase.from('profiles').upsert(profileRow);

    if (profileError && data.session) {
      return { ok: false, message: profileError.message };
    }

    if (!data.session) {
      return { ok: false, message: 'Conta criada. Confirme o e-mail antes de entrar.' };
    }

    const profile = await getProfile(data.user.id, normalizedEmail);
    set({ currentUser: profile });
    await get().loadProfiles();
    return { ok: true };
  },
  register: (...args) => get().registerUser(...args),
  updateProfile: async ({ name, email }) => {
    const currentUser = get().currentUser;

    if (!currentUser) {
      return { ok: false, message: 'Entre na conta para atualizar o perfil.' };
    }

    const profileRow = {
      id: currentUser.id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
    };

    const { data, error } = await supabase.from('profiles').update(profileRow).eq('id', currentUser.id).select('id,name,email,created_at').single();

    if (error) {
      return { ok: false, message: error.message };
    }

    const updatedUser = mapProfile(data as ProfileRow, currentUser.theme);
    set((state) => ({
      currentUser: updatedUser,
      users: state.users.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
    }));

    return { ok: true };
  },
  logout: async () => {
    if (hasSupabaseConfig) {
      await supabase.auth.signOut();
    }

    set({ currentUser: null });
  },
}));
