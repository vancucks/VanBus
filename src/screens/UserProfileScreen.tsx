import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BusCard } from '../components/BusCard';
import { Header } from '../components/Header';
import { ScreenContainer } from '../components/ScreenContainer';
import { RootTabParamList } from '../navigation/TabNavigator';
import { BusFavorite, useFavoriteStore } from '../store/favoriteStore';
import { useAuthStore } from '../store/authStore';
import { useBusStore } from '../store/busStore';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { Bus } from '../types/bus';
import { formatDate } from '../utils/date';

type UserProfileRoute = RouteProp<RootTabParamList, 'UserProfile'>;
type UserProfileNavigation = BottomTabNavigationProp<RootTabParamList, 'UserProfile'>;

export const UserProfileScreen = () => {
  const route = useRoute<UserProfileRoute>();
  const navigation = useNavigation<UserProfileNavigation>();
  const users = useAuthStore((state) => state.users);
  const loadProfiles = useAuthStore((state) => state.loadProfiles);
  const buses = useBusStore((state) => state.buses);
  const fetchBuses = useBusStore((state) => state.fetchBuses);
  const getUserFavorites = useFavoriteStore((state) => state.getUserFavorites);
  const theme = useThemeStore((state) => state.theme);
  const colors = getColors(theme);
  const [favorites, setFavorites] = useState<BusFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const user = useMemo(() => users.find((item) => item.id === route.params.userId), [route.params.userId, users]);
  const userBusCount = useMemo(() => buses.filter((bus) => bus.userId === route.params.userId).length, [buses, route.params.userId]);
  const favoriteBuses = useMemo(() => favorites.map((favorite) => favorite.bus).filter(Boolean) as Bus[], [favorites]);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([loadProfiles(), fetchBuses()]);
    const nextFavorites = await getUserFavorites(route.params.userId);
    setFavorites(nextFavorites);
    setIsLoading(false);
  }, [fetchBuses, getUserFavorites, loadProfiles, route.params.userId]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const renderFavorite = useCallback(({ item }: { item: Bus }) => <BusCard bus={item} variant="history" />, []);

  return (
    <ScreenContainer>
      <Header />
      <FlatList
        data={favoriteBuses}
        keyExtractor={(item) => item.id}
        renderItem={renderFavorite}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <Pressable onPress={() => navigation.navigate('Rank')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color={colors.primary} />
              <Text style={[styles.backText, { color: colors.primary }]}>Rank</Text>
            </Pressable>

            <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.avatar, { backgroundColor: `${colors.primary}20` }]}>
                <Ionicons name="person" size={30} color={colors.primary} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.name, { color: colors.text }]}>{user?.name ?? 'Usuario'}</Text>
                <Text style={[styles.joinedAt, { color: colors.muted }]}>
                  {user?.createdAt ? `Entrou em ${formatDate(user.createdAt)}` : 'Entrada nao encontrada'}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <StatCard label="onibus cadastrados" value={userBusCount} />
              <StatCard label="favoritos" value={favoriteBuses.length} />
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Onibus favoritos</Text>
            {isLoading ? <ActivityIndicator color={colors.primary} /> : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? null : <Text style={[styles.empty, { color: colors.muted }]}>Nenhum onibus favorito ainda.</Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => {
  const theme = useThemeStore((state) => state.theme);
  const colors = getColors(theme);

  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingTop: spacing.lg,
    paddingBottom: 110,
  },
  headerContent: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontSize: 15,
    fontWeight: '900',
  },
  profileCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
  },
  joinedAt: {
    fontSize: 13,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minHeight: 92,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    justifyContent: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  separator: {
    height: spacing.md,
  },
  empty: {
    textAlign: 'center',
    fontWeight: '700',
    paddingVertical: spacing.lg,
  },
});
