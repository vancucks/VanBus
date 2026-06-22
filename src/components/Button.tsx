import { ReactNode, memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { getColors } from '../theme/colors';
import { radius } from '../theme/spacing';
import { useThemeStore } from '../store/themeStore';

type ButtonProps = {
  title: string;
  onPress: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export const Button = memo(({ title, onPress, icon, disabled, loading, style }: ButtonProps) => {
  const theme = useThemeStore((state) => state.theme);
  const colors = getColors(theme);

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.primary, opacity: disabled ? 0.5 : pressed ? 0.88 : 1 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color="#FFFFFF" /> : icon}
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
