export type AppTheme = 'light' | 'dark';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  theme: AppTheme;
  createdAt: string;
};

export type StoredUser = User;
