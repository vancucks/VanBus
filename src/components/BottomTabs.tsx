import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  History: 'time',
  AddBus: 'add',
  Rank: 'trophy',
  Settings: 'settings',
};

export const BottomTabs = memo(({ state, descriptors, navigation }: BottomTabBarProps) => {
  const theme = useThemeStore((store) => store.theme);
  const colors = getColors(theme);

  const visibleRoutes = useMemo(
    () => state.routes.filter((route) => !['BusDetails', 'UserProfile'].includes(route.name)),
    [state.routes],
  );

  return (
    <View style={[styles.bar, { backgroundColor: colors.tab, borderColor: colors.border }]}>
      {visibleRoutes.map((route, index) => {
        const realIndex = state.routes.findIndex((item) => item.key === route.key);
        const isFocused = state.index === realIndex;
        const { options } = descriptors[route.key];
        const label = typeof options.tabBarLabel === 'string' ? options.tabBarLabel : options.title ?? route.name;
        const color = isFocused ? colors.primary : colors.muted;
        const isAddRoute = route.name === 'AddBus';

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={() => navigation.navigate(route.name)}
            style={[
              styles.item,
              isFocused && { backgroundColor: `${colors.primary}18` },
              isAddRoute && styles.addItem,
              isAddRoute && isFocused && { backgroundColor: 'transparent' },
            ]}
          >
            <View style={isAddRoute ? [styles.addIcon, { backgroundColor: colors.primary }] : undefined}>
              <Ionicons name={icons[route.name]} size={isAddRoute ? 24 : 22} color={isAddRoute ? '#FFFFFF' : color} />
            </View>
            <Text numberOfLines={1} style={[styles.label, { color }]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  bar: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    minHeight: 72,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 8,
    flexDirection: 'row',
    gap: 6,
  },
  item: {
    flex: 1,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  addItem: {
    gap: 1,
  },
  addIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
});
