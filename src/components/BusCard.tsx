import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootTabParamList } from '../navigation/TabNavigator';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { Bus } from '../types/bus';
import { relativeTime } from '../utils/date';
import { StatusBadge } from './StatusBadge';

type BusCardProps = {
  bus: Bus;
  variant?: 'latest' | 'history';
};

type BusCardNavigation = BottomTabNavigationProp<RootTabParamList>;

export const BusCard = memo(({ bus, variant = 'latest' }: BusCardProps) => {
  const theme = useThemeStore((state) => state.theme);
  const colors = getColors(theme);
  const isLatest = variant === 'latest';
  const navigation = useNavigation<BusCardNavigation>();

  return (
    <Pressable
      onPress={() => navigation.navigate('BusDetails', { busId: bus.id })}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
          opacity: pressed ? 0.86 : 1,
        },
        theme === 'light' && styles.lightShadow,
      ]}
    >
      <View style={styles.iconBox}>
        <Ionicons name="bus" size={28} color="#FFFFFF" />
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.bus, { color: colors.text }]}>Ônibus: {bus.busNumber}</Text>
          {isLatest ? <Text style={[styles.time, { color: colors.muted }]}>{relativeTime(bus.updatedAt)}</Text> : null}
        </View>
        <Text style={[styles.line, { color: colors.muted }]}>Linha: {bus.lineNumber}</Text>
        <StatusBadge status={bus.status} compact />
      </View>
      <Ionicons name="chevron-forward" size={22} color={colors.muted} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    minHeight: 102,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  lightShadow: {
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: '#6C3CFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  bus: {
    fontSize: 17,
    fontWeight: '900',
  },
  time: {
    fontSize: 12,
    fontWeight: '700',
  },
  line: {
    fontSize: 14,
    fontWeight: '700',
  },
});
