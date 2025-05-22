import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LoginScreen from "./src/screens/LoginScreen";
import MainScreen from "./src/screens/MainScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import forgotpassword from "./src/screens/forgotpassword";
import ProfileScreen from "./src/screens/ProfileScreen";
import ResumeSlides from "./src/screens/ResumeSlides";
import TrackerScreen from "./src/screens/TrackerScreen";
import minimal from "./src/screens/minimal";
import Ivy_League from "./src/screens/Ivy_League";
import PrintScreen from "./src/screens/PrintScreen";
import Timeline from "./src/screens/Timeline";
import freshers from "./src/screens/freshers";

import ATSScoreChecker from "./src/screens/ATSScoreChecker";
import MinimalScreen from "./src/screens/MinimalScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={MainScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ForgotPassword" component={forgotpassword} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="ResumeSlides" component={ResumeSlides} />
        <Stack.Screen name="TrackerScreen" component={TrackerScreen} />
        <Stack.Screen name="minimal" component={minimal} />
        <Stack.Screen name="Ivy_League" component={Ivy_League} />
        <Stack.Screen name="Timeline" component={Timeline} />
        <Stack.Screen name="PrintScreen" component={PrintScreen} />
        <Stack.Screen name="freshers" component={freshers} />
        
        <Stack.Screen name="MinimalScreen" component={MinimalScreen} options={{ title: "Classic" }} />
        <Stack.Screen name="ATSScoreChecker" component={ATSScoreChecker} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
