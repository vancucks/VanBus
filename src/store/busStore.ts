import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Bus, BusStatus } from '../types/bus';
import { minutesAgo } from '../utils/date';

type BusFilter = {
  status?: BusStatus | 'TODOS';
  lineNumber?: string;
  busNumber?: string;
};

type BusState = {
  buses: Bus[];
  addBus: (data: { busNumber: string; lineNumber: string; status: BusStatus; userId: string }) => Bus;
  updateBus: (busId: string, data: { lineNumber: string; status: BusStatus }) => void;
  deleteBus: (busId: string, currentUserId: string) => boolean;
  getRecentBuses: () => Bus[];
  getLatestBuses: () => Bus[];
  getBusesByUser: (userId: string) => Bus[];
  getUserBuses: (userId: string) => Bus[];
  filterBuses: (filter: BusFilter) => Bus[];
};

const initialBuses: Bus[] = [
  {
    id: '1',
    busNumber: '2455',
    lineNumber: '1955',
    status: 'AR_GELANDO',
    userId: '1',
    createdAt: minutesAgo(2600),
    updatedAt: minutesAgo(5),
  },
  {
    id: '2',
    busNumber: '3120',
    lineNumber: '1751',
    status: 'VENTANDO',
    userId: '1',
    createdAt: minutesAgo(1800),
    updatedAt: minutesAgo(26),
  },
  {
    id: '3',
    busNumber: '4102',
    lineNumber: '1980',
    status: 'QUENTE',
    userId: '1',
    createdAt: minutesAgo(900),
    updatedAt: minutesAgo(90),
  },
  {
    id: '4',
    busNumber: '2788',
    lineNumber: '1602',
    status: 'AR_GELANDO',
    userId: '1',
    createdAt: minutesAgo(360),
    updatedAt: minutesAgo(180),
  },
];

const byUpdatedAt = (a: Bus, b: Bus) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
const byCreatedAt = (a: Bus, b: Bus) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

export const useBusStore = create<BusState>()(
  persist(
    (set, get) => ({
      buses: initialBuses,
      addBus: ({ busNumber, lineNumber, status, userId }) => {
        const now = new Date().toISOString();
        const bus: Bus = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          busNumber: busNumber.trim(),
          lineNumber: lineNumber.trim(),
          status,
          userId,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({ buses: [bus, ...state.buses] }));
        return bus;
      },
      updateBus: (busId, data) => {
        set((state) => ({
          buses: state.buses.map((bus) =>
            bus.id === busId
              ? {
                  ...bus,
                  lineNumber: data.lineNumber.trim(),
                  status: data.status,
                  updatedAt: new Date().toISOString(),
                }
              : bus,
          ),
        }));
      },
      deleteBus: (busId, currentUserId) => {
        const bus = get().buses.find((item) => item.id === busId);

        if (!bus || bus.userId !== currentUserId) {
          return false;
        }

        set((state) => ({ buses: state.buses.filter((item) => item.id !== busId) }));
        return true;
      },
      getRecentBuses: () => [...get().buses].sort(byUpdatedAt),
      getLatestBuses: () => get().getRecentBuses(),
      getBusesByUser: (userId) => get().buses.filter((bus) => bus.userId === userId).sort(byCreatedAt),
      getUserBuses: (userId) => get().getBusesByUser(userId),
      filterBuses: ({ status = 'TODOS', lineNumber = '', busNumber = '' }) =>
        get()
          .buses.filter((bus) => {
            const matchesStatus = status === 'TODOS' || bus.status === status;
            const matchesLine = bus.lineNumber.includes(lineNumber.trim());
            const matchesBus = bus.busNumber.includes(busNumber.trim());

            return matchesStatus && matchesLine && matchesBus;
          })
          .sort(byCreatedAt),
    }),
    {
      name: 'vanbus-buses',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ buses: state.buses }),
    },
  ),
);
