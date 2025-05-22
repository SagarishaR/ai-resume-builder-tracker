import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MainScreen from './MainScreen';
import Timeline from './Timeline';
import TrackerScreen from './TrackerScreen';
import PrintScreen from './PrintScreen';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Templates') {
            iconName = 'description';
          } else if (route.name === 'Tracker') {
            iconName = 'track-changes';
          } else if (route.name === 'Print') {
            iconName = 'print';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          let iconColor = focused ? '#9370DB' : '#000000';

          return <Icon name={iconName} size={size} color={iconColor} />;
        },
        tabBarActiveTintColor: '#9370DB',
        tabBarInactiveTintColor: '#000000',
        tabBarStyle: {
          backgroundColor: '#fff',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          height: 60,
          borderTopWidth: 1,
          borderTopColor: '#ddd'
        },
        tabBarLabelStyle: { fontSize: 12 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={MainScreen} />
      <Tab.Screen name="Templates" component={Timeline} />
      <Tab.Screen name="Tracker" component={TrackerScreen} />
      <Tab.Screen name="Print" component={PrintScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default BottomTabNavigator;
