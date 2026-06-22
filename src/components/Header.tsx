import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type HeaderProps = {
  title?: string;
  showBell?: boolean;
};

export const Header = memo(({ title = 'VanBus', showBell }: HeaderProps) => {
  const theme = useThemeStore((state) => state.theme);
  const colors = getColors(theme);

  return (
    <View style={styles.container}>
      <Text style={[styles.logo, { color: colors.text }]}>
        Van<Text style={{ color: colors.primary }}>Bus</Text>
      </Text>
      {title !== 'VanBus' ? <Text style={[styles.title, { color: colors.text }]}>{title}</Text> : null}
      {showBell ? (
        <View style={[styles.bell, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="notifications-outline" size={21} color={colors.text} />
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    minHeight: 64,
    paddingTop: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    alignSelf: 'flex-start',
    fontSize: 27,
    fontWeight: '900',
  },
  title: {
    alignSelf: 'flex-start',
    fontSize: 28,
    fontWeight: '900',
    marginTop: spacing.md,
  },
  bell: {
    position: 'absolute',
    right: 0,
    top: spacing.sm,
    width: 46,
    height: 46,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
