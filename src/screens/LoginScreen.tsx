import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type LoginScreenProps = {
  onRegister: () => void;
};

export const LoginScreen = ({ onRegister }: LoginScreenProps) => {
  const [email, setEmail] = useState('clara@vanbus.app');
  const [password, setPassword] = useState('Vanbus1');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const theme = useThemeStore((state) => state.theme);
  const colors = getColors(theme);

  const handleLogin = useCallback(() => {
    const ok = login(email, password);

    if (!ok) {
      setError('E-mail ou senha inválidos.');
      return;
    }

    setError('');
  }, [email, login, password]);

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.brand}>
            <View style={[styles.logoBox, { backgroundColor: `${colors.primary}22` }]}>
              <View style={styles.logoInner}>
                <Ionicons name="bus" size={44} color="#FFFFFF" />
              </View>
            </View>
            <Text style={[styles.logoText, { color: colors.text }]}>
              Van<Text style={{ color: colors.primary }}>Bus</Text>
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Catálogo de ônibus</Text>
          </View>

          <View style={styles.form}>
            <Input
              autoCapitalize="none"
              icon="mail-outline"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="E-mail"
              value={email}
            />
            <Input icon="lock-closed-outline" onChangeText={setPassword} placeholder="Senha" secureTextEntry value={password} />
            {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
            <Button title="Entrar" onPress={handleLogin} />
          </View>

          <Pressable onPress={onRegister} style={styles.registerLink}>
            <Text style={[styles.registerText, { color: colors.muted }]}>
              Não tem uma conta? <Text style={{ color: colors.primary }}>Cadastre-se</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.xl,
  },
  brand: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoBox: {
    width: 116,
    height: 116,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 82,
    height: 82,
    borderRadius: 30,
    backgroundColor: '#6C3CFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 38,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  form: {
    gap: spacing.md,
  },
  error: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  registerText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
