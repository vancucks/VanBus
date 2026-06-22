import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { BottomTabs } from '../components/BottomTabs';
import { AddBusScreen } from '../screens/AddBusScreen';
import { BusDetailsScreen } from '../screens/BusDetailsScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export type RootTabParamList = {
  Home: undefined;
  History: undefined;
  AddBus: undefined;
  BusDetails: { busId: string };
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export const TabNavigator = () => (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={{ headerShown: false }}
    tabBar={(props) => <BottomTabs {...props} />}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Inicio' }} />
    <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: 'Historico' }} />
    <Tab.Screen name="AddBus" component={AddBusScreen} options={{ tabBarLabel: 'Adicionar' }} />
    <Tab.Screen name="BusDetails" component={BusDetailsScreen} options={{ tabBarButton: () => null, tabBarLabel: 'Detalhes' }} />
    <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Configuracoes' }} />
  </Tab.Navigator>
);
