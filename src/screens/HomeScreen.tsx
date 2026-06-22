import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { BusCard } from '../components/BusCard';
import { Header } from '../components/Header';
import { ScreenContainer } from '../components/ScreenContainer';
import { useBusStore } from '../store/busStore';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { Bus } from '../types/bus';

export const HomeScreen = () => {
  const buses = useBusStore((state) => state.buses);
  const fetchBuses = useBusStore((state) => state.fetchBuses);
  const isLoading = useBusStore((state) => state.isLoading);
  const error = useBusStore((state) => state.error);
  const theme = useThemeStore((state) => state.theme);
  const colors = getColors(theme);

  useFocusEffect(
    useCallback(() => {
      fetchBuses();
    }, [fetchBuses]),
  );

  const latestBuses = useMemo(
    () => [...buses].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [buses],
  );

  const renderItem = useCallback(({ item }: { item: Bus }) => <BusCard bus={item} />, []);

  return (
    <ScreenContainer>
      <Header showBell />
      <FlatList
        data={latestBuses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchBuses} tintColor={colors.primary} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.heading}>
            <Text style={[styles.title, { color: colors.text }]}>Últimos ônibus</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Cadastrados ou modificados</Text>
            {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
          </View>
        }
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
  error: {
    fontSize: 13,
    fontWeight: '800',
  },
  separator: {
    height: spacing.md,
  },
});
