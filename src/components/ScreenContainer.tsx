import { ReactNode, memo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getColors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useThemeStore } from '../store/themeStore';

type ScreenContainerProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export const ScreenContainer = memo(({ children, style }: ScreenContainerProps) => {
  const theme = useThemeStore((state) => state.theme);
  const colors = getColors(theme);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.content, style]}>{children}</View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
});
