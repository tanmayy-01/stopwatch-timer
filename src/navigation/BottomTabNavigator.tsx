import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Stopwatch from '../screens/Stopwatch';
import Timer from '../screens/Timer';
import Ionicons from '@react-native-vector-icons/ionicons';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#222222',
          borderTopColor: '#222222',
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#777777',
      }}
    >
      <Tab.Screen
        name="Stopwatch"
        component={Stopwatch}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="stopwatch-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Timer"
        component={Timer}
        options={{
          tabBarIcon: ({ size, color }) => (
             <Ionicons name="hourglass-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
