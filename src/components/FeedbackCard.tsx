import { memo, useCallback, useEffect, useState } from 'react';
import { NativeSyntheticEvent, Pressable, StyleSheet, Text, TextLayoutEventData, View } from 'react-native';

import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { BusFeedback } from '../types/feedback';
import { relativeTime } from '../utils/date';

type FeedbackCardProps = {
  feedback: BusFeedback;
};

export const FeedbackCard = memo(({ feedback }: FeedbackCardProps) => {
  const theme = useThemeStore((state) => state.theme);
  const colors = getColors(theme);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  useEffect(() => {
    setExpanded(false);
    setCanExpand(false);
  }, [feedback.id, feedback.text]);

  const handleFullTextLayout = useCallback((event: NativeSyntheticEvent<TextLayoutEventData>) => {
    setCanExpand(event.nativeEvent.lines.length > 4);
  }, []);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text numberOfLines={1} style={[styles.userName, { color: colors.text }]}>
          {feedback.userName ?? 'Usuario VanBus'}
        </Text>
        <Text style={[styles.date, { color: colors.muted }]}>{relativeTime(feedback.createdAt)}</Text>
      </View>
      <Text numberOfLines={expanded ? undefined : 4} style={[styles.text, { color: colors.text }]}>
        {feedback.text}
      </Text>
      <Text
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        onTextLayout={handleFullTextLayout}
        style={[styles.text, styles.measureText]}
      >
        {feedback.text}
      </Text>
      {canExpand ? (
        <Pressable onPress={() => setExpanded((value) => !value)} hitSlop={8}>
          <Text style={[styles.readMore, { color: colors.primary }]}>{expanded ? 'Mostrar menos' : 'Ler mais...'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  userName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
  },
  date: {
    fontSize: 12,
    fontWeight: '800',
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
  },
  measureText: {
    left: spacing.md,
    opacity: 0,
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    zIndex: -1,
  },
  readMore: {
    fontSize: 13,
    fontWeight: '600',
  },
});
