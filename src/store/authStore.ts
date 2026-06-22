import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { AppTheme, StoredUser, User } from '../types/user';

type AuthState = {
  currentUser: User | null;
  users: StoredUser[];
  login: (email: string, password: string) => boolean;
  registerUser: (name: string, email: string, password: string) => { ok: boolean; message?: string };
  register: (name: string, email: string, password: string) => { ok: boolean; message?: string };
  updateProfile: (data: { name: string; email: string; password?: string; theme?: AppTheme }) => void;
  logout: () => void;
};

const defaultUser: StoredUser = {
  id: '1',
  name: 'Clara',
  email: 'clara@vanbus.app',
  password: 'Vanbus1',
  theme: 'dark',
  createdAt: new Date().toISOString(),
};

const normalizeUser = (user: StoredUser): StoredUser => ({
  ...user,
  theme: user.theme ?? 'dark',
  createdAt: user.createdAt ?? new Date().toISOString(),
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [defaultUser],
      login: (email, password) => {
        const foundUser = get().users.map(normalizeUser).find(
          (user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password,
        );

        if (!foundUser) {
          return false;
        }

        set({ currentUser: foundUser });
        return true;
      },
      registerUser: (name, email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        const exists = get().users.some((user) => user.email.toLowerCase() === normalizedEmail);

        if (exists) {
          return { ok: false, message: 'Este e-mail ja esta cadastrado.' };
        }

        const newUser: StoredUser = {
          id: String(Date.now()),
          name: name.trim(),
          email: normalizedEmail,
          password,
          theme: 'dark',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          users: [...state.users.map(normalizeUser), newUser],
          currentUser: newUser,
        }));

        return { ok: true };
      },
      register: (...args) => get().registerUser(...args),
      updateProfile: ({ name, email, password, theme }) => {
        const currentUser = get().currentUser;

        if (!currentUser) {
          return;
        }

        set((state) => {
          const users = state.users.map(normalizeUser).map((user) => {
            if (user.id !== currentUser.id) {
              return user;
            }

            return {
              ...user,
              name: name.trim(),
              email: email.trim().toLowerCase(),
              password: password && password.length > 0 ? password : user.password,
              theme: theme ?? user.theme,
            };
          });

          const updatedStoredUser = users.find((user) => user.id === currentUser.id);

          return {
            users,
            currentUser: updatedStoredUser ?? currentUser,
          };
        });
      },
      logout: () => set({ currentUser: null }),
    }),
    {
      name: 'vanbus-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        users: state.users.map(normalizeUser),
        currentUser: state.currentUser ? normalizeUser(state.currentUser) : null,
      }),
    },
  ),
);
