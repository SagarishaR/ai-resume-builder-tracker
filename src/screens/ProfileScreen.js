import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
  Animated,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';

const fallbackUser = {
  name: 'Guest User',
  email: 'guest@example.com',
  profilePicture: 'https://via.placeholder.com/150',
  notifications: true,
};

const ProfileScreen = () => {
  const route = useRoute();
  const initialUser = {
    name: route.params?.username || fallbackUser.name,
    email: route.params?.email || fallbackUser.email,
    profilePicture: fallbackUser.profilePicture,
    notifications: fallbackUser.notifications,
    darkMode: false,
  };

  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const buttonScale = useState(new Animated.Value(1))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [isEditing, fadeAnim]);

  const handleSaveProfile = () => {
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated!');
  };

  const handleChangePicture = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 300,
        maxHeight: 300,
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.error('Image Picker Error: ', response.errorMessage);
          Alert.alert('Error', 'Something went wrong while picking the image.');
        } else {
          const uri = response.assets?.[0]?.uri;
          if (uri) {
            setUser((prev) => ({ ...prev, profilePicture: uri }));
          }
        }
      }
    );
  };

  const toggleDarkMode = () => {
    setUser((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const toggleNotifications = () => {
    setUser((prev) => ({ ...prev, notifications: !prev.notifications }));
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => Alert.alert('Logged out', 'You have been logged out.'),
      },
    ]);
  };

  const animatePress = (scale) => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.94,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 50,
      paddingHorizontal: 20,
      backgroundColor: user.darkMode ? '#121212' : '#F9FAFB',
    },
    profileImageContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 4,
      borderColor: '#3B82F6',
    },
    card: {
      backgroundColor: user.darkMode ? '#1F2937' : '#FFFFFF',
      padding: 20,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: 'center',
      color: user.darkMode ? '#F3F4F6' : '#111827',
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 6,
      color: user.darkMode ? '#D1D5DB' : '#374151',
    },
    input: {
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      backgroundColor: user.darkMode ? '#374151' : '#FFFFFF',
      color: user.darkMode ? '#FFFFFF' : '#111827',
    },
    button: {
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 10,
    },
    saveButton: {
      backgroundColor: '#06b6d4',
    },
    editButton: {
      backgroundColor: '#3b82f6',
    },
    logoutButton: {
      backgroundColor: '#f43f5e',
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: user.profilePicture }} style={styles.profileImage} />
          {isEditing && (
            <TouchableOpacity onPress={handleChangePicture}>
              <Text style={{ color: '#3B82F6', marginTop: 8, fontWeight: '600' }}>
                Change Picture
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={user.name}
            editable={isEditing}
            onChangeText={(text) => setUser({ ...user, name: text })}
          />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={user.email}
            editable={isEditing}
            keyboardType="email-address"
            onChangeText={(text) => setUser({ ...user, email: text })}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Preferences</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={styles.label}>Dark Mode 🌙</Text>
            <Switch
              value={user.darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor={user.darkMode ? '#FFFFFF' : '#F9FAFB'}
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.label}>Notifications 🔔</Text>
            <Switch
              value={user.notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor={user.notifications ? '#FFFFFF' : '#F9FAFB'}
            />
          </View>
        </View>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[styles.button, isEditing ? styles.saveButton : styles.editButton]}
            onPressIn={() => animatePress(buttonScale)}
            onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
          >
            <Text style={styles.buttonText}>{isEditing ? 'Save Profile' : 'Edit Profile'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPressIn={() => animatePress(buttonScale)}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );
};

export default ProfileScreen;
