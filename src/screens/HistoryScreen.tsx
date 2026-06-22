import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { BusCard } from '../components/BusCard';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { ScreenContainer } from '../components/ScreenContainer';
import { statusLabel } from '../components/StatusBadge';
import { useBusStore } from '../store/busStore';
import { useThemeStore } from '../store/themeStore';
import { getColors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { Bus, BusStatus } from '../types/bus';

const statusOptions: (BusStatus | 'TODOS')[] = ['TODOS', 'AR_GELANDO', 'VENTANDO', 'QUENTE'];

export const HistoryScreen = () => {
  const buses = useBusStore((state) => state.buses);
  const theme = useThemeStore((state) => state.theme);
  const colors = getColors(theme);
  const [draftStatus, setDraftStatus] = useState<BusStatus | 'TODOS'>('TODOS');
  const [draftLine, setDraftLine] = useState('');
  const [draftBus, setDraftBus] = useState('');
  const [filters, setFilters] = useState({ status: 'TODOS' as BusStatus | 'TODOS', lineNumber: '', busNumber: '' });

  const filteredBuses = useMemo(
    () =>
      buses
        .filter((bus) => {
          const matchesStatus = filters.status === 'TODOS' || bus.status === filters.status;
          const matchesLine = bus.lineNumber.includes(filters.lineNumber.trim());
          const matchesBus = bus.busNumber.includes(filters.busNumber.trim());

          return matchesStatus && matchesLine && matchesBus;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [buses, filters],
  );

  const applyFilters = useCallback(() => {
    setFilters({ status: draftStatus, lineNumber: draftLine, busNumber: draftBus });
  }, [draftBus, draftLine, draftStatus]);

  const renderItem = useCallback(({ item }: { item: Bus }) => <BusCard bus={item} variant="history" />, []);

  return (
    <ScreenContainer>
      <Header />
      <FlatList
        data={filteredBuses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={styles.heading}>
              <Text style={[styles.title, { color: colors.text }]}>Histórico</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>Todos os ônibus cadastrados</Text>
            </View>

            <View style={[styles.filterCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.filterTitle, { color: colors.text }]}>Filtros</Text>
              <View style={styles.statusGrid}>
                {statusOptions.map((status) => {
                  const active = draftStatus === status;
                  const label = status === 'TODOS' ? 'Todos' : statusLabel[status];

                  return (
                    <Pressable
                      key={status}
                      onPress={() => setDraftStatus(status)}
                      style={[
                        styles.statusOption,
                        { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? `${colors.primary}18` : colors.input },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: active ? colors.primary : colors.muted }]}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Input icon="git-branch-outline" keyboardType="number-pad" onChangeText={setDraftLine} placeholder="Linha" value={draftLine} />
              <Input icon="bus-outline" keyboardType="number-pad" onChangeText={setDraftBus} placeholder="Ônibus" value={draftBus} />
              <Button title="Aplicar filtros" onPress={applyFilters} />
            </View>
          </View>
        }
        ListEmptyComponent={<Text style={[styles.empty, { color: colors.muted }]}>Nenhum ônibus encontrado.</Text>}
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
    marginBottom: spacing.lg,
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
  filterCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusOption: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
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
