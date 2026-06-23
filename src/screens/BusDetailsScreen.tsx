import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { ScreenContainer } from '../components/ScreenContainer';
import { StatusBadge, statusLabel } from '../components/StatusBadge';
import { StatusChip } from '../components/StatusChip';
import { RootTabParamList } from '../navigation/TabNavigator';
import { useAuthStore } from '../store/authStore';
import { useBusStore } from '../store/busStore';
import { useFavoriteStore } from '../store/favoriteStore';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { BusStatus } from '../types/bus';
import { formatDate } from '../utils/date';
import { validateBus } from '../utils/validators';

type BusDetailsRoute = RouteProp<RootTabParamList, 'BusDetails'>;
type BusDetailsNavigation = BottomTabNavigationProp<RootTabParamList, 'BusDetails'>;

const statuses: BusStatus[] = ['AR_GELANDO', 'VENTANDO', 'QUENTE'];

export const BusDetailsScreen = () => {
  const route = useRoute<BusDetailsRoute>();
  const navigation = useNavigation<BusDetailsNavigation>();
  const currentUser = useAuthStore((state) => state.currentUser);
  const buses = useBusStore((state) => state.buses);
  const updateBus = useBusStore((state) => state.updateBus);
  const deleteBus = useBusStore((state) => state.deleteBus);
  const loadFavorites = useFavoriteStore((state) => state.loadFavorites);
  const favoriteBus = useFavoriteStore((state) => state.favoriteBus);
  const unfavoriteBus = useFavoriteStore((state) => state.unfavoriteBus);
  const isFavorite = useFavoriteStore((state) => state.isFavorite);
  const theme = useThemeStore((state) => state.theme);
  const colors = getColors(theme);
  const bus = useMemo(() => buses.find((item) => item.id === route.params.busId), [buses, route.params.busId]);
  const favorite = isFavorite(route.params.busId);
  const [lineNumber, setLineNumber] = useState(bus?.lineNumber ?? '');
  const [status, setStatus] = useState<BusStatus | null>(bus?.status ?? null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFavoriteSubmitting, setIsFavoriteSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigation.navigate('Home');
    }
  }, [currentUser, navigation]);

  useEffect(() => {
    setLineNumber(bus?.lineNumber ?? '');
    setStatus(bus?.status ?? null);
    setError('');
    setMessage('');
  }, [bus?.id, bus?.lineNumber, bus?.status]);

  useFocusEffect(
    useCallback(() => {
      if (currentUser) {
        loadFavorites(currentUser.id);
      }
    }, [currentUser, loadFavorites]),
  );

  const handleSelectStatus = useCallback((nextStatus: BusStatus) => {
    setStatus(nextStatus);
    setError('');
  }, []);

  const handleToggleFavorite = useCallback(async () => {
    if (!bus) {
      setError('Registro nao encontrado.');
      return;
    }

    setIsFavoriteSubmitting(true);
    const result = favorite ? await unfavoriteBus(bus.id) : await favoriteBus(bus.id);
    setIsFavoriteSubmitting(false);

    if (!result.ok) {
      setError(result.message ?? 'Nao foi possivel atualizar seus favoritos.');
      setMessage('');
      return;
    }

    setError('');
    setMessage(favorite ? 'Onibus removido dos favoritos.' : 'Onibus adicionado aos favoritos.');
  }, [bus, favorite, favoriteBus, unfavoriteBus]);

  const handleSave = useCallback(async () => {
    if (!bus || !status) {
      setError('Registro nao encontrado.');
      return;
    }

    const validationError = validateBus(bus.busNumber, lineNumber, status);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    await updateBus(bus.id, { lineNumber, status });
    setIsSubmitting(false);
    setMessage('Alteracoes salvas.');
  }, [bus, lineNumber, status, updateBus]);

  const confirmDelete = useCallback(() => {
    if (!bus || !currentUser) {
      setError('Registro nao encontrado.');
      return;
    }

    Alert.alert('Apagar registro', 'Tem certeza que deseja apagar este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          const deleted = await deleteBus(bus.id, currentUser.id);

          if (!deleted) {
            setError('Apenas o criador pode apagar este registro.');
            return;
          }

          navigation.navigate('Home');
        },
      },
    ]);
  }, [bus, currentUser, deleteBus, navigation]);

  if (!bus) {
    return (
      <ScreenContainer>
        <Header />
        <View style={styles.center}>
          <Text style={[styles.title, { color: colors.text }]}>Registro não encontrado</Text>
          <Button title="Voltar para inicio" onPress={() => navigation.navigate('Home')} />
        </View>
      </ScreenContainer>
    );
  }

  const creatorLabel = bus.creatorName ? `${bus.creatorName} (${bus.creatorEmail ?? 'sem e-mail'})` : `Usuario ${bus.userId}`;
  const canDelete = currentUser?.id === bus.userId;

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <Header />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.heading}>
            <Text style={[styles.title, { color: colors.text }]}>Detalhes do ônibus</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Consulte o registro e ajuste linha ou status</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.summaryTop}>
              <View style={styles.iconBox}>
                <Text style={styles.iconText}>BUS</Text>
              </View>
              <View style={styles.summaryText}>
                <Text style={[styles.busNumber, { color: colors.text }]}>Ônibus {bus.busNumber}</Text>
                <Text style={[styles.line, { color: colors.muted }]}>Linha {bus.lineNumber}</Text>
                <StatusBadge status={bus.status} compact />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                disabled={isFavoriteSubmitting}
                onPress={handleToggleFavorite}
                style={({ pressed }) => [
                  styles.favoriteButton,
                  { backgroundColor: `${colors.primary}18`, opacity: pressed || isFavoriteSubmitting ? 0.72 : 1 },
                ]}
              >
                <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={26} color={favorite ? colors.error : colors.primary} />
              </Pressable>
            </View>

            <View style={[styles.metaGrid, { borderColor: colors.border }]}>
              <Meta label="Status atual" value={statusLabel[bus.status]} />
              <Meta label="Criado em" value={formatDate(bus.createdAt)} />
              <Meta label="Atualizado em" value={formatDate(bus.updatedAt)} />
              <Meta label="Criado por" value={creatorLabel} />
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Modificar registro</Text>

            <View style={[styles.disabledField, { backgroundColor: colors.input, borderColor: colors.border }]}>
              <Text style={[styles.disabledLabel, { color: colors.muted }]}>Número do ônibus</Text>
              <Text style={[styles.disabledValue, { color: colors.text }]}>{bus.busNumber}</Text>
            </View>

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
            {message ? <Text style={[styles.message, { color: colors.primary }]}>{message}</Text> : null}
            <Button title="Salvar alterações" onPress={handleSave} loading={isSubmitting} />

            {canDelete ? (
              <Pressable
                onPress={confirmDelete}
                style={({ pressed }) => [styles.deleteButton, { backgroundColor: colors.error, opacity: pressed ? 0.82 : 1 }]}
              >
                <Text style={styles.deleteText}>Apagar registro</Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const Meta = ({ label, value }: { label: string; value: string }) => {
  const theme = useThemeStore((state) => state.theme);
  const colors = getColors(theme);

  return (
    <View style={styles.metaItem}>
      <Text style={[styles.metaLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: colors.text }]}>{value}</Text>
    </View>
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
  center: {
    flex: 1,
    justifyContent: 'center',
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
  summaryTop: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#6C3CFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  summaryText: {
    flex: 1,
    gap: 6,
  },
  favoriteButton: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  busNumber: {
    fontSize: 22,
    fontWeight: '900',
  },
  line: {
    fontSize: 15,
    fontWeight: '800',
  },
  metaGrid: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  metaItem: {
    gap: 2,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  disabledField: {
    minHeight: 62,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    opacity: 0.72,
  },
  disabledLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },
  disabledValue: {
    fontSize: 17,
    fontWeight: '900',
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
  message: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  deleteButton: {
    minHeight: 54,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
