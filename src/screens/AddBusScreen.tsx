import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { ScreenContainer } from '../components/ScreenContainer';
import { StatusChip } from '../components/StatusChip';
import { RootTabParamList } from '../navigation/TabNavigator';
import { useAuthStore } from '../store/authStore';
import { useBusStore } from '../store/busStore';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { BusStatus } from '../types/bus';
import { validateBus } from '../utils/validators';

const statuses: BusStatus[] = ['AR_GELANDO', 'VENTANDO', 'QUENTE'];

type AddBusNavigation = BottomTabNavigationProp<RootTabParamList, 'AddBus'>;

export const AddBusScreen = () => {
  const [busNumber, setBusNumber] = useState('');
  const [lineNumber, setLineNumber] = useState('');
  const [status, setStatus] = useState<BusStatus | null>(null);
  const [error, setError] = useState('');
  const currentUser = useAuthStore((state) => state.currentUser);
  const addBus = useBusStore((state) => state.addBus);
  const theme = useThemeStore((state) => state.theme);
  const colors = getColors(theme);
  const navigation = useNavigation<AddBusNavigation>();

  const handleSelectStatus = useCallback((nextStatus: BusStatus) => {
    setStatus(nextStatus);
    setError('');
  }, []);

  const handleSave = useCallback(() => {
    const validationError = validateBus(busNumber, lineNumber, status);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!currentUser || !status) {
      setError('Entre na conta para cadastrar um onibus.');
      return;
    }

    addBus({
      busNumber,
      lineNumber,
      status,
      userId: currentUser.id,
    });

    setBusNumber('');
    setLineNumber('');
    setStatus(null);
    setError('');
    navigation.navigate('Home');
  }, [addBus, busNumber, currentUser, lineNumber, navigation, status]);

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <Header />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.heading}>
            <Text style={[styles.title, { color: colors.text }]}>Adicionar ônibus</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Cadastre um ônibus no VanBus</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Input
              icon="bus-outline"
              keyboardType="number-pad"
              onChangeText={setBusNumber}
              placeholder="Número do ônibus"
              value={busNumber}
            />
            <Input
              icon="git-branch-outline"
              keyboardType="number-pad"
              onChangeText={setLineNumber}
              placeholder="Número da linha"
              value={lineNumber}
            />

            <View style={styles.statusBlock}>
              <Text style={[styles.label, { color: colors.text }]}>Status</Text>
              <View style={styles.chips}>
                {statuses.map((item) => (
                  <StatusChip key={item} status={item} selected={status === item} onPress={handleSelectStatus} />
                ))}
              </View>
            </View>

            {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
            <Button title="Salvar ônibus" onPress={handleSave} />
          </View>
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
    paddingTop: spacing.lg,
    paddingBottom: 110,
    gap: spacing.lg,
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
  statusBlock: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 15,
    fontWeight: '900',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  error: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
});
