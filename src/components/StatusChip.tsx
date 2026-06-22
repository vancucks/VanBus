import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { BusStatus } from '../types/bus';
import { statusLabel } from './StatusBadge';

type StatusChipProps = {
  status: BusStatus;
  selected: boolean;
  onPress: (status: BusStatus) => void;
};

export const StatusChip = memo(({ status, selected, onPress }: StatusChipProps) => {
  const theme = useThemeStore((state) => state.theme);
  const colors = getColors(theme);

  return (
    <Pressable
      onPress={() => onPress(status)}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.input,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
    >
      <Text style={[styles.text, { color: selected ? '#FFFFFF' : colors.muted }]}>{statusLabel[status]}</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 13,
    fontWeight: '900',
  },
});
