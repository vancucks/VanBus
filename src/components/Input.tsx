import { Ionicons } from '@expo/vector-icons';
import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { getColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { useThemeStore } from '../store/themeStore';

type InputProps = TextInputProps & {
  icon: keyof typeof Ionicons.glyphMap;
  error?: string;
};

export const Input = memo(({ icon, error, secureTextEntry, style, ...props }: InputProps) => {
  const [isSecure, setIsSecure] = useState(Boolean(secureTextEntry));
  const theme = useThemeStore((state) => state.theme);
  const colors = getColors(theme);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { backgroundColor: colors.input, borderColor: error ? colors.error : colors.border }]}>
        <Ionicons name={icon} size={20} color={colors.muted} />
        <TextInput
          {...props}
          placeholderTextColor={colors.muted}
          secureTextEntry={isSecure}
          selectionColor={colors.primary}
          style={[styles.input, { color: colors.text }, style]}
        />
        {secureTextEntry ? (
          <Pressable hitSlop={12} onPress={() => setIsSecure((value) => !value)}>
            <Ionicons name={isSecure ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  container: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  error: {
    fontSize: 12,
    fontWeight: '700',
  },
});
