import React, { useRef, useEffect, useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Animated, Image, Alert, ActivityIndicator
} from "react-native";
import { registerUser } from "./database";

const SignUpScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;

  const [titleText, setTitleText] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const fullTitle = "Create an Account";

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

  const handleSignUp = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill all fields!");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const success = await registerUser(username, email, password);
      if (success) {
        // ✅ Send welcome email via server
        await fetch("http://10.0.2.2:5001/signup", {

          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name: username })
        });

        Alert.alert("Success", "Account created successfully!");
        navigation.navigate("Main", { username });
      } else {
        Alert.alert("Error", "Email or Username already exists!");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.Image 
        source={require("../assets/front_logo-Photoroom.png")} 
        style={[styles.logo, { transform: [{ translateY: logoAnim }] }]} 
      />

      <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.title}>{titleText}</Text>

        <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <TextInput style={styles.input} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

        <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Animated.Text style={[styles.buttonText, { transform: [{ scale: scaleAnim }] }]}>Sign Up</Animated.Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.textButton}>
          <Text style={styles.textButtonText}>
            Already have an account? <Text style={styles.linkText}>Login</Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" },
  formContainer: { width: "80%", padding: 20, alignItems: "center" },
  logo: { width: 100, height: 100, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 20 },
  input: { width: "100%", padding: 10, marginBottom: 15, borderWidth: 1, borderRadius: 5 },
  button: { backgroundColor: "#9370DB", padding: 12, borderRadius: 5, alignItems: "center", width: "100%" },
  buttonText: { color: "#FFF", fontWeight: "bold" },
  textButton: { marginTop: 10 },
  textButtonText: { color: "#555", fontSize: 14 },
  linkText: { color: "#9370DB", fontWeight: "bold" },
});

export default SignUpScreen;
