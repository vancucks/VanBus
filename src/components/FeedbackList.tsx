import { memo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { BusFeedback } from '../types/feedback';
import { FeedbackCard } from './FeedbackCard';

type FeedbackListProps = {
  feedbacks: BusFeedback[];
  loading?: boolean;
};

export const FeedbackList = memo(({ feedbacks, loading = false }: FeedbackListProps) => {
  const theme = useThemeStore((state) => state.theme);
  const colors = getColors(theme);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (feedbacks.length === 0) {
    return <Text style={[styles.empty, { color: colors.muted }]}>Nenhum feedback ainda.</Text>;
  }

  return (
    <View style={styles.list}>
      {feedbacks.map((feedback) => (
        <FeedbackCard key={feedback.id} feedback={feedback} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  center: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  empty: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
});
