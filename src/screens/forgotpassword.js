import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";

// Mock function to simulate email reset handling (you can replace it with actual API call)
const sendResetLink = async (email) => {
  try {
    const response = await fetch("http://10.0.2.2:5001/reset-password", {  // Update this to your actual backend endpoint
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error("Failed to send reset email");
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    setLoading(true);

    const isSuccess = await sendResetLink(email);

    if (isSuccess) {
      Alert.alert("Success", "Password reset link sent to your email!");
      navigation.navigate("Login"); // Navigate to login page after successful reset email sent
    } else {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="Enter your email" 
        placeholderTextColor="#888" 
        value={email} 
        onChangeText={setEmail} 
        keyboardType="email-address"
      />
      
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <Text style={styles.buttonText}>Sending...</Text> // Loading text
        ) : (
          <Text style={styles.buttonText}>Submit</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.textButton}>
        <Text style={styles.textButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" },
  title: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 20 },
  input: { width: "80%", padding: 10, marginBottom: 15, borderWidth: 1, borderRadius: 5, borderColor: "#ccc" },
  button: { backgroundColor: "#9370DB", padding: 12, borderRadius: 5, alignItems: "center", width: "80%" },
  buttonText: { color: "#FFF", fontWeight: "bold" },
  textButton: { marginTop: 10 },
  textButtonText: { color: "#555", fontSize: 14 },
});

export default ForgotPassword;
