import { DarkTheme, DefaultTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { useEffect, useMemo } from 'react';

import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';

export const AppNavigator = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const colors = getColors(theme);

  useEffect(() => {
    if (currentUser?.theme) {
      setTheme(currentUser.theme);
    }
  }, [currentUser?.id]);

  const navigationTheme: Theme = useMemo(
    () => ({
      ...(theme === 'dark' ? DarkTheme : DefaultTheme),
      colors: {
        ...(theme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
        primary: colors.primary,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
        notification: colors.primary,
      },
    }),
    [colors, theme],
  );

  return <NavigationContainer theme={navigationTheme}>{currentUser ? <TabNavigator /> : <AuthNavigator />}</NavigationContainer>;
};
