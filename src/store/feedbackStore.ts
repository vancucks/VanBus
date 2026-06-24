import { create } from 'zustand';

import { hasSupabaseConfig, supabase } from '../services/supabase';
import { BusFeedback, BusFeedbackRow } from '../types/feedback';

const FEEDBACK_LIMIT = 20;
const MAX_FEEDBACK_LENGTH = 500;
const missingConfigMessage = 'Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.';

type ProfileRow = {
  id: string;
  name: string;
};

type FeedbackResult = {
  ok: boolean;
  message?: string;
};

type FeedbackState = {
  feedbacks: BusFeedback[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string;
  loadFeedbacks: (busId: string) => Promise<void>;
  addFeedback: (busId: string, text: string) => Promise<FeedbackResult>;
  clearFeedbacks: () => void;
};

const mapFeedback = (row: BusFeedbackRow, profiles: ProfileRow[] = []): BusFeedback => {
  const profile = profiles.find((item) => item.id === row.user_id);

  return {
    id: row.id,
    busId: row.bus_id,
    userId: row.user_id,
    userName: profile?.name,
    text: row.text,
    createdAt: row.created_at,
  };
};

const fetchProfilesForFeedbacks = async (rows: BusFeedbackRow[]) => {
  const ids = Array.from(new Set(rows.map((row) => row.user_id).filter(Boolean)));

  if (ids.length === 0) {
    return [];
  }

  const { data } = await supabase.from('profiles').select('id,name').in('id', ids);
  return (data ?? []) as ProfileRow[];
};

const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user.id;
};

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  feedbacks: [],
  isLoading: false,
  isSubmitting: false,
  error: '',
  loadFeedbacks: async (busId) => {
    if (!hasSupabaseConfig) {
      set({ error: missingConfigMessage });
      return;
    }

    set({ isLoading: true, error: '' });

    const { data, error } = await supabase
      .from('bus_feedbacks')
      .select('id,bus_id,user_id,text,created_at')
      .eq('bus_id', busId)
      .order('created_at', { ascending: false })
      .limit(FEEDBACK_LIMIT);

    if (error) {
      set({ isLoading: false, error: error.message });
      return;
    }

    const rows = (data ?? []) as BusFeedbackRow[];
    const profiles = await fetchProfilesForFeedbacks(rows);
    set({ feedbacks: rows.map((row) => mapFeedback(row, profiles)), isLoading: false, error: '' });
  },
  addFeedback: async (busId, text) => {
    if (!hasSupabaseConfig) {
      return { ok: false, message: missingConfigMessage };
    }

    const normalizedText = text.trim();

    if (!normalizedText) {
      return { ok: false, message: 'Escreva um feedback antes de enviar.' };
    }

    if (normalizedText.length > MAX_FEEDBACK_LENGTH) {
      return { ok: false, message: 'O feedback deve ter no maximo 500 caracteres.' };
    }

    const userId = await getCurrentUserId();

    if (!userId) {
      return { ok: false, message: 'Entre na conta para enviar feedback.' };
    }

    set({ isSubmitting: true, error: '' });

    const { error } = await supabase.from('bus_feedbacks').insert({
      bus_id: busId,
      user_id: userId,
      text: normalizedText,
    });

    if (error) {
      set({ isSubmitting: false, error: error.message });
      return { ok: false, message: error.message };
    }

    await get().loadFeedbacks(busId);
    set({ isSubmitting: false, error: '' });
    return { ok: true };
  },
  clearFeedbacks: () => set({ feedbacks: [], isLoading: false, isSubmitting: false, error: '' }),
}));
