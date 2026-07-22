import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Text, View } from 'react-native';

import { DashboardScreen } from '../screens/DashboardScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { BudgetsScreen } from '../screens/BudgetsScreen';
import { AIAdvisorScreen } from '../screens/AIAdvisorScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useFinanceStore } from '../shared/useFinanceStore';
import { getThemeColors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export const AppNavigator: React.FC = () => {
  const { theme } = useFinanceStore();
  const c = getThemeColors(theme);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: c.tabBar,
            borderTopColor: c.cardBorder,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
            position: 'absolute',
          },
          tabBarActiveTintColor: c.tabActive,
          tabBarInactiveTintColor: c.tabInactive,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '800' },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📊</Text>,
          }}
        />
        <Tab.Screen
          name="Ledger"
          component={TransactionsScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>↗️</Text>,
          }}
        />
        <Tab.Screen
          name="Budgets"
          component={BudgetsScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🐷</Text>,
          }}
        />
        <Tab.Screen
          name="AI Advisor"
          component={AIAdvisorScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🤖</Text>,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⚙️</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
