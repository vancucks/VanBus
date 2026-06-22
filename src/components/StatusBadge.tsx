import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { useThemeStore } from '../store/themeStore';
import { BusStatus } from '../types/bus';

const labels: Record<BusStatus, string> = {
  AR_GELANDO: 'Ar gelando',
  VENTANDO: 'Ventando',
  QUENTE: 'Quente',
};

type StatusBadgeProps = {
  status: BusStatus;
  compact?: boolean;
};

export const StatusBadge = memo(({ status, compact }: StatusBadgeProps) => {
  const theme = useThemeStore((state) => state.theme);
  const colors = getColors(theme);
  const statusColor = colors.status[status];

  return (
    <View style={[styles.badge, { backgroundColor: `${statusColor}22` }, compact && styles.compact]}>
      <View style={[styles.dot, { backgroundColor: statusColor }]} />
      <Text style={[styles.text, { color: statusColor }]}>{labels[status]}</Text>
    </View>
  );
});

export const statusLabel = labels;

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  compact: {
    paddingVertical: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
  },
});
