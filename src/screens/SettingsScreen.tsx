import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { BusCard } from '../components/BusCard';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { ScreenContainer } from '../components/ScreenContainer';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuthStore } from '../store/authStore';
import { useBusStore } from '../store/busStore';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { Bus } from '../types/bus';
import { validateRegistration } from '../utils/validators';

export const SettingsScreen = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const logout = useAuthStore((state) => state.logout);
  const buses = useBusStore((state) => state.buses);
  const theme = useThemeStore((state) => state.theme);
  const colors = getColors(theme);
  const [name, setName] = useState(currentUser?.name ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setName(currentUser?.name ?? '');
    setEmail(currentUser?.email ?? '');
    setPassword('');
    setMessage('');
  }, [currentUser?.email, currentUser?.name]);

  const userBuses = useMemo(
    () =>
      buses
        .filter((bus) => bus.userId === currentUser?.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [buses, currentUser?.id],
  );

  const saveProfile = useCallback(() => {
    if (!currentUser) {
      return;
    }

    if (password.length > 0) {
      const validationError = validateRegistration(name, email, password);
      if (validationError) {
        setMessage(validationError);
        return;
      }
    }

    updateProfile({ name, email, password, theme });
    setPassword('');
    setMessage('Perfil atualizado.');
  }, [currentUser, email, name, password, theme, updateProfile]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const renderItem = useCallback(({ item }: { item: Bus }) => <BusCard bus={item} variant="history" />, []);

  return (
    <ScreenContainer>
      <Header />
      <FlatList
        data={userBuses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={styles.heading}>
              <Text style={[styles.title, { color: colors.text }]}>Configuracoes</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>Perfil, tema e seus onibus</Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Modo de cor</Text>
              <ThemeToggle />
            </View>

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Editar perfil</Text>
              <Input icon="person-outline" onChangeText={setName} placeholder="Nome" value={name} />
              <Input
                autoCapitalize="none"
                icon="mail-outline"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="E-mail"
                value={email}
              />
              <Input icon="lock-closed-outline" onChangeText={setPassword} placeholder="Nova senha" secureTextEntry value={password} />
              {message ? (
                <Text style={[styles.message, { color: message.includes('atualizado') ? colors.primary : colors.error }]}>{message}</Text>
              ) : null}
              <Button title="Salvar perfil" onPress={saveProfile} />
              <Button title="Sair da conta" onPress={handleLogout} style={{ backgroundColor: colors.error }} />
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Onibus que voce cadastrou</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingTop: spacing.lg,
    paddingBottom: 110,
  },
  headerContent: {
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  heading: {
    gap: 5,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  message: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
  },
  separator: {
    height: spacing.md,
  },
});
