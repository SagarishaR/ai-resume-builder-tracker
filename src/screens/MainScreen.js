import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import TemplateCards from "./TemplateCards";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ResumeSlides from './ResumeSlides';
import TrackerScreen from './TrackerScreen';
import PrintScreen from './PrintScreen';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();

const HomeScreen = ({ navigation, route }) => {
  // Ensure username is passed correctly from route params
  const username = route?.params?.username || "Guest";
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.topBar}>
          <Text style={styles.welcomeText}>Welcome, {username}!</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile", { username })}
            style={styles.menuButton}
          >
            <Ionicons name="menu" size={30} color="#333" />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.sectionTitle}>Resume Builder</Text>
          <TemplateCards navigation={navigation} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const MainScreen = ({ route }) => {
  // Pass the username from the parent route to the Tab Navigator
  const username = route?.params?.username || "Guest";

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Templates') {
            iconName = 'document-text';
          } else if (route.name === 'Tracker') {
            iconName = 'analytics';
          } else if (route.name === 'Print') {
            iconName = 'print';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Ionicons name={iconName} size={size} color={focused ? '#9370DB' : '#000000'} />;
        },
        tabBarActiveTintColor: '#9370DB',
        tabBarInactiveTintColor: '#000000',
        tabBarStyle: { backgroundColor: '#fff', position: 'absolute', bottom: 0, left: 0, right: 0, elevation: 0, height: 60, borderTopWidth: 1, borderTopColor: '#ddd' },
        tabBarLabelStyle: { fontSize: 12 },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        initialParams={{ username }} // Pass username to HomeScreen
      />
      <Tab.Screen 
        name="Templates" 
        component={ResumeSlides} 
        initialParams={{ username }} 
      />
      <Tab.Screen 
        name="Tracker" 
        component={TrackerScreen} 
        initialParams={{ username }} 
      />
     
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        initialParams={{ username }} 
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  mainContent: { flex: 1 },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 80 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  welcomeText: { fontSize: 20, fontWeight: "bold", color: "#333" },
  menuButton: { padding: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10, color: "#333" },
  content: { marginTop: 20, fontSize: 16, textAlign: "center" },
});

export default MainScreen;