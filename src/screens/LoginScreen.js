import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, Image, Alert, ActivityIndicator,
} from 'react-native';
import { authenticateUser } from './database';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Added for eye icon

const LoginScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const [titleText, setTitleText] = useState('');
  const fullTitle = 'Login to Vergo';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(logoAnim, { toValue: -10, duration: 1500, useNativeDriver: true }),
        Animated.timing(logoAnim, { toValue: 10, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    let index = 0;
    const interval = setInterval(() => {
      setTitleText(fullTitle.substring(0, index));
      index++;
      if (index > fullTitle.length) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Bruh, you gotta fill in email and password. No cap.');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Error', 'That email ain’t valid, fam.');
      return;
    }

    setLoading(true);
    try {
      const response = await authenticateUser(email, password);
      if (response.success) {
        setEmail('');
        setPassword('');
        Alert.alert('Success', `Yo ${response.user.username}, you’re finna slay! 🔥`);
        navigation.navigate('Main', { username: response.user.username });
      } else {
        Alert.alert('Error', 'Email or password ain’t it. Try again, lowkey.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Something’s not bussin’. Try later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/front_logo-Photoroom.png')}
        style={[styles.logo, { transform: [{ translateY: logoAnim }] }]}
      />
      <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.title}>{titleText}</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Icon
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={24}
              color="#555"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.textButton}>
          <Text style={styles.textButtonText}>Forgot Password? Yeet it!</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.textButton}>
          <Text style={styles.textButtonText}>
            No account? <Text style={styles.linkText}>Sign Up, let’s vibe!</Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  formContainer: { width: '80%', padding: 20, alignItems: 'center' },
  logo: { width: 100, height: 100, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#9370DB',
    borderRadius: 5,
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0, // Remove bottom margin to align with eye button
  },
  eyeButton: {
    padding: 10,
    position: 'absolute',
    right: 0,
  },
  button: { backgroundColor: '#9370DB', padding: 12, borderRadius: 5, alignItems: 'center', width: '100%' },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
  textButton: { marginTop: 10 },
  textButtonText: { color: '#555', fontSize: 14 },
  linkText: { color: '#9370DB', fontWeight: 'bold' },
});

export default LoginScreen;