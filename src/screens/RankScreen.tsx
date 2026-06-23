import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Header } from '../components/Header';
import { ScreenContainer } from '../components/ScreenContainer';
import { RootTabParamList } from '../navigation/TabNavigator';
import { useAuthStore } from '../store/authStore';
import { useBusStore } from '../store/busStore';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { User } from '../types/user';
import { formatDate } from '../utils/date';

type RankNavigation = BottomTabNavigationProp<RootTabParamList, 'Rank'>;

type RankedUser = User & {
  busCount: number;
  position: number;
};

const medalColors = ['#F59E0B', '#94A3B8', '#B45309'];

export const RankScreen = () => {
  const navigation = useNavigation<RankNavigation>();
  const users = useAuthStore((state) => state.users);
  const loadProfiles = useAuthStore((state) => state.loadProfiles);
  const buses = useBusStore((state) => state.buses);
  const fetchBuses = useBusStore((state) => state.fetchBuses);
  const isLoading = useBusStore((state) => state.isLoading);
  const theme = useThemeStore((state) => state.theme);
  const colors = getColors(theme);

  const refreshRank = useCallback(() => {
    loadProfiles();
    fetchBuses();
  }, [fetchBuses, loadProfiles]);

  useFocusEffect(
    useCallback(() => {
      refreshRank();
    }, [refreshRank]),
  );

  const rankedUsers = useMemo<RankedUser[]>(() => {
    const counts = buses.reduce<Record<string, number>>((acc, bus) => {
      acc[bus.userId] = (acc[bus.userId] ?? 0) + 1;
      return acc;
    }, {});

    return users
      .map((user) => ({ ...user, busCount: counts[user.id] ?? 0 }))
      .sort((a, b) => b.busCount - a.busCount || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((user, index) => ({ ...user, position: index + 1 }));
  }, [buses, users]);

  const renderItem = useCallback(
    ({ item }: { item: RankedUser }) => {
      const isTopThree = item.position <= 3;
      const highlight = isTopThree ? medalColors[item.position - 1] : colors.primary;

      return (
        <Pressable
          onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
          style={({ pressed }) => [
            styles.rankCard,
            {
              backgroundColor: colors.card,
              borderColor: isTopThree ? highlight : colors.border,
              opacity: pressed ? 0.86 : 1,
            },
          ]}
        >
          <View style={[styles.positionBadge, { backgroundColor: isTopThree ? highlight : `${colors.primary}18` }]}>
            {isTopThree ? (
              <Ionicons name="trophy" size={20} color="#FFFFFF" />
            ) : (
              <Text style={[styles.positionText, { color: colors.primary }]}>{item.position}</Text>
            )}
          </View>
          <View style={styles.rankInfo}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.joinedAt, { color: colors.muted }]}>Entrou em {formatDate(item.createdAt)}</Text>
          </View>
          <View style={styles.countBox}>
            <Text style={[styles.count, { color: colors.text }]}>{item.busCount}</Text>
            <Text style={[styles.countLabel, { color: colors.muted }]}>onibus</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </Pressable>
      );
    },
    [colors, navigation],
  );

  return (
    <ScreenContainer>
      <Header />
      <FlatList
        data={rankedUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshRank} tintColor={colors.primary} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.heading}>
            <Text style={[styles.title, { color: colors.text }]}>Rank</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Usuarios por onibus cadastrados</Text>
          </View>
        }
        ListEmptyComponent={<Text style={[styles.empty, { color: colors.muted }]}>Nenhum usuario encontrado.</Text>}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingTop: spacing.lg,
    paddingBottom: 110,
  },
  heading: {
    marginBottom: spacing.lg,
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
  rankCard: {
    minHeight: 92,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  positionBadge: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionText: {
    fontSize: 16,
    fontWeight: '900',
  },
  rankInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '900',
  },
  joinedAt: {
    fontSize: 12,
    fontWeight: '700',
  },
  countBox: {
    alignItems: 'center',
    minWidth: 58,
  },
  count: {
    fontSize: 22,
    fontWeight: '900',
  },
  countLabel: {
    fontSize: 11,
    fontWeight: '800',
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
