export type AppTheme = 'light' | 'dark';

export type User = {
  id: string;
  name: string;
  email: string;
  theme: AppTheme;
  createdAt: string;
};

export type StoredUser = User;
