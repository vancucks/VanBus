import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { useThemeStore } from '../store/themeStore';
import { AppTheme } from '../types/user';

const options: { label: string; value: AppTheme }[] = [
  { label: 'Claro', value: 'light' },
  { label: 'Escuro', value: 'dark' },
];

export const ThemeToggle = memo(() => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const colors = getColors(theme);

  return (
    <View style={[styles.container, { backgroundColor: colors.input }]}>
      {options.map((option) => {
        const isActive = option.value === theme;

        return (
          <Pressable
            key={option.value}
            onPress={() => setTheme(option.value)}
            style={[styles.option, { backgroundColor: isActive ? colors.primary : 'transparent' }]}
          >
            <Text style={[styles.text, { color: isActive ? '#FFFFFF' : colors.muted }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    padding: 5,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  option: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '800',
  },
});
