import { AppTheme } from '../types/user';

export const palette = {
  primary: '#6C3CFF',
  secondary: '#9D7CFF',
  darkBackground: '#10131C',
  darkCard: '#1E1E2F',
  lightBackground: '#F8FAFC',
  lightCard: '#FFFFFF',
  darkText: '#0F172A',
  lightText: '#F8FAFC',
  grayText: '#94A3B8',
  freezing: '#2563EB',
  windy: '#22C55E',
  hot: '#F59E0B',
  error: '#EF4444',
  borderLight: '#E2E8F0',
  borderDark: '#313249',
};

export const getColors = (theme: AppTheme) => ({
  primary: palette.primary,
  secondary: palette.secondary,
  background: theme === 'dark' ? palette.darkBackground : palette.lightBackground,
  card: theme === 'dark' ? palette.darkCard : palette.lightCard,
  text: theme === 'dark' ? palette.lightText : palette.darkText,
  muted: palette.grayText,
  border: theme === 'dark' ? palette.borderDark : palette.borderLight,
  input: theme === 'dark' ? '#171A27' : '#EEF2F7',
  tab: theme === 'dark' ? '#171A27' : palette.lightCard,
  shadow: theme === 'dark' ? '#000000' : '#64748B',
  error: palette.error,
  status: {
    AR_GELANDO: palette.freezing,
    VENTANDO: palette.windy,
    QUENTE: palette.hot,
  },
});

export type ThemeColors = ReturnType<typeof getColors>;
