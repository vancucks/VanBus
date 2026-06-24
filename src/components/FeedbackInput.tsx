import { memo, useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { Button } from './Button';

const MAX_FEEDBACK_LENGTH = 500;

type FeedbackInputProps = {
  onSubmit: (text: string) => Promise<boolean>;
  loading?: boolean;
};

export const FeedbackInput = memo(({ onSubmit, loading = false }: FeedbackInputProps) => {
  const theme = useThemeStore((state) => state.theme);
  const colors = getColors(theme);
  const [text, setText] = useState('');

  const handleChangeText = useCallback((value: string) => {
    setText(value.slice(0, MAX_FEEDBACK_LENGTH));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!text.trim() || text.length > MAX_FEEDBACK_LENGTH) {
      return;
    }

    const submitted = await onSubmit(text);

    if (submitted) {
      setText('');
    }
  }, [onSubmit, text]);

  return (
    <View style={styles.container}>
      <View style={[styles.inputBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
        <TextInput
          maxLength={MAX_FEEDBACK_LENGTH}
          multiline
          onChangeText={handleChangeText}
          placeholder="Escreva um pouco da sua experiência/característica dele..."
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text }]}
          textAlignVertical="top"
          value={text}
        />
        <Text style={[styles.counter, { color: colors.muted }]}>{text.length}/500</Text>
      </View>
      <Button
        disabled={!text.trim() || text.length > MAX_FEEDBACK_LENGTH}
        loading={loading}
        onPress={handleSubmit}
        style={styles.button}
        title="Enviar feedback"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  inputBox: {
    minHeight: 132,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    paddingBottom: 30,
  },
  input: {
    minHeight: 84,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  counter: {
    bottom: spacing.sm,
    fontSize: 11,
    fontWeight: '800',
    position: 'absolute',
    right: spacing.md,
  },
  button: {
    backgroundColor: '#6C3CFF',
  },
});
