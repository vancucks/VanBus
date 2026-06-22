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
import { validateRegistration } from '../utils/validators';

type RegisterScreenProps = {
  onLogin: () => void;
};

export const RegisterScreen = ({ onLogin }: RegisterScreenProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const registerUser = useAuthStore((state) => state.registerUser);
  const theme = useThemeStore((state) => state.theme);
  const colors = getColors(theme);

  const handleRegister = useCallback(() => {
    const validationError = validateRegistration(name, email, password, confirmPassword);

    if (validationError) {
      setError(validationError);
      return;
    }

    const result = registerUser(name, email, password);
    if (!result.ok) {
      setError(result.message ?? 'Nao foi possivel cadastrar.');
      return;
    }

    setError('');
  }, [confirmPassword, email, name, password, registerUser]);

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.brand}>
            <View style={styles.logoInner}>
              <Ionicons name="bus" size={34} color="#FFFFFF" />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Criar conta</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Seu catalogo local da VanBus</Text>
          </View>

          <View style={styles.form}>
            <Input icon="person-outline" onChangeText={setName} placeholder="Nome do perfil" value={name} />
            <Input
              autoCapitalize="none"
              icon="mail-outline"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="E-mail"
              value={email}
            />
            <Input icon="lock-closed-outline" onChangeText={setPassword} placeholder="Senha" secureTextEntry value={password} />
            <Input
              icon="shield-checkmark-outline"
              onChangeText={setConfirmPassword}
              placeholder="Confirmar senha"
              secureTextEntry
              value={confirmPassword}
            />
            {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
            <Button title="Cadastrar" onPress={handleRegister} />
          </View>

          <Pressable onPress={onLogin} style={styles.loginLink}>
            <Text style={[styles.loginText, { color: colors.muted }]}>
              Ja tem uma conta? <Text style={{ color: colors.primary }}>Entrar</Text>
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
  logoInner: {
    width: 78,
    height: 78,
    borderRadius: radius.xl,
    backgroundColor: '#6C3CFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 15,
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
  loginLink: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  loginText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
