import { DarkTheme, DefaultTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';

export const AppNavigator = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isLoading = useAuthStore((state) => state.isLoading);
  const theme = useThemeStore((state) => state.theme);
  const colors = getColors(theme);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

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

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <NavigationContainer theme={navigationTheme}>{currentUser ? <TabNavigator /> : <AuthNavigator />}</NavigationContainer>;
};
